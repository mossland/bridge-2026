import { Injectable, NotFoundException } from '@nestjs/common';
import { delegationManager } from '@bridge-2026/human-governance';
import type { DelegationPolicy } from '@bridge-2026/shared';
import { CreateDelegationPolicyDto } from './dto/create-delegation-policy.dto';

@Injectable()
export class DelegationService {
  async getAllPolicies(): Promise<
    Array<DelegationPolicy & { id: string; createdAt: number }>
  > {
    // TODO: 실제 데이터베이스에서 조회
    return [];
  }

  async getPoliciesByWallet(
    wallet: string,
  ): Promise<Array<DelegationPolicy & { id: string; createdAt: number }>> {
    return delegationManager.getPoliciesByWallet(wallet);
  }

  async createPolicy(
    createDto: CreateDelegationPolicyDto,
  ): Promise<DelegationPolicy & { id: string; createdAt: number }> {
    return delegationManager.createPolicy(createDto);
  }

  async deletePolicy(id: string): Promise<{ success: boolean }> {
    try {
      delegationManager.deletePolicy(id);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }
}

