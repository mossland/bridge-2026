import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DelegationController } from './delegation.controller';
import { DelegationService } from './delegation.service';
import { DelegationPolicyEntity } from '../entities/delegation-policy.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DelegationPolicyEntity])],
  controllers: [DelegationController],
  providers: [DelegationService],
  exports: [DelegationService],
})
export class DelegationModule {}

