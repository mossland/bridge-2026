import { Controller, Get, Post, Query } from '@nestjs/common';
import { SignalsService } from './signals.service';
import type { Signal } from '@bridge-2026/shared';

@Controller('api/signals')
export class SignalsController {
  constructor(private readonly signalsService: SignalsService) {}

  @Get()
  async getSignals(
    @Query('sourceType') sourceType?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ): Promise<{ signals: Signal[]; total: number }> {
    return this.signalsService.getSignals({
      sourceType,
      limit: limit || 50,
      offset: offset || 0,
    });
  }

  @Post('collect')
  async collectSignals(): Promise<{ collected: number }> {
    return this.signalsService.collectSignals();
  }
}


