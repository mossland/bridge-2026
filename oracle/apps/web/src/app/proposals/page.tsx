"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Vote, Clock, CheckCircle, XCircle, Bot, ChevronDown, ChevronUp } from "lucide-react";
import { cn, getStatusColor, timeAgo, formatNumber } from "@/lib/utils";
import { useVotingPower } from "@/hooks/useMOC";

// Mock data
const mockProposals = [
  {
    id: "1",
    title: "참여 인센티브 재설계안",
    summary: "커뮤니티 참여율 하락에 대응하여 투표 보상을 증가시키고, 새로운 게이미피케이션 요소를 도입합니다.",
    status: "active",
    aiAssisted: true,
    proposer: "0x1234...5678",
    votingEndsAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    quorum: 1000000,
    threshold: 50,
    forVotes: 750000,
    againstVotes: 150000,
    abstainVotes: 50000,
  },
  {
    id: "2",
    title: "보안 감사 예산 승인",
    summary: "Q1 스마트 컨트랙트 보안 감사를 위한 50,000 MOC 예산을 승인합니다.",
    status: "active",
    aiAssisted: true,
    proposer: "0x2345...6789",
    votingEndsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    quorum: 1000000,
    threshold: 50,
    forVotes: 420000,
    againstVotes: 80000,
    abstainVotes: 20000,
  },
  {
    id: "3",
    title: "가스비 최적화 프로젝트",
    summary: "거버넌스 컨트랙트 가스비를 20% 절감하기 위한 개발 프로젝트를 승인합니다.",
    status: "passed",
    aiAssisted: false,
    proposer: "0x3456...7890",
    votingEndsAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    quorum: 1000000,
    threshold: 50,
    forVotes: 890000,
    againstVotes: 110000,
    abstainVotes: 30000,
  },
];

function VotingBar({ forVotes, againstVotes, abstainVotes }: { forVotes: number; againstVotes: number; abstainVotes: number }) {
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
        <span>찬성 {forPercent.toFixed(1)}%</span>
        <span>반대 {againstPercent.toFixed(1)}%</span>
      </div>
    </div>
  );
}

function VoteModal({ proposal, onClose }: { proposal: typeof mockProposals[0]; onClose: () => void }) {
  const { address } = useAccount();
  const { votingPower, formatted } = useVotingPower();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  const handleVote = () => {
    if (!selectedChoice) return;
    // In production, this would call the API/contract
    alert(`투표 완료: ${selectedChoice} (${formatted} votes)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">투표하기</h3>
        <p className="text-sm text-gray-600 mb-4">{proposal.title}</p>

        <div className="mb-4">
          <p className="text-sm text-gray-500 mb-2">나의 투표권: <span className="font-semibold text-moss-600">{formatted} MOC</span></p>
        </div>

        <div className="space-y-2 mb-4">
          {[
            { value: "for", label: "찬성", icon: CheckCircle, color: "text-green-600 border-green-500 bg-green-50" },
            { value: "against", label: "반대", icon: XCircle, color: "text-red-600 border-red-500 bg-red-50" },
            { value: "abstain", label: "기권", icon: Vote, color: "text-gray-600 border-gray-500 bg-gray-50" },
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
          <label className="block text-sm font-medium text-gray-700 mb-1">투표 이유 (선택)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm"
            rows={3}
            placeholder="투표 이유를 입력하세요..."
          />
        </div>

        <div className="flex space-x-3">
          <button onClick={onClose} className="btn-secondary flex-1">취소</button>
          <button
            onClick={handleVote}
            disabled={!selectedChoice}
            className="btn-primary flex-1 disabled:opacity-50"
          >
            투표하기
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProposalsPage() {
  const { isConnected } = useAccount();
  const [proposals] = useState(mockProposals);
  const [filter, setFilter] = useState<string>("all");
  const [votingProposal, setVotingProposal] = useState<typeof mockProposals[0] | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filteredProposals = filter === "all"
    ? proposals
    : proposals.filter(p => p.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Proposals</h1>
          <p className="mt-1 text-gray-500">MOC 홀더 투표로 거버넌스에 참여하세요</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border-gray-300 rounded-lg text-sm"
          >
            <option value="all">전체</option>
            <option value="active">진행 중</option>
            <option value="passed">통과</option>
            <option value="rejected">거부</option>
          </select>
        </div>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.map((proposal) => {
          const total = proposal.forVotes + proposal.againstVotes + proposal.abstainVotes;
          const quorumPercent = (total / proposal.quorum) * 100;
          const isExpanded = expandedId === proposal.id;

          return (
            <div key={proposal.id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={cn("badge", getStatusColor(proposal.status))}>
                      {proposal.status === "active" ? "진행 중" :
                       proposal.status === "passed" ? "통과" : "거부"}
                    </span>
                    {proposal.aiAssisted && (
                      <span className="badge bg-purple-50 text-purple-600">
                        <Bot className="w-3 h-3 mr-1 inline" />
                        AI Assisted
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">{proposal.title}</h3>
                  <p className="mt-1 text-sm text-gray-500">{proposal.summary}</p>

                  <div className="mt-4">
                    <VotingBar
                      forVotes={proposal.forVotes}
                      againstVotes={proposal.againstVotes}
                      abstainVotes={proposal.abstainVotes}
                    />
                  </div>

                  <div className="mt-3 flex items-center space-x-4 text-sm text-gray-500">
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {proposal.status === "active"
                        ? `${Math.ceil((proposal.votingEndsAt.getTime() - Date.now()) / (24 * 60 * 60 * 1000))}일 남음`
                        : timeAgo(proposal.votingEndsAt)}
                    </span>
                    <span>총 {formatNumber(total)} MOC 투표</span>
                    <span>정족수 {quorumPercent.toFixed(0)}%</span>
                  </div>
                </div>

                <div className="flex flex-col items-end space-y-2 ml-4">
                  {proposal.status === "active" && isConnected && (
                    <button
                      onClick={() => setVotingProposal(proposal)}
                      className="btn-primary"
                    >
                      투표하기
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : proposal.id)}
                    className="text-sm text-gray-500 flex items-center"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    상세 보기
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{formatNumber(proposal.forVotes)}</p>
                      <p className="text-sm text-green-700">찬성</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg">
                      <p className="text-2xl font-bold text-red-600">{formatNumber(proposal.againstVotes)}</p>
                      <p className="text-sm text-red-700">반대</p>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-2xl font-bold text-gray-600">{formatNumber(proposal.abstainVotes)}</p>
                      <p className="text-sm text-gray-700">기권</p>
                    </div>
                  </div>
                  <div className="mt-4 text-sm text-gray-500">
                    <p>제안자: {proposal.proposer}</p>
                    <p>정족수: {formatNumber(proposal.quorum)} MOC</p>
                    <p>통과 기준: {proposal.threshold}% 이상</p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Voting Modal */}
      {votingProposal && (
        <VoteModal
          proposal={votingProposal}
          onClose={() => setVotingProposal(null)}
        />
      )}
    </div>
  );
}
