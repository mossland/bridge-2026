import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
  JoinColumn,
} from 'typeorm';
import type { Vote } from '@bridge-2026/shared';
import { ProposalEntity } from './proposal.entity';

@Entity('votes')
@Index(['proposalId', 'voterAddress'])
export class VoteEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  @Index()
  proposalId: string;

  @ManyToOne(() => ProposalEntity, proposal => proposal.votes)
  @JoinColumn({ name: 'proposalId' })
  proposal: ProposalEntity;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  voterAddress: string;

  @Column({ type: 'varchar', length: 20 })
  choice: string;

  @Column({ type: 'decimal', precision: 20, scale: 2 })
  weight: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  txHash: string | null;

  @Column({ type: 'bigint' })
  timestamp: number;

  @CreateDateColumn()
  createdAt: Date;

  toVote(): Vote {
    return {
      id: this.id,
      proposalId: this.proposalId,
      voterAddress: this.voterAddress,
      choice: this.choice as Vote['choice'],
      weight: parseFloat(this.weight.toString()),
      txHash: this.txHash,
      timestamp: this.timestamp,
    };
  }
}









