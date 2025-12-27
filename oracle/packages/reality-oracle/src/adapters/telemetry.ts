import { RawSignal, NormalizedSignal, SignalSource } from "@oracle/core";
import { BaseAdapter } from "./base.js";

export interface TelemetryMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface TelemetryAdapterConfig {
  serviceName: string;
  metrics?: TelemetryMetric[];
}

export class TelemetryAdapter extends BaseAdapter {
  readonly name = "TelemetryAdapter";
  readonly source: SignalSource = "telemetry";

  private config: TelemetryAdapterConfig;
  private metricsBuffer: TelemetryMetric[] = [];

  constructor(config: TelemetryAdapterConfig) {
    super();
    this.config = config;
    if (config.metrics) {
      this.metricsBuffer = [...config.metrics];
    }
  }

  // Allow external systems to push metrics
  pushMetric(metric: TelemetryMetric): void {
    this.metricsBuffer.push(metric);
  }

  pushMetrics(metrics: TelemetryMetric[]): void {
    this.metricsBuffer.push(...metrics);
  }

  async fetch(): Promise<RawSignal[]> {
    const signals: RawSignal[] = [];

    // Process buffered metrics
    for (const metric of this.metricsBuffer) {
      const signal = this.createRawSignal(
        `${this.config.serviceName}-${metric.name}-${metric.timestamp.getTime()}`,
        {
          metricName: metric.name,
          value: metric.value,
          unit: metric.unit,
          tags: metric.tags,
          serviceName: this.config.serviceName,
        }
      );
      signals.push(signal);
    }

    // Clear the buffer after processing
    this.metricsBuffer = [];

    return signals;
  }

  normalize(signal: RawSignal): NormalizedSignal {
    const data = signal.data as {
      metricName: string;
      value: number;
      unit: string;
      serviceName: string;
      tags?: Record<string, string>;
    };

    // Determine severity based on metric value and type
    let severity: NormalizedSignal["severity"] = "low";

    // Error rate metrics
    if (data.metricName.toLowerCase().includes("error")) {
      if (data.value > 10) severity = "critical";
      else if (data.value > 5) severity = "high";
      else if (data.value > 1) severity = "medium";
    }
    // Latency metrics (assuming milliseconds)
    else if (data.metricName.toLowerCase().includes("latency")) {
      if (data.value > 5000) severity = "critical";
      else if (data.value > 2000) severity = "high";
      else if (data.value > 1000) severity = "medium";
    }
    // CPU/Memory usage metrics (percentage)
    else if (
      data.metricName.toLowerCase().includes("cpu") ||
      data.metricName.toLowerCase().includes("memory")
    ) {
      if (data.value > 95) severity = "critical";
      else if (data.value > 85) severity = "high";
      else if (data.value > 70) severity = "medium";
    }

    return this.createNormalizedSignal(
      signal,
      `telemetry_${data.metricName}`,
      severity,
      data.value,
      data.unit,
      `${data.serviceName} ${data.metricName}: ${data.value} ${data.unit}`
    );
  }
}
