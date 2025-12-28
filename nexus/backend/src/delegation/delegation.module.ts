import { Module } from '@nestjs/common';
import { DelegationController } from './delegation.controller';
import { DelegationService } from './delegation.service';

@Module({
  controllers: [DelegationController],
  providers: [DelegationService],
  exports: [DelegationService],
})
export class DelegationModule {}

