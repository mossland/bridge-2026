import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
} from '@nestjs/common';
import { DelegationService } from './delegation.service';
import { CreateDelegationPolicyDto } from './dto/create-delegation-policy.dto';
import type { DelegationPolicy } from '@bridge-2026/shared';

@Controller('api/delegation')
export class DelegationController {
  constructor(private readonly delegationService: DelegationService) {}

  @Get('policies')
  async getPolicies(
    @Query('wallet') wallet?: string,
  ): Promise<Array<DelegationPolicy & { id: string; createdAt: number }>> {
    if (wallet) {
      return this.delegationService.getPoliciesByWallet(wallet);
    }
    return this.delegationService.getAllPolicies();
  }

  @Post('policies')
  async createPolicy(
    @Body() createDto: CreateDelegationPolicyDto,
  ): Promise<DelegationPolicy & { id: string; createdAt: number }>> {
    return this.delegationService.createPolicy(createDto);
  }

  @Delete('policies/:id')
  async deletePolicy(@Param('id') id: string): Promise<{ success: boolean }> {
    return this.delegationService.deletePolicy(id);
  }
}




