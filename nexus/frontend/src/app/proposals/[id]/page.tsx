'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ProposalDetail } from '@/components/proposal-detail';
import { useState, useEffect } from 'react';
import type { Proposal, DecisionPacket } from '@bridge-2026/shared';

export default function ProposalDetailPage() {
  const params = useParams();
  const proposalId = params.id as string;
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [decisionPacket, setDecisionPacket] = useState<DecisionPacket | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 실제 API 호출
    // fetchProposal(proposalId).then(setProposal);
    // fetchDecisionPacket(proposal.decisionPacketId).then(setDecisionPacket);
    
    // 임시 데이터
    const mockProposal: Proposal = {
      id: proposalId,
      title: '[AI Assisted] 거버넌스 참여율 개선 방안',
      description: `최근 거버넌스 참여율이 지속적으로 감소하고 있습니다. 이는 커뮤니티의 의사결정 과정에 부정적인 영향을 미치고 있습니다.

이 제안은 다음과 같은 방안을 포함합니다:
1. 참여 인센티브 강화
2. 투표 프로세스 간소화
3. 제안 알림 시스템 개선

이러한 개선을 통해 거버넌스 참여율을 30% 이상 향상시킬 수 있을 것으로 예상됩니다.`,
      type: 'governance',
      status: 'active',
      decisionPacketId: 'dp-1',
      issueId: 'issue-1',
      actions: [],
      votingStartTime: Date.now(),
      votingEndTime: Date.now() + 7 * 24 * 60 * 60 * 1000,
      minParticipationRate: 0.1,
      passingThreshold: 0.5,
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
      metadata: {
        aiAssisted: true,
        agentConfidence: 0.85,
      },
    };

    const mockDecisionPacket: DecisionPacket = {
      id: 'dp-1',
      issueId: 'issue-1',
      recommendation: '거버넌스 참여율 개선을 위해 참여 인센티브를 강화하고, 투표 프로세스를 간소화하는 것을 권장합니다.',
      recommendationDetails: `AI 에이전트들의 분석 결과, 거버넌스 참여율 감소의 주요 원인은 다음과 같습니다:
1. 투표 프로세스의 복잡성
2. 참여에 대한 인센티브 부족
3. 제안에 대한 정보 접근성 부족

이를 해결하기 위해 단계적 개선 방안을 제안합니다.`,
      alternatives: [
        {
          title: '인센티브만 강화',
          description: '참여 인센티브만 강화하는 방안',
        },
        {
          title: '프로세스만 간소화',
          description: '투표 프로세스만 간소화하는 방안',
        },
      ],
      risks: [
        {
          title: '예산 부담',
          description: '인센티브 강화로 인한 예산 부담 증가 가능성',
          severity: 'medium',
        },
        {
          title: '시스템 복잡도 증가',
          description: '알림 시스템 추가로 인한 시스템 복잡도 증가',
          severity: 'low',
        },
      ],
      kpis: [
        { name: '참여율', targetValue: 0.3 },
        { name: '투표 완료 시간', targetValue: 5 },
      ],
      overallConfidence: 0.85,
      consensusConfidence: 0.82,
      agentReasoning: [],
      createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    };

    setTimeout(() => {
      setProposal(mockProposal);
      setDecisionPacket(mockDecisionPacket);
      setLoading(false);
    }, 500);
  }, [proposalId]);

  if (loading) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto text-center py-12">
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </main>
    );
  }

  if (!proposal) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <p className="text-gray-600 mb-4">제안을 찾을 수 없습니다.</p>
            <Link
              href="/proposals"
              className="text-moss-600 hover:text-moss-700 font-medium"
            >
              제안 목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-between items-center mb-8">
          <Link
            href="/proposals"
            className="px-4 py-2 text-moss-600 hover:text-moss-700"
          >
            ← 제안 목록
          </Link>
          <ConnectButton />
        </header>

        <ProposalDetail proposal={proposal} decisionPacket={decisionPacket || undefined} />
      </div>
    </main>
  );
}

