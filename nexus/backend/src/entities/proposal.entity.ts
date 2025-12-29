import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import type { Proposal } from '@bridge-2026/shared';
import { VoteEntity } from './vote.entity';

@Entity('proposals')
@Index(['status', 'createdAt'])
export class ProposalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  status: string;

  @Column({ type: 'varchar', length: 50 })
  type: string;

  @Column({ type: 'jsonb', nullable: true })
  action: {
    type: string;
    params: Record<string, any>;
  } | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  decisionPacketId: string | null;

  @Column({ type: 'bigint' })
  createdAt: number;

  @Column({ type: 'bigint' })
  updatedAt: number;

  @Column({ type: 'bigint', nullable: true })
  startTime: number | null;

  @Column({ type: 'bigint', nullable: true })
  endTime: number | null;

  @Column({ type: 'jsonb', nullable: true })
  result: {
    passed: boolean;
    totalVotes: number;
    yesVotes: number;
    noVotes: number;
    abstainVotes: number;
  } | null;

  @OneToMany(() => VoteEntity, vote => vote.proposal)
  votes: VoteEntity[];

  @CreateDateColumn()
  dbCreatedAt: Date;

  @UpdateDateColumn()
  dbUpdatedAt: Date;

  toProposal(): Proposal {
    return {
      id: this.id,
      title: this.title,
      description: this.description,
      status: this.status as Proposal['status'],
      type: this.type as Proposal['type'],
      action: this.action,
      decisionPacketId: this.decisionPacketId,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      startTime: this.startTime,
      endTime: this.endTime,
      result: this.result,
    };
  }
}




