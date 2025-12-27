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

    // Check active proposals context
    const activeProposals = context.activeProposals || 0;

    // Check for technical keywords
    const hasTechnicalKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/bug|error|performance|latency|crash|failure|system|infrastructure/);

    const hasFeatureKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/feature|implement|develop|build|create|add/);

    const hasComplexityIndicators = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/complex|architecture|refactor|migration|overhaul/);

    if (hasTechnicalKeywords && issue.priority === "urgent") {
      stance = "strongly_support";
      confidence = 0.85;
      concerns.push("Technical issue requires immediate resolution");
      recommendations.push("Prioritize bug fix or system stabilization");
      recommendations.push("Consider temporary mitigation while fixing root cause");
    } else if (hasTechnicalKeywords) {
      stance = "support";
      confidence = 0.7;
      concerns.push("Technical issue affects system reliability");
      recommendations.push("Schedule appropriate technical resolution");
    } else if (hasComplexityIndicators) {
      stance = "neutral";
      confidence = 0.55;
      concerns.push("High complexity may require significant resources");
      concerns.push("Technical debt implications should be evaluated");
      recommendations.push("Break down into smaller, manageable phases");
      recommendations.push("Conduct technical design review");
    } else if (hasFeatureKeywords) {
      stance = "support";
      confidence = 0.6;
      concerns.push("Feature development requires resource allocation");
      recommendations.push("Evaluate against current roadmap priorities");
    } else {
      stance = "neutral";
      confidence = 0.4;
      concerns.push("Technical implications unclear");
      recommendations.push("Conduct technical impact assessment");
    }

    // Add context-based concerns
    if (activeProposals > 5) {
      concerns.push(`${activeProposals} active proposals may strain resources`);
      recommendations.push("Consider prioritization of concurrent initiatives");
    }

    recommendations.push("Ensure adequate testing before deployment");

    return this.createOpinion(
      issue.id,
      stance,
      confidence,
      `Technical feasibility assessment based on implementation complexity and system impact.`,
      concerns,
      recommendations
    );
  }
}
