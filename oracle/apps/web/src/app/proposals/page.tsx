"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useTranslations } from "next-intl";
import { Vote, Clock, CheckCircle, XCircle, Bot, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn, getStatusColor, timeAgo, formatNumber } from "@/lib/utils";
import { useVotingPower } from "@/hooks/useMOC";
import { api } from "@/lib/api";

function VotingBar({ forVotes, againstVotes, abstainVotes, t }: { forVotes: number; againstVotes: number; abstainVotes: number; t: any }) {
  const total = forVotes + againstVotes + abstainVotes;
  if (total === 0) return null;

  const forPercent = (forVotes / total) * 100;
  const againstPercent = (againstVotes / total) * 100;

  return (
    <div className="w-full">
      <div className="flex h-2 rounded-full overflow-hidden bg-gray-200">
        <div className="bg-green-500" style={{ width: `${forPercent}%` }} />
        <div className="bg-red-500" style={{ width: `${againstPercent}%` }} />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{t("proposals.for")} {forPercent.toFixed(1)}%</span>
        <span>{t("proposals.against")} {againstPercent.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function VoteModal({ proposal, onClose, t }: { proposal: any; onClose: () => void; t: any }) {
  const { formatted } = useVotingPower();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  // Extract title from decisionPacket
  const dp = proposal.decisionPacket;
  const rec = dp?.recommendation;
  const proposalTitle = proposal.title ||
    (typeof rec?.action === "string" ? rec.action : rec?.action?.action) ||
    dp?.issue?.title ||
    `Proposal #${proposal.id.slice(0, 8)}`;

  const handleVote = () => {
    if (!selectedChoice) return;
    alert(`Vote: ${selectedChoice} (${formatted} votes)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t("proposals.vote")}</h3>
        <p className="text-sm text-gray-600 mb-4">{proposalTitle}</p>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">{t("proposals.voteWeight")}: <span className="font-semibold text-moss-600">{formatted} MOC</span></p>
        </div>

        <div className="space-y-2 mb-4">
          {[
            { value: "for", label: t("proposals.for"), icon: CheckCircle, color: "text-green-600 border-green-500 bg-green-50" },
            { value: "against", label: t("proposals.against"), icon: XCircle, color: "text-red-600 border-red-500 bg-red-50" },
            { value: "abstain", label: t("proposals.abstain"), icon: Vote, color: "text-gray-600 border-gray-500 bg-gray-50" },
          ].map((choice) => (
            <button
              key={choice.value}
              onClick={() => setSelectedChoice(choice.value)}
              className={cn(
                "w-full flex items-center space-x-3 p-3 rounded-lg border-2 transition-all",
                selectedChoice === choice.value ? choice.color : "border-gray-200 hover:border-gray-300"
              )}
            >
              <choice.icon className="w-5 h-5" />
              <span className="font-medium">{choice.label}</span>
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">{t("proposals.reason")}</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            rows={3}
          />
        </div>

        <div className="flex space-x-3">
          <button onClick={onClose} className="btn-secondary flex-1">{t("common.cancel")}</button>
          <button
            onClick={handleVote}
            disabled={!selectedChoice}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            {t("proposals.castVote")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProposalsPage() {
  const t = useTranslations();
  const { isConnected } = useAccount();
  const [filter, setFilter] = useState<string>("all");
  const [votingProposal, setVotingProposal] = useState<any>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["proposals", filter],
    queryFn: () => api.getProposals(filter === "all" ? undefined : filter),
    refetchInterval: 30000,
  });

  const proposals = data?.proposals ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t("proposals.title")}</h1>
          <p className="mt-1 text-gray-500">{t("proposals.subtitle")}</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-gray-300 rounded-lg text-sm"
          >
            <option value="all">{t("common.all")}</option>
            <option value="active">{t("proposals.active")}</option>
            <option value="passed">{t("proposals.passed")}</option>
            <option value="rejected">{t("proposals.rejected")}</option>
          </select>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="card flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-moss-600" />
          </div>
        ) : proposals.length === 0 ? (
          <div className="card text-center py-12 text-gray-500">
            <Vote className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>{t("proposals.noProposals")}</p>
            <p className="text-sm">{t("proposals.createFirst")}</p>
          </div>
        ) : (
          proposals.map((proposal: any) => {
            const forVotes = Number(proposal.forVotes || 0);
            const againstVotes = Number(proposal.againstVotes || 0);
            const abstainVotes = Number(proposal.abstainVotes || 0);
            const total = forVotes + againstVotes + abstainVotes;
            const quorum = Number(proposal.quorum || 1000000);
            const quorumPercent = (total / quorum) * 100;
            const isExpanded = expandedId === proposal.id;
            const votingEndsAt = new Date(proposal.votingEndsAt);

            // Extract title and description from decisionPacket or direct fields
            const dp = proposal.decisionPacket;
            const rec = dp?.recommendation;
            const proposalTitle = proposal.title ||
              (typeof rec?.action === "string" ? rec.action : rec?.action?.action) ||
              dp?.issue?.title ||
              `Proposal #${proposal.id.slice(0, 8)}`;
            const proposalDescription = proposal.description ||
              proposal.summary ||
              (typeof rec?.rationale === "string" ? rec.rationale : "") ||
              dp?.issue?.description ||
              "";
            const expectedOutcome = typeof rec?.expectedOutcome === "string" ? rec.expectedOutcome : "";

            return (
              <div key={proposal.id} className="card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={cn("badge", getStatusColor(proposal.status))}>
                        {proposal.status === "active" ? t("proposals.active") :
                         proposal.status === "passed" ? t("proposals.passed") : t("proposals.rejected")}
                      </span>
                      {(proposal.aiAssisted || dp) && (
                        <span className="badge bg-purple-50 text-purple-600">
                          <Bot className="w-3 h-3 mr-1 inline" />
                          AI Assisted
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">{proposalTitle}</h3>
                    <p className="mt-1 text-sm text-gray-500">{proposalDescription}</p>
                    {expectedOutcome && (
                      <p className="mt-2 text-sm text-moss-600">
                        <span className="font-medium">{t("issues.expectedOutcome")}:</span> {expectedOutcome}
                      </p>
                    )}

                    <div className="mt-4">
                      <VotingBar
                        forVotes={forVotes}
                        againstVotes={againstVotes}
                        abstainVotes={abstainVotes}
                        t={t}
                      />
                    </div>

                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        {proposal.status === "active"
                          ? `${Math.max(0, Math.ceil((votingEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))}d`
                          : timeAgo(votingEndsAt)}
                      </span>
                      <span>{formatNumber(total)} MOC {t("proposals.votes")}</span>
                      <span>{t("proposals.quorum")} {quorumPercent.toFixed(0)}%</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2 ml-4">
                    {proposal.status === "active" && isConnected && (
                      <button
                        onClick={() => setVotingProposal(proposal)}
                        className="btn-primary"
                      >
                        {t("proposals.vote")}
                      </button>
                    )}
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                      className="text-sm text-gray-500 flex items-center"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      {t("common.view")}
                    </button>
                  </div>
                </div>

                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4">
                    {/* Vote Statistics */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{formatNumber(forVotes)}</p>
                        <p className="text-sm text-green-700">{t("proposals.for")}</p>
                      </div>
                      <div className="p-3 bg-red-50 rounded-lg">
                        <p className="text-2xl font-bold text-red-600">{formatNumber(againstVotes)}</p>
                        <p className="text-sm text-red-700">{t("proposals.against")}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-2xl font-bold text-gray-600">{formatNumber(abstainVotes)}</p>
                        <p className="text-sm text-gray-700">{t("proposals.abstain")}</p>
                      </div>
                    </div>

                    {/* Risks */}
                    {dp?.risks && dp.risks.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">{t("issues.risks")}</h4>
                        <div className="space-y-2">
                          {dp.risks.map((risk: any, i: number) => (
                            <div key={i} className="text-sm p-2 bg-red-50 rounded-lg">
                              {typeof risk === "string" ? (
                                <p>{risk}</p>
                              ) : (
                                <>
                                  <p className="font-medium text-red-700">{risk.description}</p>
                                  <div className="mt-1 flex flex-wrap gap-2 text-xs">
                                    <span className="px-2 py-0.5 bg-red-100 rounded">
                                      {t("issues.likelihood")}: {risk.likelihood}
                                    </span>
                                    <span className="px-2 py-0.5 bg-red-100 rounded">
                                      {t("issues.impact")}: {risk.impact}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Proposal Info */}
                    <div className="text-sm text-gray-500 pt-2 border-t border-gray-100">
                      <p>{t("proposals.proposer")}: <span className="font-mono text-gray-700">{proposal.proposer}</span></p>
                      <p>{t("proposals.quorum")}: {formatNumber(quorum)} MOC ({quorumPercent.toFixed(1)}% {t("proposals.reached") || "reached"})</p>
                      <p>ID: <span className="font-mono text-xs">{proposal.id}</span></p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {votingProposal && (
        <VoteModal
          proposal={votingProposal}
          onClose={() => setVotingProposal(null)}
          t={t}
        />
      )}
    </div>
  );
}
