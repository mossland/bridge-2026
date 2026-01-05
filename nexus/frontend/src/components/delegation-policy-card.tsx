'use client';

import { DelegationPolicy } from '@bridge-2026/shared';
import { formatDate } from '@bridge-2026/shared/utils';

interface DelegationPolicyCardProps {
  policy: DelegationPolicy & { id: string; createdAt: number };
  onEdit?: () => void;
  onDelete?: () => void;
}

export function DelegationPolicyCard({
  policy,
  onEdit,
  onDelete,
}: DelegationPolicyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-moss-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-moss-700 mb-2">
            {getAgentName(policy.agent_id)}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            생성일: {formatDate(policy.createdAt || Date.now(), 'short')}
          </p>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3 py-1 text-sm text-moss-600 hover:text-moss-700 border border-moss-300 rounded hover:bg-moss-50"
            >
              수정
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="px-3 py-1 text-sm text-red-600 hover:text-red-700 border border-red-300 rounded hover:bg-red-50"
            >
              삭제
            </button>
          )}
        </div>
      </div>

      <div className="space-y-3">
        {/* Scope */}
        {policy.scope.categories && policy.scope.categories.length > 0 && (
          <div>
            <span className="text-sm text-gray-500">허용 카테고리:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {policy.scope.categories.map(cat => (
                <span
                  key={cat}
                  className="px-2 py-1 text-xs bg-moss-100 text-moss-700 rounded"
                >
                  {cat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Budget Limits */}
        {(policy.max_budget_per_month || policy.max_budget_per_proposal) && (
          <div className="text-sm">
            <span className="text-gray-500">예산 제한:</span>
            <div className="mt-1 space-y-1">
              {policy.max_budget_per_month && (
                <div>
                  월별 최대: ${policy.max_budget_per_month.toLocaleString()}
                </div>
              )}
              {policy.max_budget_per_proposal && (
                <div>
                  제안당 최대: ${policy.max_budget_per_proposal.toLocaleString()}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Restrictions */}
        <div className="flex flex-wrap gap-4 text-sm">
          {policy.no_vote_on_emergency && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">긴급안건 제외</span>
              <span className="text-green-600">✓</span>
            </div>
          )}
          {policy.veto_enabled && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">거부권 활성화</span>
              <span className="text-green-600">✓</span>
            </div>
          )}
          {policy.cooldown_window_hours > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-gray-500">
                대기시간: {policy.cooldown_window_hours}시간
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getAgentName(agentId: string): string {
  const names: Record<string, string> = {
    risk_security: 'Risk & Security Agent',
    treasury: 'Treasury Agent',
    community: 'Community Agent',
    product_feasibility: 'Product Agent',
    moderator: 'Moderator Agent',
  };
  return names[agentId] || agentId;
}









