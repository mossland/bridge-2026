/**
 * Outcome Types
 * 
 * Outcome은 Proof of Outcome에서 측정된 거버넌스 결정의 실행 결과를 나타냅니다.
 */

export enum OutcomeStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  SUCCESS = 'success',
  PARTIAL_SUCCESS = 'partial_success',
  FAILURE = 'failure',
  CANCELLED = 'cancelled',
}

export interface KPIMeasurement {
  /** KPI 이름 */
  kpiName: string;
  /** 측정 값 */
  value: number;
  /** 목표 값 */
  targetValue?: number;
  /** 측정 시간 */
  measuredAt: number;
  /** 측정 방법 */
  measurementMethod: string;
  /** 데이터 소스 */
  dataSource: string;
  /** 메타데이터 */
  metadata?: Record<string, unknown>;
}

export interface OutcomeEvaluation {
  /** 평가자 (자동/수동) */
  evaluator: 'automatic' | 'manual';
  /** 평가자 식별자 */
  evaluatorId?: string;
  /** 성공 여부 */
  success: boolean;
  /** 성공률 (0-1) */
  successRate: number;
  /** 평가 근거 */
  reasoning: string;
  /** 평가 시간 */
  evaluatedAt: number;
}

export interface Outcome {
  /** 고유 식별자 */
  id: string;
  /** 관련 제안 ID */
  proposalId: string;
  /** 관련 Decision Packet ID */
  decisionPacketId: string;
  /** 현재 상태 */
  status: OutcomeStatus;
  /** KPI 측정 결과들 */
  kpiMeasurements: KPIMeasurement[];
  /** 평가 결과 */
  evaluation?: OutcomeEvaluation;
  /** 실행 시작 시간 */
  executionStartTime: number;
  /** 실행 완료 시간 */
  executionEndTime?: number;
  /** 온체인 증명 해시 */
  onChainProofHash?: string;
  /** IPFS 참조 */
  ipfsRef?: string;
  /** 생성 시간 */
  createdAt: number;
  /** 업데이트 시간 */
  updatedAt: number;
  /** 메타데이터 */
  metadata?: Record<string, unknown>;
}

/**
 * 신뢰도 및 평판 정보
 */
export interface Reputation {
  /** 에이전트 타입 */
  agentType: string;
  /** 총 평가 횟수 */
  totalEvaluations: number;
  /** 성공 횟수 */
  successCount: number;
  /** 실패 횟수 */
  failureCount: number;
  /** 평균 신뢰도 점수 (0-1) */
  averageConfidence: number;
  /** 신뢰도 점수 (0-1) */
  trustScore: number;
  /** 마지막 업데이트 시간 */
  updatedAt: number;
}

/**
 * 거버넌스 학습 데이터
 */
export interface GovernanceLearning {
  /** 학습 데이터 ID */
  id: string;
  /** 관련 이슈 카테고리 */
  issueCategories: string[];
  /** 관련 에이전트 타입들 */
  agentTypes: string[];
  /** 성공 패턴 */
  successPatterns?: string[];
  /** 실패 패턴 */
  failurePatterns?: string[];
  /** 개선 제안 */
  improvementSuggestions?: string[];
  /** 생성 시간 */
  createdAt: number;
}


