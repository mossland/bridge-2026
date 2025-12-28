import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SignalsModule } from './signals/signals.module';
import { ProposalsModule } from './proposals/proposals.module';
import { DelegationModule } from './delegation/delegation.module';
import { OutcomesModule } from './outcomes/outcomes.module';
import { HealthModule } from './health/health.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { DatabaseModule } from './database/database.module';
import { LLMModule } from './llm/llm.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HealthModule,
    SignalsModule,
    ProposalsModule,
    DelegationModule,
    OutcomesModule,
    BlockchainModule,
    LLMModule,
  ],
})
export class AppModule {}

