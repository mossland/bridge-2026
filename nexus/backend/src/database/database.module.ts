import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  SignalEntity,
  ProposalEntity,
  VoteEntity,
  DelegationPolicyEntity,
  OutcomeEntity,
} from '../entities';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        
        if (databaseUrl) {
          // PostgreSQL URL 형식: postgresql://user:password@host:port/database
          return {
            type: 'postgres',
            url: databaseUrl,
            entities: [
              SignalEntity,
              ProposalEntity,
              VoteEntity,
              DelegationPolicyEntity,
              OutcomeEntity,
            ],
            synchronize: configService.get<string>('NODE_ENV') === 'development',
            logging: configService.get<string>('NODE_ENV') === 'development',
          };
        }

        // Fallback: 환경 변수로부터 개별 설정
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_NAME', 'bridge2026'),
          entities: [
            SignalEntity,
            ProposalEntity,
            VoteEntity,
            DelegationPolicyEntity,
            OutcomeEntity,
          ],
          synchronize: configService.get<string>('NODE_ENV') === 'development',
          logging: configService.get<string>('NODE_ENV') === 'development',
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      SignalEntity,
      ProposalEntity,
      VoteEntity,
      DelegationPolicyEntity,
      OutcomeEntity,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}









