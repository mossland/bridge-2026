'use client';

import { useState } from 'react';
import { useAccount } from 'wagmi';
import { api } from '@/lib/api';
import type { DelegationPolicy } from '@bridge-2026/shared';

interface DelegationPolicyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function DelegationPolicyForm({
  onSuccess,
  onCancel,
}: DelegationPolicyFormProps) {
  const { address } = useAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<DelegationPolicy>>({
    wallet: address || '',
    agent_id: 'treasury',
    scope: {},
    no_vote_on_emergency: true,
    cooldown_window_hours: 24,
    veto_enabled: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      alert('지갑을 연결해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      await api.createDelegationPolicy({
        ...formData,
        wallet: address,
      } as DelegationPolicy);

      alert('위임 정책이 생성되었습니다.');
      onSuccess?.();
    } catch (error) {
      console.error('Error creating policy:', error);
      alert('위임 정책 생성에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Agent Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          에이전트 선택
        </label>
        <select
          value={formData.agent_id || ''}
          onChange={e => setFormData({ ...formData, agent_id: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moss-500 focus:border-moss-500"
          required
        >
          <option value="risk_security">Risk & Security Agent</option>
          <option value="treasury">Treasury Agent</option>
          <option value="community">Community Agent</option>
          <option value="product_feasibility">Product Agent</option>
        </select>
      </div>

      {/* Categories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          허용 카테고리 (선택)
        </label>
        <div className="space-y-2">
          {['governance', 'treasury', 'technical', 'policy'].map(cat => (
            <label key={cat} className="flex items-center">
              <input
                type="checkbox"
                checked={formData.scope?.categories?.includes(cat) || false}
                onChange={e => {
                  const categories = formData.scope?.categories || [];
                  const newCategories = e.target.checked
                    ? [...categories, cat]
                    : categories.filter(c => c !== cat);
                  setFormData({
                    ...formData,
                    scope: { ...formData.scope, categories: newCategories },
                  });
                }}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">{cat}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Budget Limits */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            월별 최대 예산 (USD)
          </label>
          <input
            type="number"
            value={formData.max_budget_per_month || ''}
            onChange={e =>
              setFormData({
                ...formData,
                max_budget_per_month: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moss-500 focus:border-moss-500"
            placeholder="10000"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제안당 최대 예산 (USD)
          </label>
          <input
            type="number"
            value={formData.max_budget_per_proposal || ''}
            onChange={e =>
              setFormData({
                ...formData,
                max_budget_per_proposal: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moss-500 focus:border-moss-500"
            placeholder="1000"
          />
        </div>
      </div>

      {/* Restrictions */}
      <div className="space-y-3">
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.no_vote_on_emergency || false}
            onChange={e =>
              setFormData({
                ...formData,
                no_vote_on_emergency: e.target.checked,
              })
            }
            className="mr-2"
          />
          <span className="text-sm text-gray-700">긴급안건 제외</span>
        </label>

        <label className="flex items-center">
          <input
            type="checkbox"
            checked={formData.veto_enabled || false}
            onChange={e =>
              setFormData({
                ...formData,
                veto_enabled: e.target.checked,
              })
            }
            className="mr-2"
          />
          <span className="text-sm text-gray-700">거부권 활성화</span>
        </label>
      </div>

      {/* Cooldown */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          대기 시간 (시간)
        </label>
        <input
          type="number"
          value={formData.cooldown_window_hours || 24}
          onChange={e =>
            setFormData({
              ...formData,
              cooldown_window_hours: parseInt(e.target.value) || 0,
            })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-moss-500 focus:border-moss-500"
          min="0"
          required
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-moss-600 text-white rounded-lg hover:bg-moss-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '생성 중...' : '위임 정책 생성'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          >
            취소
          </button>
        )}
      </div>
    </form>
  );
}


