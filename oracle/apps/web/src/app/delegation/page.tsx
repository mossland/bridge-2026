"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Users, Bot, Shield, Coins, Code, Plus, Trash2, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVotingPower } from "@/hooks/useMOC";

// Mock data for agents
const agents = [
  {
    id: "risk-agent",
    name: "Risk & Security",
    icon: Shield,
    description: "보안 및 리스크 관점에서 제안을 평가합니다",
    reputation: 87,
    totalDelegated: 1250000,
    recentAccuracy: 92,
  },
  {
    id: "treasury-agent",
    name: "Treasury",
    icon: Coins,
    description: "재정 및 예산 관점에서 제안을 평가합니다",
    reputation: 82,
    totalDelegated: 980000,
    recentAccuracy: 88,
  },
  {
    id: "community-agent",
    name: "Community",
    icon: Users,
    description: "커뮤니티 영향 관점에서 제안을 평가합니다",
    reputation: 91,
    totalDelegated: 1540000,
    recentAccuracy: 95,
  },
  {
    id: "product-agent",
    name: "Product",
    icon: Code,
    description: "기술 및 구현 관점에서 제안을 평가합니다",
    reputation: 78,
    totalDelegated: 720000,
    recentAccuracy: 85,
  },
];

// Mock user delegations
const mockDelegations = [
  {
    id: "1",
    agentId: "community-agent",
    categories: ["governance", "community"],
    maxBudget: 10000,
    excludeEmergency: true,
    vetoEnabled: true,
    active: true,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

const categories = [
  { id: "governance", label: "거버넌스" },
  { id: "treasury", label: "재정" },
  { id: "security", label: "보안" },
  { id: "product", label: "제품" },
  { id: "community", label: "커뮤니티" },
];

function DelegationForm({ onClose }: { onClose: () => void }) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxBudget, setMaxBudget] = useState<number>(0);
  const [excludeEmergency, setExcludeEmergency] = useState(true);
  const [vetoEnabled, setVetoEnabled] = useState(true);

  const handleSubmit = () => {
    if (!selectedAgent || selectedCategories.length === 0) return;
    // In production, this would call the API
    alert("위임이 설정되었습니다");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">새 위임 설정</h3>

        {/* Agent Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">에이전트 선택</label>
          <div className="grid grid-cols-2 gap-3">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-all",
                    selectedAgent === agent.id
                      ? "border-moss-500 bg-moss-50"
                      : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-moss-600" />
                    <span className="font-medium text-sm">{agent.name}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    평판 {agent.reputation}점
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">카테고리 제한</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategories(prev =>
                    prev.includes(category.id)
                      ? prev.filter(c => c !== category.id)
                      : [...prev, category.id]
                  );
                }}
                className={cn(
                  "badge cursor-pointer",
                  selectedCategories.includes(category.id)
                    ? "bg-moss-100 text-moss-700"
                    : "bg-gray-100 text-gray-600"
                )}
              >
                {selectedCategories.includes(category.id) && <Check className="w-3 h-3 mr-1" />}
                {category.label}
              </button>
            ))}
          </div>
          <p className="mt-1 text-xs text-gray-500">선택한 카테고리의 제안에만 위임됩니다</p>
        </div>

        {/* Budget Limit */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            예산 상한 (MOC)
          </label>
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="0 = 무제한"
          />
          <p className="mt-1 text-xs text-gray-500">이 금액을 초과하는 예산 제안은 직접 투표해야 합니다</p>
        </div>

        {/* Safety Options */}
        <div className="mb-6 space-y-3">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={excludeEmergency}
              onChange={(e) => setExcludeEmergency(e.target.checked)}
              className="rounded border-gray-300 text-moss-600"
            />
            <span className="text-sm text-gray-700">긴급 안건 제외</span>
          </label>
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={vetoEnabled}
              onChange={(e) => setVetoEnabled(e.target.checked)}
              className="rounded border-gray-300 text-moss-600"
            />
            <span className="text-sm text-gray-700">거부권 활성화 (24시간 내 취소 가능)</span>
          </label>
        </div>

        {/* Warning */}
        <div className="mb-6 p-3 bg-yellow-50 rounded-lg flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">
            위임된 투표권은 에이전트가 자동으로 행사합니다. 언제든지 위임을 취소하거나 직접 투표할 수 있습니다.
          </p>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button onClick={onClose} className="btn-secondary flex-1">취소</button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAgent || selectedCategories.length === 0}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            위임 설정
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DelegationPage() {
  const { isConnected } = useAccount();
  const { formatted: votingPower } = useVotingPower();
  const [delegations, setDelegations] = useState(mockDelegations);
  const [showForm, setShowForm] = useState(false);

  const totalDelegated = delegations.filter(d => d.active).length > 0 ? votingPower : "0";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Delegation</h1>
          <p className="mt-1 text-gray-500">에이전트에게 투표권을 위임하세요</p>
        </div>
        {isConnected && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>새 위임</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">나의 투표권</p>
          <p className="text-2xl font-bold text-gray-900">{votingPower} MOC</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">위임된 투표권</p>
          <p className="text-2xl font-bold text-moss-600">{totalDelegated} MOC</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">활성 위임</p>
          <p className="text-2xl font-bold text-gray-900">{delegations.filter(d => d.active).length}개</p>
        </div>
      </div>

      {/* Agents Grid */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">에이전트 현황</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const userDelegation = delegations.find(d => d.agentId === agent.id && d.active);
            return (
              <div key={agent.id} className="card">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="p-2 bg-moss-50 rounded-lg">
                    <Icon className="w-6 h-6 text-moss-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                    {userDelegation && (
                      <span className="badge bg-moss-100 text-moss-700 text-xs">위임 중</span>
                    )}
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-4">{agent.description}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">평판</span>
                    <span className="font-medium">{agent.reputation}점</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">총 위임량</span>
                    <span className="font-medium">{(agent.totalDelegated / 1000000).toFixed(1)}M MOC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">최근 정확도</span>
                    <span className="font-medium">{agent.recentAccuracy}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* My Delegations */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">나의 위임</h2>
        {delegations.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>아직 위임 설정이 없습니다</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              첫 위임 설정하기
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {delegations.map((delegation) => {
              const agent = agents.find(a => a.id === delegation.agentId);
              if (!agent) return null;
              const Icon = agent.icon;
              return (
                <div key={delegation.id} className="card flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-moss-50 rounded-lg">
                      <Icon className="w-6 h-6 text-moss-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{agent.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {delegation.categories.map(cat => (
                          <span key={cat} className="badge bg-gray-100 text-gray-600 text-xs">
                            {categories.find(c => c.id === cat)?.label}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center space-x-3 mt-2 text-sm text-gray-500">
                        {delegation.maxBudget > 0 && (
                          <span>예산 상한: {delegation.maxBudget.toLocaleString()} MOC</span>
                        )}
                        {delegation.excludeEmergency && <span>긴급 제외</span>}
                        {delegation.vetoEnabled && <span>거부권 활성</span>}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setDelegations(prev => prev.filter(d => d.id !== delegation.id))}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delegation Form Modal */}
      {showForm && <DelegationForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
