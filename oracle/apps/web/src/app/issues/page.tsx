"use client";

import { useState } from "react";
import { AlertTriangle, MessageSquare, Users, Shield, Coins, Code, ChevronRight, Bot } from "lucide-react";
import { cn, getSeverityColor, timeAgo } from "@/lib/utils";

// Mock data
const mockIssues = [
  {
    id: "1",
    title: "커뮤니티 참여율 급락",
    description: "지난 7일간 거버넌스 참여율이 32% 감소했습니다. 투표 참여자 수와 토론 활동이 모두 줄어들고 있습니다.",
    priority: "urgent",
    status: "deliberating",
    category: "governance",
    detectedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    signalCount: 12,
    agentOpinions: [
      { role: "risk", stance: "support", confidence: 0.85 },
      { role: "treasury", stance: "support", confidence: 0.72 },
      { role: "community", stance: "strongly_support", confidence: 0.92 },
      { role: "product", stance: "neutral", confidence: 0.65 },
    ],
  },
  {
    id: "2",
    title: "대형 토큰 이동 감지",
    description: "상위 10개 지갑에서 총 5,000,000 MOC가 새로운 주소로 이동했습니다. 잠재적 시장 영향을 모니터링해야 합니다.",
    priority: "high",
    status: "analyzing",
    category: "security",
    detectedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
    signalCount: 5,
    agentOpinions: [
      { role: "risk", stance: "strongly_support", confidence: 0.88 },
      { role: "treasury", stance: "support", confidence: 0.78 },
    ],
  },
  {
    id: "3",
    title: "스마트 컨트랙트 가스비 최적화",
    description: "거버넌스 컨트랙트의 가스 사용량이 평균보다 23% 높습니다. 최적화를 통해 비용을 절감할 수 있습니다.",
    priority: "medium",
    status: "detected",
    category: "product",
    detectedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    signalCount: 8,
    agentOpinions: [],
  },
];

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
  const [issues] = useState(mockIssues);
  const [selectedIssue, setSelectedIssue] = useState<typeof mockIssues[0] | null>(null);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
        <p className="mt-1 text-gray-500">AI가 탐지한 이슈 및 에이전트 심의 현황</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Issues List */}
        <div className="lg:col-span-2 space-y-4">
          {issues.map((issue) => {
            const CategoryIcon = categoryIcons[issue.category] || AlertTriangle;
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
                        <span className={cn("badge", priorityColors[issue.priority])}>
                          {issue.priority.toUpperCase()}
                        </span>
                        <span className="badge bg-blue-50 text-blue-600">
                          {statusLabels[issue.status]}
                        </span>
                      </div>
                      <h3 className="mt-2 font-semibold text-gray-900">{issue.title}</h3>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">{issue.description}</p>
                      <div className="mt-2 flex items-center space-x-4 text-xs text-gray-400">
                        <span>{timeAgo(issue.detectedAt)}</span>
                        <span>신호 {issue.signalCount}개</span>
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Agent opinions preview */}
                {issue.agentOpinions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <Bot className="w-4 h-4 text-moss-600" />
                      <span className="text-sm text-gray-500">에이전트 의견:</span>
                      {issue.agentOpinions.map((opinion) => (
                        <div key={opinion.role} className="flex items-center space-x-1">
                          <div className={cn("w-2 h-2 rounded-full", stanceColors[opinion.stance])} />
                          <span className="text-xs text-gray-600">{roleLabels[opinion.role]}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Issue Detail / Decision Packet */}
        <div className="lg:col-span-1">
          {selectedIssue ? (
            <div className="card sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4">Decision Packet</h3>

              {selectedIssue.agentOpinions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                  <p>아직 에이전트 심의가 진행되지 않았습니다</p>
                  <button className="btn-primary mt-4">심의 시작</button>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Agent Opinions */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">에이전트 의견</h4>
                    <div className="space-y-2">
                      {selectedIssue.agentOpinions.map((opinion) => (
                        <div key={opinion.role} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className={cn("w-3 h-3 rounded-full", stanceColors[opinion.stance])} />
                            <span className="text-sm font-medium">{roleLabels[opinion.role]}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {Math.round(opinion.confidence * 100)}% 확신
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-2">권고안</h4>
                    <p className="text-sm text-gray-700 p-3 bg-moss-50 rounded-lg">
                      참여 인센티브 재설계를 통해 커뮤니티 활성화 필요. 단기적으로 투표 보상 증가를 검토하고, 장기적으로 게이미피케이션 요소 도입 권장.
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-4 border-t border-gray-100 space-y-2">
                    <button className="btn-primary w-full">
                      <MessageSquare className="w-4 h-4 mr-2 inline" />
                      제안서 생성
                    </button>
                    <button className="btn-secondary w-full">
                      토론 로그 보기
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
