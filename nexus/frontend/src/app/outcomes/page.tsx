'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { OutcomeCard } from '@/components/outcome-card';
import { useState, useEffect } from 'react';
import type { Outcome } from '@bridge-2026/shared';
import { api } from '@/lib/api';

export default function OutcomesPage() {
  const [outcomes, setOutcomes] = useState<Outcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'success' | 'failure'>('all');

  useEffect(() => {
    // API 호출
    const statusMap: Record<string, string> = {
      all: '',
      success: 'success',
      failure: 'failure',
    };
    
    api.getOutcomes({ status: statusMap[filter], limit: 100 })
      .then(result => setOutcomes(result.outcomes))
      .catch(error => {
        console.error('Error fetching outcomes:', error);
        // 에러 시 빈 배열
        setOutcomes([]);
      })
      .finally(() => setLoading(false));
    
    // 임시 데이터 (API 실패 시 fallback)
    const mockOutcomes: Outcome[] = [
      {
        id: 'outcome-1',
        proposalId: 'prop-1',
        decisionPacketId: 'dp-1',
        status: 'success',
        kpiMeasurements: [
          {
            kpiName: '참여율',
            value: 0.35,
            targetValue: 0.3,
            measuredAt: Date.now(),
            measurementMethod: 'automatic',
            dataSource: 'governance-api',
          },
          {
            kpiName: '투표 완료 시간',
            value: 4.2,
            targetValue: 5,
            measuredAt: Date.now(),
            measurementMethod: 'automatic',
            dataSource: 'governance-api',
          },
        ],
        evaluation: {
          evaluator: 'automatic',
          success: true,
          successRate: 0.9,
          reasoning: '모든 KPI가 목표를 달성했습니다. 참여율이 35%로 목표 30%를 초과 달성했으며, 투표 완료 시간도 목표보다 빠릅니다.',
          evaluatedAt: Date.now(),
        },
        executionStartTime: Date.now() - 10 * 24 * 60 * 60 * 1000,
        executionEndTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
      },
      {
        id: 'outcome-2',
        proposalId: 'prop-2',
        decisionPacketId: 'dp-2',
        status: 'partial_success',
        kpiMeasurements: [
          {
            kpiName: '예산 효율성',
            value: 0.65,
            targetValue: 0.8,
            measuredAt: Date.now(),
            measurementMethod: 'automatic',
            dataSource: 'treasury-api',
          },
        ],
        evaluation: {
          evaluator: 'automatic',
          success: false,
          successRate: 0.65,
          reasoning: '예산 효율성이 목표를 달성하지 못했습니다. 추가 개선이 필요합니다.',
          evaluatedAt: Date.now(),
        },
        executionStartTime: Date.now() - 20 * 24 * 60 * 60 * 1000,
        executionEndTime: Date.now() - 13 * 24 * 60 * 60 * 1000,
        createdAt: Date.now() - 20 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 13 * 24 * 60 * 60 * 1000,
      },
    ];
    
    setTimeout(() => {
      setOutcomes(mockOutcomes);
      setLoading(false);
    }, 500);
  }, []);

  const filteredOutcomes = outcomes.filter(o => {
    if (filter === 'all') return true;
    if (filter === 'success') return o.status === 'success';
    if (filter === 'failure') return o.status === 'failure' || o.status === 'partial_success';
    return true;
  });

  const successCount = outcomes.filter(o => o.status === 'success').length;
  const failureCount = outcomes.filter(o => o.status === 'failure' || o.status === 'partial_success').length;

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-moss-600">Outcomes</h1>
            <p className="text-gray-600 mt-2">
              거버넌스 결정의 결과를 확인하고 평가합니다
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/"
              className="px-4 py-2 text-moss-600 hover:text-moss-700"
            >
              ← 홈
            </Link>
            <ConnectButton />
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-md p-4 border border-moss-200">
            <div className="text-2xl font-bold text-moss-600">{outcomes.length}</div>
            <div className="text-sm text-gray-600">총 결과</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-green-200">
            <div className="text-2xl font-bold text-green-600">{successCount}</div>
            <div className="text-sm text-gray-600">성공</div>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 border border-red-200">
            <div className="text-2xl font-bold text-red-600">{failureCount}</div>
            <div className="text-sm text-gray-600">실패/부분 성공</div>
          </div>
        </div>

        {/* Filters */}
        <div className="mb-6 flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-moss-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            전체
          </button>
          <button
            onClick={() => setFilter('success')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'success'
                ? 'bg-moss-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            성공
          </button>
          <button
            onClick={() => setFilter('failure')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'failure'
                ? 'bg-moss-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            실패
          </button>
        </div>

        {/* Outcomes List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : filteredOutcomes.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">결과가 없습니다.</p>
            <p className="text-sm text-gray-500">
              거버넌스 결정의 결과가 평가되면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredOutcomes.map(outcome => (
              <OutcomeCard key={outcome.id} outcome={outcome} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
