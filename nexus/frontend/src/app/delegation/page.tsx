'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { DelegationPolicyCard } from '@/components/delegation-policy-card';
import { DelegationPolicyForm } from '@/components/delegation-policy-form';
import { useState, useEffect } from 'react';
import type { DelegationPolicy } from '@bridge-2026/shared';
import { useAccount } from 'wagmi';
import { api } from '@/lib/api';

export default function DelegationPage() {
  const { address, isConnected } = useAccount();
  const [policies, setPolicies] = useState<
    Array<DelegationPolicy & { id: string; createdAt: number }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      setLoading(false);
      return;
    }

    // API 호출
    api.getDelegationPolicies(address)
      .then(setPolicies)
      .catch(error => {
        console.error('Error fetching delegation policies:', error);
        // 에러 시 빈 배열
        setPolicies([]);
      })
      .finally(() => setLoading(false));
    
    // 임시 데이터 (API 실패 시 fallback)
    const mockPolicies: Array<DelegationPolicy & { id: string; createdAt: number }> = [
      {
        id: 'policy-1',
        wallet: address,
        agent_id: 'treasury',
        scope: {
          categories: ['treasury', 'governance'],
        },
        max_budget_per_month: 10000,
        max_budget_per_proposal: 1000,
        no_vote_on_emergency: true,
        cooldown_window_hours: 24,
        veto_enabled: true,
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
      },
    ];
    
    setTimeout(() => {
      setPolicies(mockPolicies);
      setLoading(false);
    }, 500);
  }, [address, isConnected]);

  const handleDelete = async (policyId: string) => {
    try {
      const result = await api.deleteDelegationPolicy(policyId);
      if (result.success) {
        setPolicies(policies.filter(p => p.id !== policyId));
      } else {
        alert('위임 정책 삭제에 실패했습니다.');
      }
    } catch (error) {
      console.error('Error deleting policy:', error);
      alert('위임 정책 삭제 중 오류가 발생했습니다.');
    }
  };

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-moss-600">Delegation</h1>
            <p className="text-gray-600 mt-2">
              정책 기반 위임으로 에이전트에게 투표 권한을 위임하세요
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

        {!isConnected ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">
              위임 정책을 설정하려면 지갑을 연결해주세요.
            </p>
            <ConnectButton />
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-moss-700">
                위임 정책 ({policies.length}개)
              </h2>
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="px-6 py-2 bg-moss-600 text-white rounded-lg hover:bg-moss-700 font-medium"
              >
                + 새 위임 정책
              </button>
            </div>

            {showCreateForm && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-moss-200">
                <h3 className="text-xl font-semibold text-moss-700 mb-4">
                  새 위임 정책 생성
                </h3>
                <DelegationPolicyForm
                  onSuccess={() => {
                    setShowCreateForm(false);
                    // 정책 목록 새로고침
                    if (address) {
                      api.getDelegationPolicies(address)
                        .then(setPolicies)
                        .catch(console.error);
                    }
                  }}
                  onCancel={() => setShowCreateForm(false)}
                />
              </div>
            )}

            {loading ? (
              <div className="text-center py-12">
                <p className="text-gray-600">로딩 중...</p>
              </div>
            ) : policies.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-12 text-center">
                <p className="text-gray-600 mb-4">위임 정책이 없습니다.</p>
                <p className="text-sm text-gray-500 mb-6">
                  위임 정책을 생성하여 에이전트에게 투표 권한을 위임할 수 있습니다.
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="px-6 py-2 bg-moss-600 text-white rounded-lg hover:bg-moss-700 font-medium"
                >
                  첫 위임 정책 생성
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {policies.map(policy => (
                  <DelegationPolicyCard
                    key={policy.id}
                    policy={policy}
                    onDelete={() => handleDelete(policy.id)}
                  />
                ))}
              </div>
            )}

            {/* Info Section */}
            <div className="mt-8 bg-moss-50 rounded-lg shadow-md p-6 border border-moss-200">
              <h3 className="text-lg font-semibold text-moss-700 mb-3">
                위임 정책 안내
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• 위임은 정책 기반으로만 가능합니다 (무제한 자동투표 금지)</li>
                <li>• 카테고리, 예산, 긴급안건 등으로 위임 범위를 제한할 수 있습니다</li>
                <li>• 거부권을 활성화하면 위임 투표를 취소할 수 있습니다</li>
                <li>• 대기시간을 설정하여 연속 투표를 방지할 수 있습니다</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
