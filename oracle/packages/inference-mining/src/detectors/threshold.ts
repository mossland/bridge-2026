import { NormalizedSignal, DetectedIssue } from "@oracle/core";
import { BaseDetector } from "./base.js";

export interface ThresholdRule {
  category: string;
  field?: string;
  operator: "gt" | "lt" | "gte" | "lte" | "eq";
  value: number;
  priority: DetectedIssue["priority"];
  message: string;
  suggestedActions?: string[];
}

export interface ThresholdDetectorConfig {
  rules: ThresholdRule[];
}

export class ThresholdDetector extends BaseDetector {
  readonly name = "ThresholdDetector";
  private config: ThresholdDetectorConfig;

  constructor(config: ThresholdDetectorConfig) {
    super();
    this.config = config;
  }

  analyze(signals: NormalizedSignal[]): DetectedIssue[] {
    const issues: DetectedIssue[] = [];
    const triggeredRules = new Map<ThresholdRule, NormalizedSignal[]>();

    for (const signal of signals) {
      for (const rule of this.config.rules) {
        if (signal.category !== rule.category) {
          continue;
        }

        const value = signal.value;
        let triggered = false;

        switch (rule.operator) {
          case "gt":
            triggered = value > rule.value;
            break;
          case "lt":
            triggered = value < rule.value;
            break;
          case "gte":
            triggered = value >= rule.value;
            break;
          case "lte":
            triggered = value <= rule.value;
            break;
          case "eq":
            triggered = value === rule.value;
            break;
        }

        if (triggered) {
          const existing = triggeredRules.get(rule) || [];
          existing.push(signal);
          triggeredRules.set(rule, existing);
        }
      }
    }

    for (const [rule, triggeredSignals] of triggeredRules) {
      const operatorStr = {
        gt: ">",
        lt: "<",
        gte: ">=",
        lte: "<=",
        eq: "==",
      }[rule.operator];

      const issue = this.createIssue(
        `Threshold exceeded: ${rule.category}`,
        `${triggeredSignals.length} signal(s) triggered threshold rule: ${rule.message}. ` +
          `Condition: value ${operatorStr} ${rule.value}`,
        rule.category,
        rule.priority,
        triggeredSignals,
        [
          {
            type: "threshold",
            description: "Threshold rule configuration",
            data: {
              rule: {
                operator: rule.operator,
                value: rule.value,
                message: rule.message,
              },
              triggeredCount: triggeredSignals.length,
              triggeredValues: triggeredSignals.map((s) => s.value),
            },
          },
        ],
        rule.suggestedActions || [
          `Review signals that exceeded ${rule.operator} ${rule.value}`,
          "Take corrective action if necessary",
        ]
      );

      issues.push(issue);
    }

    return issues;
  }
}
