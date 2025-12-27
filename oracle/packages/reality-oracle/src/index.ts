// Adapters
export { BaseAdapter } from "./adapters/base.js";
export { OnChainAdapter, type OnChainAdapterConfig } from "./adapters/onchain.js";
export { APIAdapter, type APIAdapterConfig, type APIEndpoint } from "./adapters/api.js";
export {
  TelemetryAdapter,
  type TelemetryAdapterConfig,
  type TelemetryMetric,
} from "./adapters/telemetry.js";

// Registry
export { SignalRegistry, type SignalRegistryConfig } from "./registry.js";

// Re-export core types for convenience
export type {
  SignalAdapter,
  SignalSource,
  RawSignal,
  NormalizedSignal,
} from "@oracle/core";
