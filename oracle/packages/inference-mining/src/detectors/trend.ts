import { NormalizedSignal, DetectedIssue } from "@oracle/core";
import { BaseDetector } from "./base.js";

export interface TrendDetectorConfig {
  minDataPoints?: number;
  trendThreshold?: number; // Minimum slope for trend detection
  categories?: string[]; // Categories to monitor (empty = all)
}

export class TrendDetector extends BaseDetector {
  readonly name = "TrendDetector";
  private config: TrendDetectorConfig;

  constructor(config: TrendDetectorConfig = {}) {
    super();
    this.config = {
      minDataPoints: config.minDataPoints ?? 5,
      trendThreshold: config.trendThreshold ?? 0.1,
      categories: config.categories ?? [],
    };
  }

  analyze(signals: NormalizedSignal[]): DetectedIssue[] {
    const issues: DetectedIssue[] = [];
    const grouped = this.groupSignalsByCategory(signals);

    for (const [category, categorySignals] of grouped) {
      // Skip if not in monitored categories (when specified)
      if (
        this.config.categories!.length > 0 &&
        !this.config.categories!.includes(category)
      ) {
        continue;
      }

      if (categorySignals.length < this.config.minDataPoints!) {
        continue;
      }

      // Sort by timestamp
      const sorted = [...categorySignals].sort(
        (a, b) => a.timestamp.getTime() - b.timestamp.getTime()
      );

      // Calculate linear regression
      const trend = this.calculateTrend(sorted);

      if (Math.abs(trend.slope) < this.config.trendThreshold!) {
        continue;
      }

      const direction = trend.slope > 0 ? "increasing" : "decreasing";
      const magnitude = Math.abs(trend.slope);

      let priority: DetectedIssue["priority"] = "low";
      if (magnitude > this.config.trendThreshold! * 5) {
        priority = "urgent";
      } else if (magnitude > this.config.trendThreshold! * 3) {
        priority = "high";
      } else if (magnitude > this.config.trendThreshold! * 2) {
        priority = "medium";
      }

      // Get first and last values for context
      const firstValue = sorted[0].value;
      const lastValue = sorted[sorted.length - 1].value;
      const percentChange = ((lastValue - firstValue) / firstValue) * 100;

      const issue = this.createIssue(
        `${direction.charAt(0).toUpperCase() + direction.slice(1)} trend in ${category}`,
        `A significant ${direction} trend detected in ${category}. ` +
          `Values changed from ${firstValue.toFixed(2)} to ${lastValue.toFixed(2)} ` +
          `(${percentChange > 0 ? "+" : ""}${percentChange.toFixed(1)}%) over ${sorted.length} data points.`,
        category,
        priority,
        sorted,
        [
          {
            type: "trend",
            description: "Trend analysis results",
            data: {
              direction,
              slope: trend.slope,
              intercept: trend.intercept,
              rSquared: trend.rSquared,
              dataPoints: sorted.length,
              firstValue,
              lastValue,
              percentChange,
            },
          },
        ],
        [
          `Monitor the ${direction} trend in ${category}`,
          `Investigate factors contributing to the ${percentChange.toFixed(1)}% change`,
          direction === "increasing" && percentChange > 50
            ? "Consider implementing rate limiting or controls"
            : "Review if this trend aligns with expectations",
        ]
      );

      issues.push(issue);
    }

    return issues;
  }

  private calculateTrend(signals: NormalizedSignal[]): {
    slope: number;
    intercept: number;
    rSquared: number;
  } {
    const n = signals.length;
    const xValues = signals.map((_, i) => i);
    const yValues = signals.map((s) => s.value);

    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((acc, x, i) => acc + x * yValues[i], 0);
    const sumX2 = xValues.reduce((acc, x) => acc + x * x, 0);
    const sumY2 = yValues.reduce((acc, y) => acc + y * y, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // R-squared (coefficient of determination)
    const yMean = sumY / n;
    const ssTotal = yValues.reduce((acc, y) => acc + Math.pow(y - yMean, 2), 0);
    const ssResidual = yValues.reduce((acc, y, i) => {
      const predicted = slope * xValues[i] + intercept;
      return acc + Math.pow(y - predicted, 2);
    }, 0);
    const rSquared = ssTotal === 0 ? 0 : 1 - ssResidual / ssTotal;

    return { slope, intercept, rSquared };
  }
}
