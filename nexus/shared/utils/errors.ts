/**
 * Error Types
 * 
 * BRIDGE 2026의 커스텀 에러 타입입니다.
 */

export class BridgeError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode?: number,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'BridgeError';
    Object.setPrototypeOf(this, BridgeError.prototype);
  }
}

/**
 * Reality Oracle 에러
 */
export class RealityOracleError extends BridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'REALITY_ORACLE_ERROR', 500, details);
    this.name = 'RealityOracleError';
    Object.setPrototypeOf(this, RealityOracleError.prototype);
  }
}

/**
 * Inference Mining 에러
 */
export class InferenceMiningError extends BridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'INFERENCE_MINING_ERROR', 500, details);
    this.name = 'InferenceMiningError';
    Object.setPrototypeOf(this, InferenceMiningError.prototype);
  }
}

/**
 * Agentic Consensus 에러
 */
export class AgenticConsensusError extends BridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'AGENTIC_CONSENSUS_ERROR', 500, details);
    this.name = 'AgenticConsensusError';
    Object.setPrototypeOf(this, AgenticConsensusError.prototype);
  }
}

/**
 * Human Governance 에러
 */
export class HumanGovernanceError extends BridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'HUMAN_GOVERNANCE_ERROR', 500, details);
    this.name = 'HumanGovernanceError';
    Object.setPrototypeOf(this, HumanGovernanceError.prototype);
  }
}

/**
 * Atomic Actuation 에러
 */
export class AtomicActuationError extends BridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'ATOMIC_ACTUATION_ERROR', 500, details);
    this.name = 'AtomicActuationError';
    Object.setPrototypeOf(this, AtomicActuationError.prototype);
  }
}

/**
 * Proof of Outcome 에러
 */
export class ProofOfOutcomeError extends BridgeError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, 'PROOF_OF_OUTCOME_ERROR', 500, details);
    this.name = 'ProofOfOutcomeError';
    Object.setPrototypeOf(this, ProofOfOutcomeError.prototype);
  }
}

/**
 * 에러를 JSON으로 변환합니다.
 */
export function errorToJSON(error: Error): {
  name: string;
  message: string;
  code?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
  stack?: string;
} {
  if (error instanceof BridgeError) {
    return {
      name: error.name,
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
      stack: error.stack,
    };
  }
  
  return {
    name: error.name,
    message: error.message,
    stack: error.stack,
  };
}


