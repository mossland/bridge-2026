import { DetectedIssue, generateId, now } from "@oracle/core";

export interface ProposalDraft {
  id: string;
  issueId: string;
  title: string;
  summary: string;
  background: string;
  proposedAction: string;
  expectedOutcome: string;
  risks: string[];
  alternatives: string[];
  createdAt: Date;
}

export interface ProposalGeneratorConfig {
  // Future: LLM integration for enhanced proposal generation
  useLLM?: boolean;
  llmEndpoint?: string;
}

export class ProposalGenerator {
  private config: ProposalGeneratorConfig;

  constructor(config: ProposalGeneratorConfig = {}) {
    this.config = config;
  }

  generate(issue: DetectedIssue): ProposalDraft {
    // Template-based proposal generation
    // Future: Integrate with LLM for more sophisticated proposals
    const draft: ProposalDraft = {
      id: generateId(),
      issueId: issue.id,
      title: this.generateTitle(issue),
      summary: this.generateSummary(issue),
      background: this.generateBackground(issue),
      proposedAction: this.generateProposedAction(issue),
      expectedOutcome: this.generateExpectedOutcome(issue),
      risks: this.generateRisks(issue),
      alternatives: this.generateAlternatives(issue),
      createdAt: now(),
    };

    return draft;
  }

  generateBatch(issues: DetectedIssue[]): ProposalDraft[] {
    return issues.map((issue) => this.generate(issue));
  }

  private generateTitle(issue: DetectedIssue): string {
    const priorityPrefix = {
      urgent: "[URGENT]",
      high: "[HIGH]",
      medium: "",
      low: "",
    }[issue.priority];

    return `${priorityPrefix} ${issue.title}`.trim();
  }

  private generateSummary(issue: DetectedIssue): string {
    return (
      `This proposal addresses an issue detected in the ${issue.category} category. ` +
      issue.description
    );
  }

  private generateBackground(issue: DetectedIssue): string {
    const evidenceSummary = issue.evidence
      .slice(0, 3)
      .map((e) => `- ${e.description}`)
      .join("\n");

    return (
      `## Background\n\n` +
      `**Issue detected at:** ${issue.detectedAt.toISOString()}\n` +
      `**Category:** ${issue.category}\n` +
      `**Priority:** ${issue.priority}\n` +
      `**Signals analyzed:** ${issue.signals.length}\n\n` +
      `### Evidence\n${evidenceSummary}`
    );
  }

  private generateProposedAction(issue: DetectedIssue): string {
    if (issue.suggestedActions && issue.suggestedActions.length > 0) {
      return issue.suggestedActions[0];
    }

    // Default actions based on priority
    const defaultActions = {
      urgent: "Immediately investigate and implement emergency measures",
      high: "Prioritize investigation and prepare action plan",
      medium: "Schedule investigation and monitoring",
      low: "Add to backlog for future review",
    };

    return defaultActions[issue.priority];
  }

  private generateExpectedOutcome(issue: DetectedIssue): string {
    return (
      `Resolution of the ${issue.category} issue should result in:\n` +
      `- Normalization of affected metrics\n` +
      `- Prevention of similar issues in the future\n` +
      `- Improved system stability`
    );
  }

  private generateRisks(issue: DetectedIssue): string[] {
    const risks: string[] = [];

    if (issue.priority === "urgent" || issue.priority === "high") {
      risks.push("Delayed action may lead to escalation");
    }

    risks.push("Proposed action may have unintended consequences");
    risks.push("Root cause may not be fully understood");

    return risks;
  }

  private generateAlternatives(issue: DetectedIssue): string[] {
    const alternatives: string[] = [];

    if (issue.suggestedActions && issue.suggestedActions.length > 1) {
      alternatives.push(...issue.suggestedActions.slice(1));
    }

    alternatives.push("No action - continue monitoring");
    alternatives.push("Defer decision pending more information");

    return alternatives;
  }
}
