// Detectors
export { BaseDetector } from "./detectors/base.js";
export {
  AnomalyDetector,
  type AnomalyDetectorConfig,
} from "./detectors/anomaly.js";
export {
  ThresholdDetector,
  type ThresholdDetectorConfig,
  type ThresholdRule,
} from "./detectors/threshold.js";
export { TrendDetector, type TrendDetectorConfig } from "./detectors/trend.js";

// Proposal Generation
export {
  ProposalGenerator,
  type ProposalGeneratorConfig,
  type ProposalDraft,
} from "./proposal-generator.js";

// Re-export core types
export type { IssueDetector, DetectedIssue, NormalizedSignal } from "@oracle/core";
