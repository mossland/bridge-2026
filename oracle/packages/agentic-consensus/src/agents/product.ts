import { AgentRole, DetectedIssue, AgentContext, AgentOpinion } from "@oracle/core";
import { BaseAgent, LLMConfig } from "./base.js";

export class ProductAgent extends BaseAgent {
  readonly id = "product-agent";
  readonly role: AgentRole = "product";

  protected readonly systemPrompt = `You are a Product & Technical Feasibility Agent in a decentralized governance system.

Your role is to:
1. Evaluate technical feasibility of proposals
2. Assess implementation complexity and timeline
3. Consider technical debt and maintainability
4. Ensure alignment with product roadmap

You should be practical and focus on deliverability and technical excellence.
Consider both short-term implementation and long-term maintenance.
Your analysis should help ensure technically sound decisions.`;

  constructor(config: LLMConfig = {}) {
    super(config);
  }

  protected deliberateRuleBased(
    issue: DetectedIssue,
    context: AgentContext
  ): AgentOpinion {
    let stance: AgentOpinion["stance"] = "neutral";
    let confidence = 0.5;
    const concerns: string[] = [];
    const recommendations: string[] = [];

    // Check category relevance
    const categoryRelevance = this.getCategoryRelevanceScore(issue.category);
    const isCategoryRelevant = this.isCategoryRelevant(issue.category);

    // Check active proposals context
    const activeProposals = context.activeProposals || 0;

    // Check for technical keywords (include category names)
    const hasTechnicalKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/bug|error|performance|latency|crash|failure|system|infrastructure|github|commit|mossland_disclosure/);

    const hasFeatureKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/feature|implement|develop|build|create|add|product/);

    const hasComplexityIndicators = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/complex|architecture|refactor|migration|overhaul/);

    // Boost confidence when category is relevant to this agent
    const confidenceBoost = isCategoryRelevant ? 0.2 : 0;

    if (isCategoryRelevant) {
      // Category is directly relevant to product agent
      stance = "strongly_support";
      confidence = Math.min(0.95, 0.75 + confidenceBoost);
      concerns.push(`${issue.category} is directly relevant to product development`);
      if (issue.category.includes("github") || issue.category.includes("commit")) {
        recommendations.push("Review code changes and development activity");
        recommendations.push("Assess impact on product roadmap");
      }
      if (issue.category.includes("mossland") || issue.category.includes("disclosure")) {
        recommendations.push("Coordinate with product team on announcements");
        recommendations.push("Update product documentation as needed");
      }
    } else if (hasTechnicalKeywords && issue.priority === "urgent") {
      stance = "strongly_support";
      confidence = Math.min(0.95, 0.8 + confidenceBoost);
      concerns.push("Technical issue requires immediate resolution");
      recommendations.push("Prioritize bug fix or system stabilization");
      recommendations.push("Consider temporary mitigation while fixing root cause");
    } else if (hasTechnicalKeywords) {
      stance = "support";
      confidence = Math.min(0.9, 0.65 + confidenceBoost);
      concerns.push("Technical issue affects system reliability");
      recommendations.push("Schedule appropriate technical resolution");
    } else if (hasComplexityIndicators) {
      stance = "neutral";
      confidence = Math.min(0.75, 0.5 + confidenceBoost);
      concerns.push("High complexity may require significant resources");
      concerns.push("Technical debt implications should be evaluated");
      recommendations.push("Break down into smaller, manageable phases");
      recommendations.push("Conduct technical design review");
    } else if (hasFeatureKeywords) {
      stance = "support";
      confidence = Math.min(0.8, 0.55 + confidenceBoost);
      concerns.push("Feature development requires resource allocation");
      recommendations.push("Evaluate against current roadmap priorities");
    } else {
      stance = "neutral";
      confidence = Math.max(0.35, 0.4 * categoryRelevance);
      concerns.push("Technical implications unclear");
      recommendations.push("Conduct technical impact assessment");
    }

    // Add context-based concerns
    if (activeProposals > 5) {
      concerns.push(`${activeProposals} active proposals may strain resources`);
      recommendations.push("Consider prioritization of concurrent initiatives");
    }

    recommendations.push("Ensure adequate testing before deployment");

    // Build context-aware reasoning
    const reasoning = this.buildReasoning(issue, hasTechnicalKeywords, hasFeatureKeywords, hasComplexityIndicators, activeProposals, isCategoryRelevant);

    return this.createOpinion(
      issue.id,
      stance,
      confidence,
      reasoning,
      concerns,
      recommendations
    );
  }

  private buildReasoning(
    issue: DetectedIssue,
    hasTechnicalKeywords: RegExpMatchArray | null,
    hasFeatureKeywords: RegExpMatchArray | null,
    hasComplexityIndicators: RegExpMatchArray | null,
    activeProposals: number,
    isCategoryRelevant: boolean
  ): string {
    const parts: string[] = [];
    const signals = issue.signals || [];

    // Describe the issue being analyzed
    parts.push(`Technical assessment of "${issue.title}" (${issue.category}, ${issue.priority} priority).`);

    // Explain category relevance
    if (isCategoryRelevant) {
      parts.push(`This ${issue.category} issue is directly relevant to product development and technical roadmap.`);
    }

    // Explain technical context
    if (hasTechnicalKeywords) {
      parts.push("Technical/system-related issue requiring engineering attention.");
    }
    if (hasFeatureKeywords) {
      parts.push("Feature development or implementation work identified.");
    }
    if (hasComplexityIndicators) {
      parts.push("High complexity indicators suggest careful planning needed.");
    }

    // Add workload context
    if (activeProposals > 3) {
      parts.push(`Note: ${activeProposals} concurrent proposals may affect delivery timeline.`);
    }

    // Add signal-based context
    if (signals.length > 0) {
      const technicalSignals = signals.filter(s =>
        s.category.includes("github") || s.category.includes("protocol") || s.category.includes("system")
      );
      if (technicalSignals.length > 0) {
        parts.push(`${technicalSignals.length} technical/system signals observed.`);
      }
    }

    return parts.join(" ");
  }
}
