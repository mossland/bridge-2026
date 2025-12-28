"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  RefreshCw,
  Filter,
  AlertTriangle,
  Zap,
  Server,
  Globe,
  Loader2,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Hash,
  Clock,
  Layers,
  TrendingUp,
  Github,
  Twitter,
  FileText,
} from "lucide-react";
import { cn, getSeverityColor, timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";

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

const categoryIcons: Record<string, React.ElementType> = {
  github_commit: Github,
  github_push: Github,
  github_release: Github,
  github_overview: Github,
  github_activity: Github,
  medium_post: FileText,
  medium_activity: FileText,
  twitter_tweet: Twitter,
  twitter_profile: Twitter,
  twitter_engagement: Twitter,
  moc_transfer: Zap,
  foundation_transfer: Zap,
  moc_price: TrendingUp,
  moc_price_alert: TrendingUp,
  network_gas: Layers,
};

interface SignalMetadata {
  txHash?: string;
  blockNumber?: number;
  apiEndpoint?: string;
  contractAddress?: string;
  url?: string;
}

function SignalCard({ signal }: { signal: any }) {
  const [isExpanded, setIsExpanded] = useState(false);

  const SourceIcon = sourceIcons[signal.source] || Activity;
  const CategoryIcon = categoryIcons[signal.category] || Activity;

  const metadata: SignalMetadata = signal.metadata || {};

  // Generate external link based on category
  const getExternalLink = (): { url: string; label: string } | null => {
    if (metadata.txHash) {
      return {
        url: `https://etherscan.io/tx/${metadata.txHash}`,
        label: "Etherscan에서 보기",
      };
    }
    if (metadata.apiEndpoint && metadata.apiEndpoint.includes("github.com")) {
      return { url: metadata.apiEndpoint, label: "GitHub에서 보기" };
    }
    if (metadata.apiEndpoint && metadata.apiEndpoint.includes("twitter.com")) {
      return { url: metadata.apiEndpoint, label: "Twitter에서 보기" };
    }
    if (metadata.apiEndpoint && metadata.apiEndpoint.includes("medium.com")) {
      return { url: metadata.apiEndpoint, label: "Medium에서 보기" };
    }
    if (signal.category?.includes("github")) {
      return { url: "https://github.com/mossland", label: "GitHub에서 보기" };
    }
    if (signal.category?.includes("medium")) {
      return {
        url: "https://medium.com/mossland-blog",
        label: "Medium에서 보기",
      };
    }
    return null;
  };

  const externalLink = getExternalLink();

  return (
    <div
      className={cn(
        "p-4 bg-gray-50 rounded-lg transition-all border-l-4",
        signal.severity === "critical"
          ? "border-red-500"
          : signal.severity === "high"
            ? "border-orange-500"
            : signal.severity === "medium"
              ? "border-yellow-500"
              : "border-green-500"
      )}
    >
      {/* Header - always visible */}
      <div className="flex items-start space-x-4">
        <div
          className={cn(
            "p-2 rounded-lg flex-shrink-0",
            signal.severity === "critical"
              ? "bg-red-100"
              : signal.severity === "high"
                ? "bg-orange-100"
                : signal.severity === "medium"
                  ? "bg-yellow-100"
                  : "bg-green-100"
          )}
        >
          <SourceIcon
            className={cn(
              "w-5 h-5",
              signal.severity === "critical"
                ? "text-red-600"
                : signal.severity === "high"
                  ? "text-orange-600"
                  : signal.severity === "medium"
                    ? "text-yellow-600"
                    : "text-green-600"
            )}
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <span className={cn("badge", getSeverityColor(signal.severity))}>
              {signal.severity}
            </span>
            <span className="badge bg-gray-100 text-gray-600">
              {sourceLabels[signal.source] || signal.source}
            </span>
            <span className="badge bg-blue-50 text-blue-600 flex items-center gap-1">
              <CategoryIcon className="w-3 h-3" />
              {signal.category?.replace(/_/g, " ") || "unknown"}
            </span>
          </div>

          <p className="mt-2 text-gray-900 font-medium">
            {signal.description || `Value: ${signal.value}`}
          </p>

          {/* Value display */}
          {signal.value !== undefined && signal.unit && (
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-moss-700">
                {typeof signal.value === "number"
                  ? signal.value.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })
                  : signal.value}
              </span>
              <span className="text-sm text-gray-500">{signal.unit}</span>
            </div>
          )}

          <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {timeAgo(new Date(signal.timestamp))}
            </span>
            {metadata.blockNumber && (
              <span className="flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Block #{metadata.blockNumber.toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {(signal.severity === "critical" || signal.severity === "high") && (
            <button className="btn-secondary text-sm flex items-center space-x-1">
              <AlertTriangle className="w-4 h-4" />
              <span>이슈 생성</span>
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-2 hover:bg-gray-200 rounded-md transition-colors"
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-500" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-500" />
            )}
          </button>
        </div>
      </div>

      {/* Expanded details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Signal ID */}
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase">
                Signal ID
              </span>
              <p className="mt-1 text-sm font-mono text-gray-700 truncate">
                {signal.id}
              </p>
            </div>

            {/* Original ID */}
            {signal.originalId && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Original ID
                </span>
                <p className="mt-1 text-sm font-mono text-gray-700 truncate">
                  {signal.originalId}
                </p>
              </div>
            )}

            {/* Transaction Hash */}
            {metadata.txHash && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                  <Hash className="w-3 h-3" />
                  Transaction Hash
                </span>
                <p className="mt-1 text-sm font-mono text-gray-700 truncate">
                  {metadata.txHash}
                </p>
              </div>
            )}

            {/* Block Number */}
            {metadata.blockNumber && (
              <div>
                <span className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                  <Layers className="w-3 h-3" />
                  Block Number
                </span>
                <p className="mt-1 text-sm font-mono text-gray-700">
                  {metadata.blockNumber.toLocaleString()}
                </p>
              </div>
            )}

            {/* API Endpoint */}
            {metadata.apiEndpoint && (
              <div className="md:col-span-2">
                <span className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                  <Globe className="w-3 h-3" />
                  API Endpoint
                </span>
                <p className="mt-1 text-sm font-mono text-gray-700 truncate">
                  {metadata.apiEndpoint}
                </p>
              </div>
            )}

            {/* Timestamp */}
            <div>
              <span className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Timestamp
              </span>
              <p className="mt-1 text-sm text-gray-700">
                {new Date(signal.timestamp).toLocaleString("ko-KR", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  second: "2-digit",
                })}
              </p>
            </div>

            {/* Raw Data */}
            {signal.rawData && (
              <div className="md:col-span-2">
                <span className="text-xs font-medium text-gray-500 uppercase">
                  Raw Data
                </span>
                <pre className="mt-1 p-2 bg-gray-100 rounded text-xs font-mono text-gray-700 overflow-x-auto">
                  {JSON.stringify(signal.rawData, null, 2)}
                </pre>
              </div>
            )}
          </div>

          {/* External Link */}
          {externalLink && (
            <div className="mt-4">
              <a
                href={externalLink.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-moss-600 hover:text-moss-700 hover:underline"
              >
                <ExternalLink className="w-4 h-4" />
                {externalLink.label}
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SignalsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<string>("all");
  const [sourceFilter, setSourceFilter] = useState<string>("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["signals"],
    queryFn: () => api.getSignals(),
    refetchInterval: 10000, // Refresh every 10 seconds
  });

  const collectMutation = useMutation({
    mutationFn: () => api.collectSignals(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["signals"] });
    },
  });

  const signals = data?.signals ?? [];

  const filteredSignals = signals.filter((s: any) => {
    const severityMatch = filter === "all" || s.severity === filter;
    const sourceMatch = sourceFilter === "all" || s.source === sourceFilter;
    return severityMatch && sourceMatch;
  });

  const severityCounts = {
    critical: signals.filter((s: any) => s.severity === "critical").length,
    high: signals.filter((s: any) => s.severity === "high").length,
    medium: signals.filter((s: any) => s.severity === "medium").length,
    low: signals.filter((s: any) => s.severity === "low").length,
  };

  const sourceCounts = {
    onchain: signals.filter((s: any) => s.source === "onchain").length,
    api: signals.filter((s: any) => s.source === "api").length,
    telemetry: signals.filter((s: any) => s.source === "telemetry").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reality Feed</h1>
          <p className="mt-1 text-gray-500">
            실시간 신호 스트림 및 이상징후 모니터링
          </p>
        </div>
        <button
          onClick={() => collectMutation.mutate()}
          disabled={collectMutation.isPending}
          className="btn-primary flex items-center space-x-2"
        >
          {collectMutation.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          <span>신호 수집</span>
        </button>
      </div>

      {/* Severity Stats */}
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

      {/* Source Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSourceFilter("all")}
          className={cn(
            "badge cursor-pointer transition-all",
            sourceFilter === "all"
              ? "bg-moss-600 text-white"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          전체 ({signals.length})
        </button>
        {Object.entries(sourceCounts).map(([source, count]) => {
          const Icon = sourceIcons[source] || Activity;
          return (
            <button
              key={source}
              onClick={() =>
                setSourceFilter(sourceFilter === source ? "all" : source)
              }
              className={cn(
                "badge cursor-pointer transition-all flex items-center gap-1",
                sourceFilter === source
                  ? "bg-moss-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
            >
              <Icon className="w-3 h-3" />
              {sourceLabels[source]} ({count})
            </button>
          );
        })}
      </div>

      {/* Signals List */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Activity className="w-5 h-5 mr-2 text-moss-600" />
            실시간 신호
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({filteredSignals.length}건)
            </span>
          </h2>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="text-sm border-gray-300 rounded-md"
            >
              <option value="all">전체 심각도</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-moss-600" />
            </div>
          ) : filteredSignals.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>신호가 없습니다. 신호 수집 버튼을 클릭하세요.</p>
            </div>
          ) : (
            filteredSignals.map((signal: any) => (
              <SignalCard key={signal.id} signal={signal} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
