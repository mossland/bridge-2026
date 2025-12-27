import { NormalizedSignal, DetectedIssue } from "@oracle/core";
import { BaseDetector } from "./base.js";

export interface AnomalyDetectorConfig {
  stdDevThreshold?: number; // Number of standard deviations for anomaly
  minSamples?: number; // Minimum samples needed for analysis
}

export class AnomalyDetector extends BaseDetector {
  readonly name = "AnomalyDetector";
  private config: AnomalyDetectorConfig;

  constructor(config: AnomalyDetectorConfig = {}) {
    super();
    this.config = {
      stdDevThreshold: config.stdDevThreshold ?? 2,
      minSamples: config.minSamples ?? 5,
    };
  }

  analyze(signals: NormalizedSignal[]): DetectedIssue[] {
    const issues: DetectedIssue[] = [];
    const grouped = this.groupSignalsByCategory(signals);

    for (const [category, categorySignals] of grouped) {
      if (categorySignals.length < this.config.minSamples!) {
        continue;
      }

      const values = categorySignals.map((s) => s.value);
      const stats = this.calculateStats(values);

      // Find anomalies
      const anomalies = categorySignals.filter((s) => {
        const zScore = Math.abs((s.value - stats.mean) / stats.stdDev);
        return zScore > this.config.stdDevThreshold!;
      });

      if (anomalies.length === 0) {
        continue;
      }

      // Determine priority based on severity of anomalies
      const highSeverityCount = anomalies.filter(
        (a) => a.severity === "critical" || a.severity === "high"
      ).length;

      let priority: DetectedIssue["priority"] = "low";
      if (highSeverityCount > anomalies.length * 0.5) {
        priority = "urgent";
      } else if (highSeverityCount > 0) {
        priority = "high";
      } else if (anomalies.length > 1) {
        priority = "medium";
      }

      const issue = this.createIssue(
        `Anomaly detected in ${category}`,
        `${anomalies.length} anomalous signal(s) detected in ${category}. ` +
          `Values deviate more than ${this.config.stdDevThreshold} standard deviations from mean (${stats.mean.toFixed(2)}).`,
        category,
        priority,
        anomalies,
        [
          {
            type: "statistical",
            description: "Statistical analysis results",
            data: {
              mean: stats.mean,
              stdDev: stats.stdDev,
              threshold: this.config.stdDevThreshold,
              anomalyCount: anomalies.length,
              totalSamples: categorySignals.length,
            },
          },
          ...anomalies.map((a) => ({
            type: "anomaly",
            description: `Anomalous value: ${a.value} (z-score: ${((a.value - stats.mean) / stats.stdDev).toFixed(2)})`,
            data: {
              signalId: a.id,
              value: a.value,
              zScore: (a.value - stats.mean) / stats.stdDev,
            },
          })),
        ],
        [
          "Investigate the root cause of the anomalies",
          "Check if this is expected behavior or a system issue",
          "Consider adjusting thresholds if false positives occur",
        ]
      );

      issues.push(issue);
    }

    return issues;
  }
}
