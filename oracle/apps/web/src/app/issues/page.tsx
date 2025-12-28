"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, MessageSquare, Users, Shield, Coins, Code, ChevronRight, Bot, Loader2, RefreshCw } from "lucide-react";
import { cn, getSeverityColor, timeAgo } from "@/lib/utils";
import { api } from "@/lib/api";

const priorityColors: Record<string, string> = {
  urgent: "bg-red-100 text-red-700",
  high: "bg-orange-100 text-orange-700",
  medium: "bg-yellow-100 text-yellow-700",
  low: "bg-green-100 text-green-700",
};

const statusLabels: Record<string, string> = {
  detected: "탐지됨",
  analyzing: "분석 중",
  deliberating: "심의 중",
  voting: "투표 중",
  executed: "실행됨",
  closed: "종료",
};

const categoryIcons: Record<string, React.ElementType> = {
  governance: Users,
  security: Shield,
  treasury: Coins,
  product: Code,
};

const roleLabels: Record<string, string> = {
  risk: "Risk",
  treasury: "Treasury",
  community: "Community",
  product: "Product",
};

const stanceColors: Record<string, string> = {
  strongly_support: "bg-green-500",
  support: "bg-green-300",
  neutral: "bg-gray-300",
  oppose: "bg-red-300",
  strongly_oppose: "bg-red-500",
};

export default function IssuesPage() {
  const queryClient = useQueryClient();
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["issues"],
    queryFn: () => api.detectIssues(),
    refetchInterval: 30000,
  });

  const deliberateMutation = useMutation({
    mutationFn: (issue: any) => api.deliberate(issue),
    onSuccess: (result) => {
      if (selectedIssue) {
        setSelectedIssue({ ...selectedIssue, decisionPacket: result.decisionPacket });
      }
    },
  });

  const issues = data?.issues ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
          <p className="mt-1 text-gray-500">AI가 탐지한 이슈 및 에이전트 심의 현황</p>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["issues"] })}
          className="btn-secondary flex items-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>이슈 탐지</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues List */}
        <div className="lg:col-span-2 space-y-4">
          {isLoading ? (
            <div className="card flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-moss-600" />
            </div>
          ) : issues.length === 0 ? (
            <div className="card text-center py-12 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>탐지된 이슈가 없습니다</p>
            </div>
          ) : (
            issues.map((issue: any) => {
              const CategoryIcon = categoryIcons[issue.category] || AlertTriangle;
              const agentOpinions = issue.agentOpinions || [];
              return (
                <div
                  key={issue.id}
                  onClick={() => setSelectedIssue(issue)}
                  className={cn(
                    "card cursor-pointer hover:shadow-md transition-all",
                    selectedIssue?.id === issue.id && "ring-2 ring-moss-500"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <CategoryIcon className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={cn("badge", priorityColors[issue.priority] || "bg-gray-100 text-gray-700")}>
                            {(issue.priority || "medium").toUpperCase()}
                          </span>
                          <span className="badge bg-blue-50 text-blue-600">
                            {statusLabels[issue.status] || issue.status}
                          </span>
                        </div>
                        <h3 className="mt-2 font-semibold text-gray-900">{issue.title}</h3>
                        <p className="mt-1 text-sm text-gray-500 line-clamp-2">{issue.description}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                          <span>{timeAgo(new Date(issue.detectedAt))}</span>
                          <span>신호 {issue.signalCount || 0}개</span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </div>

                  {/* Agent opinions preview */}
                  {agentOpinions.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center space-x-2">
                        <Bot className="w-4 h-4 text-moss-600" />
                        <span className="text-sm text-gray-500">에이전트 의견:</span>
                        {agentOpinions.map((opinion: any) => (
                          <div key={opinion.role} className="flex items-center space-x-1">
                            <div className={cn("w-2 h-2 rounded-full", stanceColors[opinion.stance] || "bg-gray-300")} />
                            <span className="text-xs text-gray-600">{roleLabels[opinion.role] || opinion.role}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Issue Detail / Decision Packet */}
        <div className="lg:col-span-1">
          {selectedIssue ? (
            <div className="card sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Decision Packet</h3>

              {!selectedIssue.decisionPacket && (!selectedIssue.agentOpinions || selectedIssue.agentOpinions.length === 0) ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>아직 에이전트 심의가 진행되지 않았습니다</p>
                  <button
                    onClick={() => deliberateMutation.mutate(selectedIssue)}
                    disabled={deliberateMutation.isPending}
                    className="btn-primary mt-4"
                  >
                    {deliberateMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                    ) : null}
                    심의 시작
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Agent Opinions */}
                  {selectedIssue.decisionPacket?.agentOpinions && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">에이전트 의견</h4>
                      <div className="space-y-2">
                        {selectedIssue.decisionPacket.agentOpinions.map((opinion: any) => (
                          <div key={opinion.agentRole} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <div className={cn("w-3 h-3 rounded-full", stanceColors[opinion.stance] || "bg-gray-300")} />
                              <span className="text-sm font-medium">{roleLabels[opinion.agentRole] || opinion.agentRole}</span>
                            </div>
                            <span className="text-sm text-gray-500">
                              {Math.round((opinion.confidence || 0) * 100)}% 확신
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendation */}
                  {selectedIssue.decisionPacket?.recommendation && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">권고안</h4>
                      <p className="text-sm text-gray-700 p-3 bg-moss-50 rounded-lg">
                        {selectedIssue.decisionPacket.recommendation}
                      </p>
                    </div>
                  )}

                  {/* Risks */}
                  {selectedIssue.decisionPacket?.risks && selectedIssue.decisionPacket.risks.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-500 mb-2">리스크</h4>
                      <ul className="text-sm text-gray-700 p-3 bg-red-50 rounded-lg list-disc list-inside">
                        {selectedIssue.decisionPacket.risks.map((risk: string, i: number) => (
                          <li key={i}>{risk}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <button className="btn-primary w-full">
                      <MessageSquare className="w-4 h-4 mr-2 inline" />
                      제안서 생성
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="card text-center py-12 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>이슈를 선택하면 상세 정보가 표시됩니다</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
