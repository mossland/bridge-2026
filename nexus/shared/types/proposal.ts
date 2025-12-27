/**
 * Proposal Types
 * 
 * 제안은 Human Governance에서 투표 대상이 되는 구조화된 제안서입니다.
 */

export enum ProposalStatus {
  DRAFT = 'draft',
  PENDING = 'pending',
  ACTIVE = 'active',
  PASSED = 'passed',
  REJECTED = 'rejected',
  EXECUTED = 'executed',
  CANCELLED = 'cancelled',
}

export enum ProposalType {
  GOVERNANCE = 'governance',
  TREASURY = 'treasury',
  TECHNICAL = 'technical',
  POLICY = 'policy',
}

export interface ProposalAction {
  /** 액션 타입 */
  type: string;
  /** 액션 파라미터 */
  parameters: Record<string, unknown>;
  /** 실행 조건 */
  conditions?: string[];
}

export interface Proposal {
  /** 고유 식별자 */
  id: string;
  /** 제안 제목 */
  title: string;
  /** 제안 설명 */
  description: string;
  /** 제안 타입 */
  type: ProposalType;
  /** 현재 상태 */
  status: ProposalStatus;
  /** 관련 Decision Packet ID */
  decisionPacketId: string;
  /** 관련 이슈 ID */
  issueId: string;
  /** 제안된 액션들 */
  actions: ProposalAction[];
  /** 투표 시작 시간 */
  votingStartTime?: number;
  /** 투표 종료 시간 */
  votingEndTime?: number;
  /** 최소 투표율 (0-1) */
  minParticipationRate?: number;
  /** 통과 기준 (0-1) */
  passingThreshold?: number;
  /** 생성자 */
  createdBy?: string;
  /** 생성 시간 */
  createdAt: number;
  /** 업데이트 시간 */
  updatedAt: number;
  /** 메타데이터 */
  metadata?: Record<string, unknown>;
}

export interface Vote {
  /** 고유 식별자 */
  id: string;
  /** 제안 ID */
  proposalId: string;
  /** 투표자 주소 */
  voterAddress: string;
  /** 투표 선택 (yes, no, abstain) */
  choice: 'yes' | 'no' | 'abstain';
  /** 투표 가중치 (토큰 수량 등) */
  weight: number;
  /** 투표 시간 */
  votedAt: number;
  /** 온체인 트랜잭션 해시 */
  txHash?: string;
}

export interface ProposalResult {
  /** 제안 ID */
  proposalId: string;
  /** 총 투표 수 */
  totalVotes: number;
  /** 찬성 투표 수 */
  yesVotes: number;
  /** 반대 투표 수 */
  noVotes: number;
  /** 기권 투표 수 */
  abstainVotes: number;
  /** 총 투표 가중치 */
  totalWeight: number;
  /** 찬성 가중치 */
  yesWeight: number;
  /** 반대 가중치 */
  noWeight: number;
  /** 기권 가중치 */
  abstainWeight: number;
  /** 통과 여부 */
  passed: boolean;
  /** 투표율 */
  participationRate: number;
  /** 계산 시간 */
  calculatedAt: number;
}

/**
 * 위임 정책 (Delegation Policy)
 */
export interface DelegationPolicy {
  /** 지갑 주소 */
  wallet: string;
  /** 에이전트 ID */
  agent_id: string;
  /** 범위 제한 */
  scope: {
    /** 허용 카테고리 */
    categories?: string[];
    /** 허용 태그 */
    tags?: string[];
    /** 제외 카테고리 */
    exclude_categories?: string[];
    /** 제외 태그 */
    exclude_tags?: string[];
  };
  /** 월별 최대 예산 */
  max_budget_per_month?: number;
  /** 제안당 최대 예산 */
  max_budget_per_proposal?: number;
  /** 긴급안건 제외 여부 */
  no_vote_on_emergency: boolean;
  /** 대기 시간 (시간) */
  cooldown_window_hours: number;
  /** 거부권 활성화 여부 */
  veto_enabled: boolean;
  /** 거부권 알림 여부 */
  veto_notification?: boolean;
  /** 사람 검토 필요 예산 임계값 */
  require_human_review_above?: number;
  /** 일일 최대 투표 수 */
  max_votes_per_day?: number;
}

