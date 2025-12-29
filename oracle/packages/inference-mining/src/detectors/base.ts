import {
  IssueDetector,
  NormalizedSignal,
  DetectedIssue,
  TrendDirection,
  IssueKind,
  generateId,
  now,
} from "@oracle/core";

export abstract class BaseDetector implements IssueDetector {
  abstract readonly name: string;

  abstract analyze(signals: NormalizedSignal[]): DetectedIssue[];

  protected createIssue(
    title: string,
    description: string,
    category: string,
    priority: DetectedIssue["priority"],
    signals: NormalizedSignal[],
    evidence: DetectedIssue["evidence"],
    suggestedActions?: string[],
    options?: {
      direction?: TrendDirection;
      kind?: IssueKind;
    }
  ): DetectedIssue {
    return {
      id: generateId(),
      title,
      description,
      category,
      priority,
      status: "detected",
      kind: options?.kind ?? "issue",
      direction: options?.direction,
      detectedAt: now(),
      signals,
      evidence,
      suggestedActions,
    };
  }

  protected groupSignalsByCategory(
    signals: NormalizedSignal[]
  ): Map<string, NormalizedSignal[]> {
    const groups = new Map<string, NormalizedSignal[]>();
    for (const signal of signals) {
      const existing = groups.get(signal.category) || [];
      existing.push(signal);
      groups.set(signal.category, existing);
    }
    return groups;
  }

  protected calculateStats(values: number[]): {
    mean: number;
    stdDev: number;
    min: number;
    max: number;
  } {
    if (values.length === 0) {
      return { mean: 0, stdDev: 0, min: 0, max: 0 };
    }

    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map((v) => Math.pow(v - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(variance);

    return {
      mean,
      stdDev,
      min: Math.min(...values),
      max: Math.max(...values),
    };
  }
}
