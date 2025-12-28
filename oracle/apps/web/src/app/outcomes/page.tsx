"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { CheckCircle, XCircle, TrendingUp, TrendingDown, BarChart3, FileCheck, ExternalLink, Loader2 } from "lucide-react";
import { cn, formatNumber, timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";

interface KPI {
  name: string;
  target: number;
  actual: number;
  unit: string;
  success: boolean | null;
}

function KPICard({ kpi }: { kpi: KPI }) {
  const progress = kpi.target > 0 ? (kpi.actual / kpi.target) * 100 : 0;
  const isComplete = kpi.success !== null;

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{kpi.name}</span>
        {isComplete && (
          kpi.success
            ? <CheckCircle className="w-5 h-5 text-green-500" />
            : <XCircle className="w-5 h-5 text-red-500" />
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <span className="text-2xl font-bold text-gray-900">
            {kpi.actual.toLocaleString()}
          </span>
          <span className="text-sm text-gray-500 ml-1">{kpi.unit}</span>
        </div>
        <span className="text-sm text-gray-500">
          목표: {kpi.target.toLocaleString()}{kpi.unit}
        </span>
      </div>
      {isComplete && (
        <div className="mt-2">
          <div className="w-full h-2 bg-gray-200 rounded-full">
            <div
              className={cn(
                "h-2 rounded-full",
                kpi.success ? "bg-green-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function OutcomesPage() {
  const [selectedOutcome, setSelectedOutcome] = useState<any>(null);

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: () => api.getStats(),
  });

  const { data: leaderboardData, isLoading: leaderboardLoading } = useQuery({
    queryKey: ["trust-leaderboard"],
    queryFn: () => api.getLeaderboard("agent", 10),
  });

  // For now, we'll show stats from the API
  const outcomes: any[] = []; // API doesn't have a direct outcomes list endpoint yet
  const completedCount = statsData?.outcomes.totalProofs ?? 0;
  const successRate = (statsData?.outcomes.successRate ?? 0) * 100;
  const successCount = Math.round(completedCount * (successRate / 100));
  const trustScores = leaderboardData?.leaderboard ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Proof of Outcome</h1>
        <p className="mt-1 text-gray-500">거버넌스 결정의 실행 결과 및 KPI 추적</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">총 실행</p>
          <p className="text-2xl font-bold text-gray-900">
            {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : outcomes.length}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">완료</p>
          <p className="text-2xl font-bold text-gray-900">
            {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : completedCount}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">성공</p>
          <p className="text-2xl font-bold text-green-600">
            {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : successCount}
          </p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">평균 성공률</p>
          <p className="text-2xl font-bold text-moss-600">
            {statsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : `${successRate.toFixed(0)}%`}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Outcomes List */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">실행 결과</h2>
          {outcomes.map((outcome) => (
            <div
              key={outcome.id}
              onClick={() => setSelectedOutcome(outcome)}
              className={cn(
                "card cursor-pointer hover:shadow-md transition-all",
                selectedOutcome?.id === outcome.id && "ring-2 ring-moss-500"
              )}
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    {outcome.status === "completed" ? (
                      outcome.overallSuccess ? (
                        <span className="badge bg-green-50 text-green-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          성공
                        </span>
                      ) : (
                        <span className="badge bg-red-50 text-red-700">
                          <XCircle className="w-3 h-3 mr-1" />
                          실패
                        </span>
                      )
                    ) : (
                      <span className="badge bg-blue-50 text-blue-700">
                        진행 중
                      </span>
                    )}
                    {outcome.status === "completed" && (
                      <span className="badge bg-gray-100 text-gray-600">
                        {outcome.successRate}% 달성
                      </span>
                    )}
                  </div>
                  <h3 className="font-semibold text-gray-900">{outcome.proposalTitle}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {timeAgo(outcome.executedAt)} 실행
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">KPI {outcome.kpis.length}개</p>
                  {outcome.proofHash && (
                    <a
                      href="#"
                      className="text-sm text-moss-600 flex items-center mt-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      증명 보기
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          {/* Outcome Detail */}
          {selectedOutcome ? (
            <div className="card sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">KPI 상세</h3>
              <div className="space-y-3">
                {selectedOutcome.kpis.map((kpi: KPI, idx: number) => (
                  <KPICard key={idx} kpi={kpi} />
                ))}
              </div>
              {selectedOutcome.proofHash && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-sm text-gray-500">증명 해시</p>
                  <p className="text-sm font-mono text-gray-700 mt-1 break-all">
                    {selectedOutcome.proofHash}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-500">
              <BarChart3 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>결과를 선택하면 KPI 상세가 표시됩니다</p>
            </div>
          )}

          {/* Trust Scores */}
          <div className="card">
            <h3 className="font-semibold text-gray-900 mb-4">에이전트 신뢰도</h3>
            {leaderboardLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-moss-600" />
              </div>
            ) : trustScores.length === 0 ? (
              <p className="text-center py-8 text-gray-500">신뢰도 데이터가 없습니다</p>
            ) : (
              <div className="space-y-3">
                {trustScores.map((score: any) => (
                  <div key={score.entityId} className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">{score.entityId}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-semibold">{score.score?.toFixed(0) ?? 0}</span>
                      {(score.trend ?? 0) >= 0 ? (
                        <span className="text-green-500 flex items-center text-xs">
                          <TrendingUp className="w-3 h-3 mr-0.5" />
                          +{score.trend ?? 0}
                        </span>
                      ) : (
                        <span className="text-red-500 flex items-center text-xs">
                          <TrendingDown className="w-3 h-3 mr-0.5" />
                          {score.trend}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
