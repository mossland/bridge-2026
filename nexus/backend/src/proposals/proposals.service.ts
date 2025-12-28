import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { governanceService } from '@bridge-2026/human-governance';
import type { Proposal, Vote } from '@bridge-2026/shared';
import { VoteDto } from './dto/vote.dto';
import { BlockchainService } from '../blockchain/blockchain.service';
import { ProposalEntity } from '../entities/proposal.entity';
import { VoteEntity } from '../entities/vote.entity';

@Injectable()
export class ProposalsService {
  constructor(
    @InjectRepository(ProposalEntity)
    private proposalRepository: Repository<ProposalEntity>,
    @InjectRepository(VoteEntity)
    private voteRepository: Repository<VoteEntity>,
    private readonly blockchainService: BlockchainService,
  ) {}

  async getProposals(options: {
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ proposals: Proposal[]; total: number }> {
    const queryBuilder = this.proposalRepository.createQueryBuilder('proposal');

    if (options.status) {
      queryBuilder.where('proposal.status = :status', { status: options.status });
    }

    const total = await queryBuilder.getCount();

    const entities = await queryBuilder
      .orderBy('proposal.createdAt', 'DESC')
      .skip(options.offset)
      .take(options.limit)
      .getMany();

    const proposals = entities.map(e => e.toProposal());

    return { proposals, total };
  }

  async getProposal(id: string): Promise<Proposal | null> {
    const entity = await this.proposalRepository.findOne({
      where: { id },
      relations: ['votes'],
    });

    return entity ? entity.toProposal() : null;
  }

  async castVote(
    proposalId: string,
    voteDto: VoteDto,
  ): Promise<{ success: boolean; txHash?: string }> {
    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'active') {
      throw new Error(`Proposal ${proposalId} is not active`);
    }

    // 중복 투표 확인
    const existingVote = await this.voteRepository.findOne({
      where: {
        proposalId,
        voterAddress: voteDto.voterAddress,
      },
    });

    if (existingVote) {
      throw new Error('Already voted');
    }

    // Moss Coin 잔액 조회 (투표 가중치 계산용)
    const weight = await this.getVoteWeight(voteDto.voterAddress);

    // 투표 기록
    try {
      const vote = await governanceService.castVote(
        proposalId,
        voteDto.voterAddress,
        voteDto.choice,
        weight,
        voteDto.txHash,
      );

      // 데이터베이스에 저장
      const voteEntity = new VoteEntity();
      voteEntity.proposalId = proposalId;
      voteEntity.voterAddress = voteDto.voterAddress;
      voteEntity.choice = voteDto.choice;
      voteEntity.weight = weight;
      voteEntity.txHash = vote.txHash || null;
      voteEntity.timestamp = Date.now();

      await this.voteRepository.save(voteEntity);

      return {
        success: true,
        txHash: vote.txHash,
      };
    } catch (error) {
      return {
        success: false,
      };
    }
  }

  async tallyVotes(proposalId: string): Promise<{
    passed: boolean;
    totalVotes: number;
    yesVotes: number;
    noVotes: number;
  }> {
    const proposal = await this.proposalRepository.findOne({
      where: { id: proposalId },
    });

    if (!proposal) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }

    // 데이터베이스에서 투표 집계
    const votes = await this.voteRepository.find({
      where: { proposalId },
    });

    let yesVotes = 0;
    let noVotes = 0;
    let abstainVotes = 0;

    for (const vote of votes) {
      const weight = parseFloat(vote.weight.toString());
      if (vote.choice === 'yes') {
        yesVotes += weight;
      } else if (vote.choice === 'no') {
        noVotes += weight;
      } else {
        abstainVotes += weight;
      }
    }

    const totalVotes = yesVotes + noVotes + abstainVotes;
    const passed = yesVotes > noVotes && totalVotes > 0;

    // 제안 결과 업데이트
    proposal.result = {
      passed,
      totalVotes,
      yesVotes,
      noVotes,
      abstainVotes,
    };
    await this.proposalRepository.save(proposal);

    return {
      passed,
      totalVotes,
      yesVotes,
      noVotes,
    };
  }

  /**
   * Moss Coin 잔액을 조회하여 투표 가중치를 계산합니다.
   */
  private async getVoteWeight(address: string): Promise<number> {
    return this.blockchainService.getBalance(address);
  }
}

