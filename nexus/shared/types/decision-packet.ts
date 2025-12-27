/**
 * Decision Packet Types
 * 
 * Decision Packet은 Agentic Consensus에서 생성된 종합 의사결정 정보를 담는 구조입니다.
 */

export enum AgentType {
  RISK_SECURITY = 'risk_security',
  TREASURY = 'treasury',
  COMMUNITY = 'community',
  PRODUCT_FEASIBILITY = 'product_feasibility',
}

export interface AgentReasoning {
  /** 에이전트 타입 */
  agentType: AgentType;
  /** 에이전트의 분석 결과 */
  analysis: string;
  /** 추천 사항 */
  recommendation: string;
  /** 신뢰도 점수 (0-1) */
  confidence: number;
  /** 주요 고려사항 */
  considerations: string[];
  /** 불확실성 표시 */
  uncertainties?: string[];
  /** 참고 자료 */
  references?: string[];
}

export interface Alternative {
  /** 대안 제목 */
  title: string;
  /** 대안 설명 */
  description: string;
  /** 장점 */
  advantages: string[];
  /** 단점 */
  disadvantages: string[];
  /** 예상 결과 */
  expectedOutcomes?: string[];
  /** 추천 에이전트 */
  recommendedBy?: AgentType[];
}

export interface Risk {
  /** 위험 제목 */
  title: string;
  /** 위험 설명 */
  description: string;
  /** 위험 수준 (low, medium, high, critical) */
  severity: 'low' | 'medium' | 'high' | 'critical';
  /** 발생 확률 (0-1) */
  probability: number;
  /** 완화 방안 */
  mitigation?: string[];
  /** 식별한 에이전트 */
  identifiedBy: AgentType[];
}

export interface KPI {
  /** KPI 이름 */
  name: string;
  /** KPI 설명 */
  description: string;
  /** 측정 방법 */
  measurementMethod: string;
  /** 목표 값 */
  targetValue?: number;
  /** 현재 값 (있는 경우) */
  currentValue?: number;
  /** 측정 단위 */
  unit?: string;
  /** 측정 주기 */
  measurementFrequency?: string;
}

export interface DissentingOpinion {
  /** 반대 의견을 제시한 에이전트 */
  agentType: AgentType;
  /** 반대 의견 내용 */
  opinion: string;
  /** 반대 이유 */
  reasoning: string;
  /** 대안 제안 (있는 경우) */
  alternative?: Alternative;
}

export interface DecisionPacket {
  /** 고유 식별자 */
  id: string;
  /** 관련 이슈 ID */
  issueId: string;
  /** 주요 추천 사항 */
  recommendation: string;
  /** 추천 사항 상세 설명 */
  recommendationDetails: string;
  /** 대안들 */
  alternatives: Alternative[];
  /** 위험들 */
  risks: Risk[];
  /** KPI들 */
  kpis: KPI[];
  /** 반대 의견들 */
  dissentingOpinions: DissentingOpinion[];
  /** 에이전트 추론들 */
  agentReasoning: AgentReasoning[];
  /** 전체 신뢰도 점수 (0-1) */
  overallConfidence: number;
  /** 불확실성 요약 */
  uncertaintySummary?: string;
  /** 생성 시간 */
  createdAt: number;
  /** 모더레이터 정보 */
  moderator: {
    version: string;
    model?: string;
  };
  /** 메타데이터 */
  metadata?: Record<string, unknown>;
}

