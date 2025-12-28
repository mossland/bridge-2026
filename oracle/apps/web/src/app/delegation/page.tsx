"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { useTranslations } from "next-intl";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Bot, Shield, Coins, Code, Plus, Trash2, Check, AlertTriangle, Loader2 } from "lucide-react";
import { cn, timeAgo } from "@/lib/utils";
import { useVotingPower } from "@/hooks/useMOC";
import { api } from "@/lib/api";

const agents = [
  { id: "risk-agent", nameKey: "security", icon: Shield, reputation: 87, totalDelegated: 1250000, recentAccuracy: 92 },
  { id: "treasury-agent", nameKey: "treasury", icon: Coins, reputation: 82, totalDelegated: 980000, recentAccuracy: 88 },
  { id: "community-agent", nameKey: "community", icon: Users, reputation: 91, totalDelegated: 1540000, recentAccuracy: 95 },
  { id: "product-agent", nameKey: "technical", icon: Code, reputation: 78, totalDelegated: 720000, recentAccuracy: 85 },
];

function DelegationForm({ onClose, t, address, onSuccess }: { onClose: () => void; t: any; address: string; onSuccess: () => void }) {
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [maxBudget, setMaxBudget] = useState<number>(0);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);

  const categories = [
    { id: "governance", label: "Governance" },
    { id: "treasury", label: t("delegation.treasury") },
    { id: "security", label: "Security" },
    { id: "product", label: "Product" },
    { id: "community", label: t("delegation.community") },
  ];

  const createMutation = useMutation({
    mutationFn: async () => {
      const conditions = [
        { field: "decisionPacket.issue.category", operator: "in" as const, value: selectedCategories },
        ...(maxBudget > 0 ? [{ field: "decisionPacket.budget", operator: "lte" as const, value: maxBudget }] : []),
      ];
      const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();
      return api.createDelegation(address, selectedAgent!, conditions, expiresAt);
    },
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const handleSubmit = () => {
    if (!selectedAgent || selectedCategories.length === 0) return;
    createMutation.mutate();
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
          <button onClick={onClose} className="btn-secondary flex-1" disabled={createMutation.isPending}>
            {t("common.cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedAgent || selectedCategories.length === 0 || createMutation.isPending}
            className="btn-primary flex-1 disabled:opacity-50 flex items-center justify-center"
          >
            {createMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              t("common.save")
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DelegationPage() {
  const t = useTranslations();
  const queryClient = useQueryClient();
  const { isConnected, address } = useAccount();
  const { formatted: votingPower } = useVotingPower();
  const [showForm, setShowForm] = useState(false);

  const { data: delegationsData, isLoading } = useQuery({
    queryKey: ["delegations", address],
    queryFn: () => api.getDelegations(address),
    enabled: !!address,
    refetchInterval: 30000,
  });

  const revokeMutation = useMutation({
    mutationFn: (id: string) => api.revokeDelegation(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["delegations"] });
    },
  });

  const delegations = delegationsData?.policies ?? [];
  const activeDelegations = delegations.filter((d: any) => d.active);
  const totalDelegated = activeDelegations.length > 0 ? votingPower : "0";

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
          <p className="text-2xl font-bold text-gray-900">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : activeDelegations.length}
          </p>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Agents</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agents.map((agent) => {
            const Icon = agent.icon;
            const userDelegation = delegations.find((d: any) => d.delegate === agent.id && d.active);
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
        {isLoading ? (
          <div className="card flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-moss-600" />
          </div>
        ) : delegations.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t("delegation.noPolicies")}</p>
            {isConnected && (
              <button onClick={() => setShowForm(true)} className="btn-primary mt-4">
                {t("delegation.createFirst")}
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {delegations.map((delegation: any) => {
              const agent = agents.find(a => a.id === delegation.delegate);
              const Icon = agent?.icon || Bot;
              const isActive = delegation.active;
              const categories = delegation.conditions
                ?.filter((c: any) => c.type === "category")
                ?.flatMap((c: any) => c.value) ?? [];

              return (
                <div
                  key={delegation.id}
                  className={cn("card flex items-center justify-between", !isActive && "opacity-60")}
                >
                  <div className="flex items-center space-x-4">
                    <div className={cn("p-2 rounded-lg", isActive ? "bg-moss-50" : "bg-gray-100")}>
                      <Icon className={cn("w-6 h-6", isActive ? "text-moss-600" : "text-gray-400")} />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-gray-900">
                          {agent ? t(`delegation.${agent.nameKey}`) : delegation.delegate}
                        </h3>
                        <span className={cn(
                          "badge text-xs",
                          isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                        )}>
                          {isActive ? t("delegation.active") : t("delegation.inactive")}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 mt-1">
                        {categories.map((cat: string) => (
                          <span key={cat} className="badge bg-gray-100 text-gray-600 text-xs">{cat}</span>
                        ))}
                        {delegation.expiresAt && (
                          <span className="text-xs text-gray-400">
                            {t("common.expires")}: {timeAgo(new Date(delegation.expiresAt))}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {isActive && (
                    <button
                      onClick={() => revokeMutation.mutate(delegation.id)}
                      disabled={revokeMutation.isPending}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50"
                    >
                      {revokeMutation.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showForm && address && (
        <DelegationForm
          onClose={() => setShowForm(false)}
          t={t}
          address={address}
          onSuccess={() => queryClient.invalidateQueries({ queryKey: ["delegations"] })}
        />
      )}
    </div>
  );
}
