'use client';

import { Outcome } from '@bridge-2026/shared';
import { formatDate, formatPercent } from '@bridge-2026/shared/utils';
import Link from 'next/link';

interface OutcomeCardProps {
  outcome: Outcome;
}

export function OutcomeCard({ outcome }: OutcomeCardProps) {
  const isSuccess = outcome.status === 'success';
  const successRate = outcome.evaluation?.successRate || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-moss-200">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-moss-700 mb-2">
            제안 #{outcome.proposalId.slice(0, 8)}...
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            평가일: {formatDate(outcome.updatedAt, 'short')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={outcome.status} />
          {outcome.evaluation && (
            <div className="text-right">
              <div className="text-sm text-gray-500">성공률</div>
              <div className="text-lg font-bold text-moss-600">
                {formatPercent(successRate)}
              </div>
            </div>
          )}
        </div>
      </div>

      {outcome.evaluation && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm text-gray-500">평가 결과:</span>
            <span
              className={`text-sm font-medium ${
                outcome.evaluation.success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {outcome.evaluation.success ? '성공' : '실패'}
            </span>
          </div>
          <p className="text-sm text-gray-600 line-clamp-2">
            {outcome.evaluation.reasoning}
          </p>
        </div>
      )}

      {outcome.kpiMeasurements && outcome.kpiMeasurements.length > 0 && (
        <div className="mb-4">
          <div className="text-sm text-gray-500 mb-2">KPI 측정:</div>
          <div className="grid grid-cols-2 gap-2">
            {outcome.kpiMeasurements.slice(0, 4).map((kpi, index) => (
              <div key={index} className="text-sm">
                <span className="text-gray-600">{kpi.kpiName}:</span>
                <span className="ml-2 font-medium text-moss-600">
                  {kpi.value.toFixed(2)}
                  {kpi.targetValue && ` / ${kpi.targetValue}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href={`/outcomes/${outcome.id}`}
          className="flex-1 px-4 py-2 bg-moss-600 text-white rounded-lg hover:bg-moss-700 text-center font-medium transition-colors"
        >
          상세보기
        </Link>
        {outcome.onChainProofHash && (
          <a
            href={`https://etherscan.io/tx/${outcome.onChainProofHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 border border-moss-300 text-moss-600 rounded-lg hover:bg-moss-50 transition-colors"
          >
            온체인 확인
          </a>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { label: string; color: string }> = {
    in_progress: { label: '평가중', color: 'bg-blue-100 text-blue-700' },
    success: { label: '성공', color: 'bg-green-100 text-green-700' },
    failure: { label: '실패', color: 'bg-red-100 text-red-700' },
    partial_success: { label: '부분 성공', color: 'bg-yellow-100 text-yellow-700' },
  };

  const config = statusConfig[status] || statusConfig.in_progress;

  return (
    <span className={`px-3 py-1 text-xs font-medium rounded-full ${config.color}`}>
      {config.label}
    </span>
  );
}




