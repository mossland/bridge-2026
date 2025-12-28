import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OutcomesController } from './outcomes.controller';
import { OutcomesService } from './outcomes.service';
import { OutcomeEntity } from '../entities/outcome.entity';

@Module({
  imports: [TypeOrmModule.forFeature([OutcomeEntity])],
  controllers: [OutcomesController],
  providers: [OutcomesService],
  exports: [OutcomesService],
})
export class OutcomesModule {}

