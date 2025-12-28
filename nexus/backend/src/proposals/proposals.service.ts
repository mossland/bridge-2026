import { Injectable, NotFoundException } from '@nestjs/common';
import { governanceService } from '@bridge-2026/human-governance';
import type { Proposal, Vote } from '@bridge-2026/shared';
import { VoteDto } from './dto/vote.dto';
import { BlockchainService } from '../blockchain/blockchain.service';

@Injectable()
export class ProposalsService {
  private proposals: Map<string, Proposal> = new Map();
  private votes: Map<string, Vote[]> = new Map();

  constructor(private readonly blockchainService: BlockchainService) {}

  async getProposals(options: {
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ proposals: Proposal[]; total: number }> {
    let filtered = Array.from(this.proposals.values());

    if (options.status) {
      filtered = filtered.filter(p => p.status === options.status);
    }

    // 최신순 정렬
    filtered.sort((a, b) => b.createdAt - a.createdAt);

    const total = filtered.length;
    const proposals = filtered.slice(
      options.offset,
      options.offset + options.limit
    );

    return { proposals, total };
  }

  async getProposal(id: string): Promise<Proposal | null> {
    return this.proposals.get(id) || null;
  }

  async castVote(
    proposalId: string,
    voteDto: VoteDto,
  ): Promise<{ success: boolean; txHash?: string }> {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== 'active') {
      throw new Error(`Proposal ${proposalId} is not active`);
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

      // 메모리에 저장
      const votes = this.votes.get(proposalId) || [];
      votes.push(vote);
      this.votes.set(proposalId, votes);

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
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new NotFoundException(`Proposal ${proposalId} not found`);
    }

    const result = await governanceService.calculateProposalResult(proposalId);

    return {
      passed: result.passed,
      totalVotes: result.totalVotes,
      yesVotes: result.yesVotes,
      noVotes: result.noVotes,
    };
  }

  /**
   * Moss Coin 잔액을 조회하여 투표 가중치를 계산합니다.
   */
  private async getVoteWeight(address: string): Promise<number> {
    return this.blockchainService.getBalance(address);
  }
}

