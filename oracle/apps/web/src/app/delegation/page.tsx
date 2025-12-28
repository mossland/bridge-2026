"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useTranslations } from "next-intl";
import { Users, Bot, Shield, Coins, Code, Plus, Trash2, Check, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVotingPower } from "@/hooks/useMOC";

const agents = [
  { id: "risk-agent", nameKey: "security", icon: Shield, reputation: 87, totalDelegated: 1250000, recentAccuracy: 92 },
  { id: "treasury-agent", nameKey: "treasury", icon: Coins, reputation: 82, totalDelegated: 980000, recentAccuracy: 88 },
  { id: "community-agent", nameKey: "community", icon: Users, reputation: 91, totalDelegated: 1540000, recentAccuracy: 95 },
  { id: "product-agent", nameKey: "technical", icon: Code, reputation: 78, totalDelegated: 720000, recentAccuracy: 85 },
];

const mockDelegations = [
  { id: "1", agentId: "community-agent", categories: ["governance", "community"], maxBudget: 10000, excludeEmergency: true, vetoEnabled: true, active: true },
];

function DelegationForm({ onClose, t }: { onClose: () => void; t: any }) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxBudget, setMaxBudget] = useState<number>(0);
  const [excludeEmergency, setExcludeEmergency] = useState(true);
  const [vetoEnabled, setVetoEnabled] = useState(true);

  const categories = [
    { id: "governance", label: "Governance" },
    { id: "treasury", label: t("delegation.treasury") },
    { id: "security", label: "Security" },
    { id: "product", label: "Product" },
    { id: "community", label: t("delegation.community") },
  ];

  const handleSubmit = () => {
    if (!selectedAgent || selectedCategories.length === 0) return;
    alert("Delegation set");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("delegation.create")}</h3>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("delegation.delegateTo")}</label>
          <div className="grid grid-cols-2 gap-3">
            {agents.map((agent) => {
              const Icon = agent.icon;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent.id)}
                  className={cn(
                    "p-3 rounded-lg border-2 text-left transition-all",
                    selectedAgent === agent.id ? "border-moss-500 bg-moss-50" : "border-gray-200 hover:border-gray-300"
                  )}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-moss-600" />
                    <span className="font-medium text-sm">{t(`delegation.${agent.nameKey}`)}</span>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">{agent.reputation} pts</div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("delegation.category")}</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategories(prev =>
                    prev.includes(category.id) ? prev.filter(c => c !== category.id) : [...prev, category.id]
                  );
                }}
                className={cn(
                  "badge cursor-pointer",
                  selectedCategories.includes(category.id) ? "bg-moss-100 text-moss-700" : "bg-gray-100 text-gray-600"
                )}
              >
                {selectedCategories.includes(category.id) && <Check className="w-3 h-3 mr-1" />}
                {category.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">{t("delegation.maxAmount")} (MOC)</label>
          <input
            type="number"
            value={maxBudget}
            onChange={(e) => setMaxBudget(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg p-2"
            placeholder="0 = unlimited"
          />
        </div>

        <div className="mb-6 p-3 bg-yellow-50 rounded-lg flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-yellow-700">{t("delegation.conditions")}</p>
        </div>

        <div className="flex space-x-3">
          <button onClick={onClose} className="btn-secondary flex-1">{t("common.cancel")}</button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAgent || selectedCategories.length === 0}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {t("common.save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DelegationPage() {
  const t = useTranslations();
  const { isConnected } = useAccount();
  const { formatted: votingPower } = useVotingPower();
  const [delegations, setDelegations] = useState(mockDelegations);
  const [showForm, setShowForm] = useState(false);

  const totalDelegated = delegations.filter(d => d.active).length > 0 ? votingPower : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("delegation.title")}</h1>
          <p className="mt-1 text-gray-500">{t("delegation.subtitle")}</p>
        </div>
        {isConnected && (
          <button onClick={() => setShowForm(true)} className="btn-primary flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>{t("delegation.create")}</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <p className="text-sm text-gray-500">{t("proposals.voteWeight")}</p>
          <p className="text-2xl font-bold text-gray-900">{votingPower} MOC</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">{t("delegation.delegate")}</p>
          <p className="text-2xl font-bold text-moss-600">{totalDelegated} MOC</p>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500">{t("delegation.active")}</p>
          <p className="text-2xl font-bold text-gray-900">{delegations.filter(d => d.active).length}</p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agents</h2>
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
                    <h3 className="font-semibold text-gray-900">{t(`delegation.${agent.nameKey}`)}</h3>
                    {userDelegation && (
                      <span className="badge bg-moss-100 text-moss-700 text-xs">{t("delegation.active")}</span>
                    )}
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("outcomes.score")}</span>
                    <span className="font-medium">{agent.reputation}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">{t("outcomes.accuracy")}</span>
                    <span className="font-medium">{agent.recentAccuracy}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">{t("delegation.title")}</h2>
        {delegations.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t("delegation.noPolicies")}</p>
            <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
              {t("delegation.createFirst")}
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
                      <h3 className="font-semibold text-gray-900">{t(`delegation.${agent.nameKey}`)}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {delegation.categories.map(cat => (
                          <span key={cat} className="badge bg-gray-100 text-gray-600 text-xs">{cat}</span>
                        ))}
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

      {showForm && <DelegationForm onClose={() => setShowForm(false)} t={t} />}
    </div>
  );
}
