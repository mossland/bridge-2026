"use client";

import { useState } from "react";
import { Activity, RefreshCw, Filter, AlertTriangle, Zap, Server, Globe } from "lucide-react";
import { cn, getSeverityColor, timeAgo } from "@/lib/utils";

// Mock data - in production, this would come from the API
const mockSignals = [
  {
    id: "1",
    source: "onchain",
    category: "governance_vote",
    severity: "high",
    value: 15,
    description: "대규모 투표 활동 감지: 15개 지갑에서 동시 투표",
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
  },
  {
    id: "2",
    source: "telemetry",
    category: "participation_rate",
    severity: "critical",
    value: -32,
    description: "참여율 급락: 지난 24시간 대비 32% 감소",
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
  },
  {
    id: "3",
    source: "api",
    category: "market_data",
    severity: "medium",
    value: 5.2,
    description: "MOC 거래량 증가: 평균 대비 +5.2%",
    timestamp: new Date(Date.now() - 30 * 60 * 1000),
  },
  {
    id: "4",
    source: "onchain",
    category: "token_transfer",
    severity: "low",
    value: 1000000,
    description: "대형 전송 감지: 1,000,000 MOC 이동",
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
  },
  {
    id: "5",
    source: "telemetry",
    category: "system_health",
    severity: "low",
    value: 99.9,
    description: "시스템 가동률: 99.9%",
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
  },
  {
    id: "6",
    source: "api",
    category: "community_activity",
    severity: "medium",
    value: 47,
    description: "Discord 활동 증가: 신규 토론 47개",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
];

const sourceIcons: Record<string, React.ElementType> = {
  onchain: Zap,
  telemetry: Server,
  api: Globe,
};

const sourceLabels: Record<string, string> = {
  onchain: "On-Chain",
  telemetry: "Telemetry",
  api: "External API",
};

export default function SignalsPage() {
  const [signals] = useState(mockSignals);
  const [filter, setFilter] = useState<string>("all");

  const filteredSignals = filter === "all"
    ? signals
    : signals.filter(s => s.severity === filter);

  const severityCounts = {
    critical: signals.filter(s => s.severity === "critical").length,
    high: signals.filter(s => s.severity === "high").length,
    medium: signals.filter(s => s.severity === "medium").length,
    low: signals.filter(s => s.severity === "low").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reality Feed</h1>
          <p className="mt-1 text-gray-500">실시간 신호 스트림 및 이상징후 모니터링</p>
        </div>
        <button className="btn-primary flex items-center space-x-2">
          <RefreshCw className="w-4 h-4" />
          <span>신호 수집</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Object.entries(severityCounts).map(([severity, count]) => (
          <button
            key={severity}
            onClick={() => setFilter(filter === severity ? "all" : severity)}
            className={cn(
              "card text-center transition-all",
              filter === severity && "ring-2 ring-moss-500"
            )}
          >
            <span className={cn("badge", getSeverityColor(severity))}>
              {severity.toUpperCase()}
            </span>
            <p className="mt-2 text-2xl font-bold text-gray-900">{count}</p>
          </button>
        ))}
      </div>

      {/* Signals List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-moss-600" />
            실시간 신호
          </h2>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="all">전체</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {filteredSignals.map((signal) => {
            const SourceIcon = sourceIcons[signal.source] || Activity;
            return (
              <div
                key={signal.id}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className={cn(
                  "p-2 rounded-lg",
                  signal.severity === "critical" ? "bg-red-100" :
                  signal.severity === "high" ? "bg-orange-100" :
                  signal.severity === "medium" ? "bg-yellow-100" : "bg-green-100"
                )}>
                  <SourceIcon className={cn(
                    "w-5 h-5",
                    signal.severity === "critical" ? "text-red-600" :
                    signal.severity === "high" ? "text-orange-600" :
                    signal.severity === "medium" ? "text-yellow-600" : "text-green-600"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className={cn("badge", getSeverityColor(signal.severity))}>
                      {signal.severity}
                    </span>
                    <span className="badge bg-gray-100 text-gray-600">
                      {sourceLabels[signal.source]}
                    </span>
                    <span className="badge bg-blue-50 text-blue-600">
                      {signal.category.replace(/_/g, " ")}
                    </span>
                  </div>
                  <p className="mt-1 text-gray-900">{signal.description}</p>
                  <p className="mt-1 text-sm text-gray-500">{timeAgo(signal.timestamp)}</p>
                </div>
                {signal.severity === "critical" || signal.severity === "high" ? (
                  <button className="btn-secondary text-sm flex items-center space-x-1">
                    <AlertTriangle className="w-4 h-4" />
                    <span>이슈 생성</span>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
