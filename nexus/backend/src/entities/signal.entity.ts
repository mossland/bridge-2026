import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import type { Signal } from '@bridge-2026/shared';

@Entity('signals')
@Index(['metadata_sourceType', 'metadata_timestamp'])
export class SignalEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 50 })
  @Index()
  metadata_sourceType: string;

  @Column({ type: 'bigint' })
  @Index()
  metadata_timestamp: number;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  attestation: {
    signature?: string;
    device?: string;
    user?: string;
    confidence?: number;
  } | null;

  @Column({ type: 'text', array: true, default: [] })
  tags: string[];

  @Column({ type: 'varchar', length: 255, nullable: true })
  hash: string | null;

  @CreateDateColumn()
  createdAt: Date;

  toSignal(): Signal {
    return {
      id: this.id,
      metadata: {
        sourceType: this.metadata_sourceType,
        timestamp: this.metadata_timestamp,
      },
      payload: this.payload,
      attestation: this.attestation,
      tags: this.tags,
    };
  }
}


