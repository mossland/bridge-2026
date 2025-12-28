import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { Outcome } from '@bridge-2026/shared';

@Entity('outcomes')
@Index(['proposalId', 'status'])
export class OutcomeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  proposalId: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  status: string;

  @Column({ type: 'jsonb' })
  kpiBefore: Record<string, number>;

  @Column({ type: 'jsonb' })
  kpiAfter: Record<string, number>;

  @Column({ type: 'jsonb', nullable: true })
  executionStatus: {
    completed: boolean;
    error?: string;
    steps: Array<{
      name: string;
      status: string;
      timestamp: number;
    }>;
  } | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  proofAnchor: string | null;

  @Column({ type: 'bigint' })
  evaluatedAt: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toOutcome(): Outcome {
    return {
      id: this.id,
      proposalId: this.proposalId,
      status: this.status as Outcome['status'],
      kpiBefore: this.kpiBefore,
      kpiAfter: this.kpiAfter,
      executionStatus: this.executionStatus,
      proofAnchor: this.proofAnchor,
      evaluatedAt: this.evaluatedAt,
      updatedAt: this.updatedAt.getTime(),
    };
  }
}

