/**
 * Issue Types
 * 
 * 이슈는 Inference Mining에서 신호로부터 추출된 거버넌스 관련 문제를 나타냅니다.
 */

export enum IssuePriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum IssueStatus {
  DETECTED = 'detected',
  GROUPED = 'grouped',
  ANALYZED = 'analyzed',
  PROPOSAL_DRAFTED = 'proposal_drafted',
  RESOLVED = 'resolved',
}

export interface RelatedSignal {
  /** 관련 신호 ID */
  signalId: string;
  /** 관련성 점수 (0-1) */
  relevanceScore: number;
  /** 관련성 설명 */
  relevanceReason?: string;
}

export interface IssueEvidence {
  /** 증거를 제공하는 신호들 */
  signals: RelatedSignal[];
  /** 통계적 증거 */
  statisticalEvidence?: {
    anomalyScore?: number;
    trendDirection?: 'increasing' | 'decreasing' | 'stable';
    trendStrength?: number;
  };
  /** 패턴 매칭 결과 */
  patternMatches?: Array<{
    pattern: string;
    confidence: number;
  }>;
}

export interface Issue {
  /** 고유 식별자 */
  id: string;
  /** 이슈 제목 */
  title: string;
  /** 이슈 설명 */
  description: string;
  /** 우선순위 */
  priority: IssuePriority;
  /** 현재 상태 */
  status: IssueStatus;
  /** 증거 */
  evidence: IssueEvidence;
  /** 카테고리/태그 */
  categories: string[];
  /** 감지 시간 */
  detectedAt: number;
  /** 업데이트 시간 */
  updatedAt: number;
  /** 관련 이슈 ID들 */
  relatedIssueIds?: string[];
  /** 메타데이터 */
  metadata?: Record<string, unknown>;
}

/**
 * 이슈 그룹화 결과
 */
export interface IssueGroup {
  /** 그룹 ID */
  id: string;
  /** 그룹 제목 */
  title: string;
  /** 그룹에 속한 이슈들 */
  issues: Issue[];
  /** 그룹의 우선순위 점수 */
  priorityScore: number;
  /** 클러스터링 메타데이터 */
  clusteringMetadata?: {
    algorithm: string;
    similarityScore: number;
  };
}




