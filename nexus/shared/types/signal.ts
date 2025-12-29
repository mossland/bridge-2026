/**
 * Signal Types
 * 
 * 신호는 Reality Oracle에서 수집된 실세계 또는 시스템 레벨의 데이터를 나타냅니다.
 * 모든 신호는 정규화되고, 증명되며, 감사 가능해야 합니다.
 */

export enum SignalSource {
  ONCHAIN = 'onchain',
  COMMUNITY = 'community',
  PUBLIC_DATA = 'public_data',
  TELEMETRY = 'telemetry',
}

export enum SignalType {
  GOVERNANCE_ACTIVITY = 'governance_activity',
  PARTICIPATION = 'participation',
  METRIC = 'metric',
  EVENT = 'event',
  ANOMALY = 'anomaly',
}

export interface SignalMetadata {
  /** 신호 수집 시간 (Unix timestamp) */
  timestamp: number;
  /** 신호 출처 */
  source: SignalSource;
  /** 신호 타입 */
  type: SignalType;
  /** 신호 수집기 식별자 */
  collectorId: string;
  /** 신호의 신뢰도 점수 (0-1) */
  confidence: number;
  /** 추가 메타데이터 */
  tags?: string[];
  /** 원본 데이터 참조 */
  rawDataRef?: string;
}

export interface Attestation {
  /** 암호화 서명 */
  signature: string;
  /** 서명 생성자 */
  signer: string;
  /** 서명 생성 시간 */
  signedAt: number;
  /** 해시 체인 참조 */
  hashChainRef?: string;
}

export interface Signal {
  /** 고유 식별자 */
  id: string;
  /** 신호 메타데이터 */
  metadata: SignalMetadata;
  /** 정규화된 신호 데이터 */
  data: Record<string, unknown>;
  /** 증명 정보 */
  attestation: Attestation;
  /** 감사 로그 참조 */
  auditLogRef?: string;
  /** 생성 시간 */
  createdAt: number;
  /** 업데이트 시간 */
  updatedAt: number;
}

/**
 * 신호 정규화 결과
 */
export interface NormalizedSignal extends Signal {
  /** 정규화 버전 */
  version: string;
  /** 정규화 스키마 참조 */
  schemaRef: string;
}




