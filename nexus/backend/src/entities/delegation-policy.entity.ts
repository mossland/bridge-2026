import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import type { DelegationPolicy } from '@bridge-2026/shared';

@Entity('delegation_policies')
@Index(['wallet', 'agent_id'])
export class DelegationPolicyEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  @Index()
  wallet: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  agent_id: string;

  @Column({ type: 'jsonb', nullable: true })
  scope: {
    categories?: string[];
    tags?: string[];
    exclude_categories?: string[];
    exclude_tags?: string[];
  } | null;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  max_budget_per_month: number | null;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  max_budget_per_proposal: number | null;

  @Column({ type: 'boolean', default: true })
  no_vote_on_emergency: boolean;

  @Column({ type: 'integer' })
  cooldown_window_hours: number;

  @Column({ type: 'boolean', default: false })
  veto_enabled: boolean;

  @Column({ type: 'decimal', precision: 20, scale: 2, nullable: true })
  require_human_review_above: number | null;

  @Column({ type: 'integer', nullable: true })
  max_votes_per_day: number | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  toDelegationPolicy(): DelegationPolicy & { id: string; createdAt: number } {
    return {
      id: this.id,
      wallet: this.wallet,
      agent_id: this.agent_id,
      scope: this.scope || {},
      max_budget_per_month: this.max_budget_per_month
        ? parseFloat(this.max_budget_per_month.toString())
        : undefined,
      max_budget_per_proposal: this.max_budget_per_proposal
        ? parseFloat(this.max_budget_per_proposal.toString())
        : undefined,
      no_vote_on_emergency: this.no_vote_on_emergency,
      cooldown_window_hours: this.cooldown_window_hours,
      veto_enabled: this.veto_enabled,
      require_human_review_above: this.require_human_review_above
        ? parseFloat(this.require_human_review_above.toString())
        : undefined,
      max_votes_per_day: this.max_votes_per_day || undefined,
      createdAt: this.createdAt.getTime(),
    };
  }
}









