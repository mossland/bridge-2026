import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SignalsModule } from './signals/signals.module';
import { ProposalsModule } from './proposals/proposals.module';
import { DelegationModule } from './delegation/delegation.module';
import { OutcomesModule } from './outcomes/outcomes.module';
import { HealthModule } from './health/health.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    HealthModule,
    SignalsModule,
    ProposalsModule,
    DelegationModule,
    OutcomesModule,
    BlockchainModule,
  ],
})
export class AppModule {}

