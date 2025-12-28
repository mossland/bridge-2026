import { Injectable } from '@nestjs/common';
import { proofOfOutcome } from '@bridge-2026/proof-of-outcome';
import type { Outcome } from '@bridge-2026/shared';

@Injectable()
export class OutcomesService {
  async getOutcomes(options: {
    status?: string;
    limit: number;
    offset: number;
  }): Promise<{ outcomes: Outcome[]; total: number }> {
    // TODO: 실제 데이터베이스에서 조회
    // 현재는 메모리에서 관리 (실제로는 DB 사용)
    const outcomes: Outcome[] = [];

    let filtered = outcomes;

    if (options.status) {
      filtered = filtered.filter(o => o.status === options.status);
    }

    // 최신순 정렬
    filtered.sort((a, b) => b.updatedAt - a.updatedAt);

    const total = filtered.length;
    const paginated = filtered.slice(
      options.offset,
      options.offset + options.limit
    );

    return { outcomes: paginated, total };
  }

  async getOutcome(id: string): Promise<Outcome | null> {
    return proofOfOutcome.getOutcome(id) || null;
  }
}

