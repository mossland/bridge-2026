import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Signal } from '@bridge-2026/shared';
import { SignalEntity } from '../entities/signal.entity';
import { realityOracle, OnChainCollector, CheckInCollector } from '@bridge-2026/reality-oracle';

@Injectable()
export class SignalsService {
  constructor(
    @InjectRepository(SignalEntity)
    private signalRepository: Repository<SignalEntity>,
  ) {}

  async getSignals(options: {
    sourceType?: string;
    limit: number;
    offset: number;
  }): Promise<{ signals: Signal[]; total: number }> {
    const queryBuilder = this.signalRepository.createQueryBuilder('signal');

    if (options.sourceType) {
      queryBuilder.where('signal.metadata_sourceType = :sourceType', {
        sourceType: options.sourceType,
      });
    }

    const total = await queryBuilder.getCount();

    const entities = await queryBuilder
      .orderBy('signal.metadata_timestamp', 'DESC')
      .skip(options.offset)
      .take(options.limit)
      .getMany();

    const signals = entities.map(e => e.toSignal());

    return { signals, total };
  }

  async collectSignals(): Promise<{ collected: number }> {
    // 수집기 등록 (이미 등록되어 있으면 스킵)
    const collectors = realityOracle.getCollectors();
    if (collectors.length === 0) {
      const onchainCollector = new OnChainCollector({
        rpcUrl: process.env.RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
      });
      realityOracle.registerCollector(onchainCollector);

      const checkinCollector = new CheckInCollector();
      realityOracle.registerCollector(checkinCollector);
    }

    // 신호 수집
    const collectedSignals = await realityOracle.collectSignals();
    
    // 데이터베이스에 저장
    const entities = collectedSignals.map(signal => {
      const entity = new SignalEntity();
      entity.metadata_sourceType = signal.metadata.sourceType;
      entity.metadata_timestamp = signal.metadata.timestamp;
      entity.payload = signal.payload;
      entity.attestation = signal.attestation || null;
      entity.tags = signal.tags || [];
      entity.hash = null; // TODO: 해시 계산
      return entity;
    });

    await this.signalRepository.save(entities);

    return { collected: collectedSignals.length };
  }
}

