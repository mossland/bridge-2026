import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { delegationManager } from '@bridge-2026/human-governance';
import type { DelegationPolicy } from '@bridge-2026/shared';
import { CreateDelegationPolicyDto } from './dto/create-delegation-policy.dto';
import { DelegationPolicyEntity } from '../entities/delegation-policy.entity';

@Injectable()
export class DelegationService {
  constructor(
    @InjectRepository(DelegationPolicyEntity)
    private policyRepository: Repository<DelegationPolicyEntity>,
  ) {}

  async getAllPolicies(): Promise<
    Array<DelegationPolicy & { id: string; createdAt: number }>
  > {
    const entities = await this.policyRepository.find({
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => e.toDelegationPolicy());
  }

  async getPoliciesByWallet(
    wallet: string,
  ): Promise<Array<DelegationPolicy & { id: string; createdAt: number }>> {
    const entities = await this.policyRepository.find({
      where: { wallet },
      order: { createdAt: 'DESC' },
    });
    return entities.map(e => e.toDelegationPolicy());
  }

  async createPolicy(
    createDto: CreateDelegationPolicyDto,
  ): Promise<DelegationPolicy & { id: string; createdAt: number }> {
    // delegationManager를 통해 검증
    const policy = await delegationManager.createPolicy(createDto);

    // 데이터베이스에 저장
    const entity = new DelegationPolicyEntity();
    entity.wallet = createDto.wallet;
    entity.agent_id = createDto.agent_id;
    entity.scope = createDto.scope || null;
    entity.max_budget_per_month = createDto.max_budget_per_month || null;
    entity.max_budget_per_proposal = createDto.max_budget_per_proposal || null;
    entity.no_vote_on_emergency = createDto.no_vote_on_emergency;
    entity.cooldown_window_hours = createDto.cooldown_window_hours;
    entity.veto_enabled = createDto.veto_enabled;
    entity.require_human_review_above = createDto.require_human_review_above || null;
    entity.max_votes_per_day = createDto.max_votes_per_day || null;

    const saved = await this.policyRepository.save(entity);
    return saved.toDelegationPolicy();
  }

  async deletePolicy(id: string): Promise<{ success: boolean }> {
    try {
      const entity = await this.policyRepository.findOne({ where: { id } });
      if (!entity) {
        throw new NotFoundException(`Policy ${id} not found`);
      }

      await this.policyRepository.remove(entity);
      delegationManager.deletePolicy(id);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}

