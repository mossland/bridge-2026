import { AgentRole, DetectedIssue, AgentContext, AgentOpinion } from "@oracle/core";
import { BaseAgent, LLMConfig } from "./base.js";

export class TreasuryAgent extends BaseAgent {
  readonly id = "treasury-agent";
  readonly role: AgentRole = "treasury";

  protected readonly systemPrompt = `You are a Treasury & Resource Allocation Agent in a decentralized governance system.

Your role is to:
1. Evaluate the financial implications of proposals
2. Assess resource allocation efficiency
3. Consider sustainability and long-term financial health
4. Balance investment needs with fiscal responsibility

You should be pragmatic and focus on value creation and resource optimization.
Consider both short-term costs and long-term returns.
Your analysis should help ensure sustainable resource management.`;

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

    // Check treasury context
    const treasuryBalance = context.treasuryBalance;

    // Check for financial keywords
    const hasFinancialKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/budget|cost|expense|fund|allocation|treasury|payment|spending/);

    const hasRevenueKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/revenue|income|profit|return|yield|growth/);

    if (issue.priority === "urgent" || issue.priority === "high") {
      if (hasFinancialKeywords) {
        stance = "support";
        confidence = 0.75;
        concerns.push("Urgent financial matter requires attention");

        if (treasuryBalance !== undefined && treasuryBalance < 100000) {
          concerns.push("Treasury balance is relatively low");
          recommendations.push("Consider cost-effective solutions");
        }
      } else {
        stance = "support";
        confidence = 0.6;
        concerns.push("Priority issue may have indirect financial implications");
      }
    } else if (hasFinancialKeywords) {
      stance = "neutral";
      confidence = 0.65;
      concerns.push("Direct financial implications require careful review");
      recommendations.push("Conduct cost-benefit analysis");
    } else if (hasRevenueKeywords) {
      stance = "support";
      confidence = 0.7;
      concerns.push("Potential revenue/growth opportunity");
      recommendations.push("Evaluate expected ROI");
    } else {
      stance = "neutral";
      confidence = 0.4;
      concerns.push("Limited direct financial impact");
    }

    // Add general treasury recommendations
    recommendations.push("Document any resource requirements");
    if (treasuryBalance !== undefined) {
      recommendations.push(
        `Current treasury balance: ${treasuryBalance.toLocaleString()}`
      );
    }

    return this.createOpinion(
      issue.id,
      stance,
      confidence,
      `Treasury assessment based on financial implications and resource availability.`,
      concerns,
      recommendations
    );
  }
}
