import { AgentRole, DetectedIssue, AgentContext, AgentOpinion } from "@oracle/core";
import { BaseAgent, LLMConfig } from "./base.js";

export class CommunityAgent extends BaseAgent {
  readonly id = "community-agent";
  readonly role: AgentRole = "community";

  protected readonly systemPrompt = `You are a Community Impact Agent in a decentralized governance system.

Your role is to:
1. Assess how proposals affect the community
2. Consider user experience and accessibility
3. Evaluate fairness and inclusivity
4. Represent diverse stakeholder perspectives

You should be empathetic and focus on user needs and community well-being.
Consider both majority and minority perspectives.
Your analysis should help ensure decisions serve the community's interests.`;

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

    // Check community context
    const communityMetrics = context.communityMetrics || {};

    // Check for community-related keywords (include category names)
    const hasCommunityKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/community|user|member|stakeholder|participation|engagement|vote_turnout|governance_participation|community_sentiment|delegation/);

    const hasNegativeImpact = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/disruption|downtime|breaking|removal|deprecat|decreasing/);

    const hasPositiveImpact = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/improvement|enhance|better|access|benefit|feature|increasing/);

    // Boost confidence when category is relevant to this agent
    const confidenceBoost = isCategoryRelevant ? 0.2 : 0;

    if (hasNegativeImpact && !isCategoryRelevant) {
      stance = "oppose";
      confidence = Math.min(0.85, 0.55 + confidenceBoost);
      concerns.push("Potential negative impact on community members");
      recommendations.push("Plan migration path for affected users");
      recommendations.push("Provide clear communication to community");
    } else if (isCategoryRelevant) {
      // Category is directly relevant to community agent
      stance = "strongly_support";
      confidence = Math.min(0.95, 0.75 + confidenceBoost);
      concerns.push(`${issue.category} is directly relevant to community engagement`);
      if (hasNegativeImpact) {
        concerns.push("Decreasing trend requires community attention");
        recommendations.push("Investigate root causes of community decline");
      }
      if (hasPositiveImpact) {
        concerns.push("Positive trend indicates healthy community engagement");
        recommendations.push("Document factors contributing to growth");
      }
      recommendations.push("Engage community stakeholders for input");
    } else if (hasPositiveImpact) {
      stance = "support";
      confidence = Math.min(0.85, 0.65 + confidenceBoost);
      concerns.push("Ensure benefits are accessible to all members");
      recommendations.push("Gather community feedback before implementation");
    } else if (hasCommunityKeywords) {
      stance = "support";
      confidence = Math.min(0.8, 0.55 + confidenceBoost);
      concerns.push("Direct community impact requires careful handling");
      recommendations.push("Consider community engagement process");
    } else if (issue.priority === "urgent") {
      stance = "support";
      confidence = Math.min(0.75, 0.5 + confidenceBoost);
      concerns.push("Urgent issues may affect community trust");
      recommendations.push("Communicate transparently about the situation");
    } else {
      stance = "neutral";
      confidence = Math.max(0.35, 0.4 * categoryRelevance);
      concerns.push("Indirect community impact unclear");
    }

    // Add context-based recommendations
    if (communityMetrics.activeUsers) {
      recommendations.push(
        `Consider impact on ${communityMetrics.activeUsers.toLocaleString()} active users`
      );
    }

    recommendations.push("Document community impact assessment");

    // Build context-aware reasoning
    const reasoning = this.buildReasoning(issue, hasNegativeImpact, hasPositiveImpact, hasCommunityKeywords, communityMetrics, isCategoryRelevant);

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
    hasNegativeImpact: RegExpMatchArray | null,
    hasPositiveImpact: RegExpMatchArray | null,
    hasCommunityKeywords: RegExpMatchArray | null,
    communityMetrics: Record<string, number>,
    isCategoryRelevant: boolean
  ): string {
    const parts: string[] = [];
    const signals = issue.signals || [];

    // Describe the issue being analyzed
    parts.push(`Community impact analysis of "${issue.title}" (${issue.category}, ${issue.priority} priority).`);

    // Explain category relevance
    if (isCategoryRelevant) {
      parts.push(`This ${issue.category} issue is directly relevant to community engagement and governance participation.`);
    }

    // Explain impact assessment
    if (hasNegativeImpact) {
      parts.push("Potential disruption or breaking changes detected that may affect users.");
    }
    if (hasPositiveImpact) {
      parts.push("Positive improvements or benefits for community members identified.");
    }
    if (hasCommunityKeywords) {
      parts.push("Direct community engagement implications present.");
    }

    // Add community context
    if (communityMetrics.activeUsers) {
      parts.push(`Potential impact on ${communityMetrics.activeUsers.toLocaleString()} active community members.`);
    }

    // Add signal-based context
    if (signals.length > 0) {
      const socialSignals = signals.filter(s =>
        s.category.includes("community") || s.category.includes("social") || s.category.includes("engagement")
      );
      if (socialSignals.length > 0) {
        parts.push(`${socialSignals.length} community/social signals tracked.`);
      }
    }

    return parts.join(" ");
  }
}
