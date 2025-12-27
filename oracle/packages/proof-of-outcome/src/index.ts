// Outcome Tracking
export {
  OutcomeTrackerImpl,
  type OutcomeTrackerConfig,
} from "./tracker.js";

// Trust Management
export { TrustManager, type TrustManagerConfig } from "./trust.js";

// Re-export core types
export type {
  OutcomeTracker,
  ExecutionRecord,
  KPIResult,
  OutcomeProof,
  TrustScore,
} from "@oracle/core";
