'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { ProposalCard } from '@/components/proposal-card';
import { useState, useEffect } from 'react';
import type { Proposal } from '@bridge-2026/shared';
import { api } from '@/lib/api';

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');

  useEffect(() => {
    // API 호출
    const statusMap: Record<string, string> = {
      all: '',
      active: 'active',
      passed: 'passed',
      rejected: 'rejected',
    };
    
    api.getProposals({ status: statusMap[filter], limit: 100 })
      .then(result => setProposals(result.proposals))
      .catch(error => {
        console.error('Error fetching proposals:', error);
        // 에러 시 빈 배열
        setProposals([]);
      })
      .finally(() => setLoading(false));
    
    // 임시 데이터 (API 실패 시 fallback)
    const mockProposals: Proposal[] = [
      {
        id: '1',
        title: '[AI Assisted] 거버넌스 참여율 개선 방안',
        description: '최근 거버넌스 참여율이 감소하고 있어, 참여 인센티브를 개선하는 방안을 제안합니다.',
        type: 'governance',
        status: 'active',
        decisionPacketId: 'dp-1',
        issueId: 'issue-1',
        actions: [],
        votingStartTime: Date.now(),
        votingEndTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
        minParticipationRate: 0.1,
        passingThreshold: 0.5,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        metadata: {
          aiAssisted: true,
          agentConfidence: 0.85,
        },
      },
      {
        id: '2',
        title: '[AI Assisted] 트레저리 배분 최적화',
        description: '현재 트레저리 배분이 비효율적이어서, 데이터 기반 최적화 방안을 제안합니다.',
        type: 'treasury',
        status: 'passed',
        decisionPacketId: 'dp-2',
        issueId: 'issue-2',
        actions: [],
        votingStartTime: Date.now() - 10 * 24 * 60 * 60 * 1000,
        votingEndTime: Date.now() - 3 * 24 * 60 * 60 * 1000,
        minParticipationRate: 0.1,
        passingThreshold: 0.5,
        createdAt: Date.now() - 14 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        metadata: {
          aiAssisted: true,
          agentConfidence: 0.78,
        },
      },
    ];
    
    setTimeout(() => {
      setProposals(mockProposals);
      setLoading(false);
    }, 500);
  }, []);

  const filteredProposals = proposals.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-moss-600">Proposals</h1>
            <p className="text-gray-600 mt-2">
              AI Assisted Proposal을 검토하고 투표하세요
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
            onClick={() => setFilter('active')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'active'
                ? 'bg-moss-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            투표중
          </button>
          <button
            onClick={() => setFilter('passed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'passed'
                ? 'bg-moss-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            통과
          </button>
          <button
            onClick={() => setFilter('rejected')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'rejected'
                ? 'bg-moss-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            부결
          </button>
        </div>

        {/* Proposals List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600">로딩 중...</p>
          </div>
        ) : filteredProposals.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">제안이 없습니다.</p>
            <p className="text-sm text-gray-500">
              새로운 제안이 생성되면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredProposals.map(proposal => (
              <ProposalCard key={proposal.id} proposal={proposal} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
