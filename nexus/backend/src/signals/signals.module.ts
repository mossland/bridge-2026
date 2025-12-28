import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SignalsController } from './signals.controller';
import { SignalsService } from './signals.service';
import { SignalEntity } from '../entities/signal.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SignalEntity])],
  controllers: [SignalsController],
  providers: [SignalsService],
  exports: [SignalsService],
})
export class SignalsModule {}

