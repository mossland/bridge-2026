import { Controller, Get, Param, Query } from '@nestjs/common';
import { OutcomesService } from './outcomes.service';
import type { Outcome } from '@bridge-2026/shared';

@Controller('api/outcomes')
export class OutcomesController {
  constructor(private readonly outcomesService: OutcomesService) {}

  @Get()
  async getOutcomes(
    @Query('status') status?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ outcomes: Outcome[]; total: number }> {
    return this.outcomesService.getOutcomes({
      status,
      limit: limit || 50,
      offset: offset || 0,
    });
  }

  @Get(':id')
  async getOutcome(@Param('id') id: string): Promise<Outcome | null> {
    return this.outcomesService.getOutcome(id);
  }
}









