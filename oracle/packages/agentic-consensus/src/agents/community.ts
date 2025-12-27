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

    // Check community context
    const communityMetrics = context.communityMetrics || {};

    // Check for community-related keywords
    const hasCommunityKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/community|user|member|stakeholder|participation|engagement/);

    const hasNegativeImpact = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/disruption|downtime|breaking|removal|deprecat/);

    const hasPositiveImpact = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/improvement|enhance|better|access|benefit|feature/);

    if (hasNegativeImpact) {
      stance = "oppose";
      confidence = 0.6;
      concerns.push("Potential negative impact on community members");
      recommendations.push("Plan migration path for affected users");
      recommendations.push("Provide clear communication to community");
    } else if (hasPositiveImpact) {
      stance = "support";
      confidence = 0.7;
      concerns.push("Ensure benefits are accessible to all members");
      recommendations.push("Gather community feedback before implementation");
    } else if (hasCommunityKeywords) {
      stance = "support";
      confidence = 0.6;
      concerns.push("Direct community impact requires careful handling");
      recommendations.push("Consider community engagement process");
    } else if (issue.priority === "urgent") {
      stance = "support";
      confidence = 0.55;
      concerns.push("Urgent issues may affect community trust");
      recommendations.push("Communicate transparently about the situation");
    } else {
      stance = "neutral";
      confidence = 0.4;
      concerns.push("Indirect community impact unclear");
    }

    // Add context-based recommendations
    if (communityMetrics.activeUsers) {
      recommendations.push(
        `Consider impact on ${communityMetrics.activeUsers.toLocaleString()} active users`
      );
    }

    recommendations.push("Document community impact assessment");

    return this.createOpinion(
      issue.id,
      stance,
      confidence,
      `Community impact assessment based on stakeholder effects and engagement considerations.`,
      concerns,
      recommendations
    );
  }
}
