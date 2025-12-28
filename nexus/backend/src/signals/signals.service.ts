import { Injectable } from '@nestjs/common';
import type { Signal } from '@bridge-2026/shared';
import { realityOracle, OnChainCollector, CheckInCollector } from '@bridge-2026/reality-oracle';

@Injectable()
export class SignalsService {
  private signals: Signal[] = [];

  async getSignals(options: {
    sourceType?: string;
    limit: number;
    offset: number;
  }): Promise<{ signals: Signal[]; total: number }> {
    let filtered = [...this.signals];

    if (options.sourceType) {
      filtered = filtered.filter(
        s => s.metadata.sourceType === options.sourceType
      );
    }

    // 최신순 정렬
    filtered.sort((a, b) => b.metadata.timestamp - a.metadata.timestamp);

    const total = filtered.length;
    const signals = filtered.slice(
      options.offset,
      options.offset + options.limit
    );

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
    
    // 메모리에 저장 (실제로는 데이터베이스에 저장)
    this.signals.push(...collectedSignals);
    
    // 최대 1000개만 유지
    if (this.signals.length > 1000) {
      this.signals = this.signals.slice(-1000);
    }

    return { collected: collectedSignals.length };
  }
}

