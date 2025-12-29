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

    // Check category relevance
    const categoryRelevance = this.getCategoryRelevanceScore(issue.category);
    const isCategoryRelevant = this.isCategoryRelevant(issue.category);

    // Check treasury context
    const treasuryBalance = context.treasuryBalance;

    // Check for financial keywords (include category names)
    const hasFinancialKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/budget|cost|expense|fund|allocation|treasury|payment|spending|token_price|moc_price|protocol_tvl/);

    const hasRevenueKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/revenue|income|profit|return|yield|growth/);

    // Boost confidence when category is relevant to this agent
    const confidenceBoost = isCategoryRelevant ? 0.2 : 0;

    if (issue.priority === "urgent" || issue.priority === "high") {
      if (hasFinancialKeywords || isCategoryRelevant) {
        stance = "support";
        confidence = Math.min(0.95, 0.7 + confidenceBoost);
        concerns.push("Urgent financial matter requires attention");
        if (isCategoryRelevant) {
          concerns.push(`${issue.category} is directly relevant to treasury management`);
        }

        if (treasuryBalance !== undefined && treasuryBalance < 100000) {
          concerns.push("Treasury balance is relatively low");
          recommendations.push("Consider cost-effective solutions");
        }
      } else {
        stance = "support";
        confidence = Math.min(0.8, 0.55 + confidenceBoost);
        concerns.push("Priority issue may have indirect financial implications");
      }
    } else if (hasFinancialKeywords || isCategoryRelevant) {
      stance = "support";
      confidence = Math.min(0.9, 0.6 + confidenceBoost);
      if (isCategoryRelevant) {
        concerns.push(`${issue.category} falls within treasury domain`);
      }
      concerns.push("Direct financial implications require careful review");
      recommendations.push("Conduct cost-benefit analysis");
    } else if (hasRevenueKeywords) {
      stance = "support";
      confidence = Math.min(0.85, 0.65 + confidenceBoost);
      concerns.push("Potential revenue/growth opportunity");
      recommendations.push("Evaluate expected ROI");
    } else {
      stance = "neutral";
      confidence = Math.max(0.35, 0.4 * categoryRelevance);
      concerns.push("Limited direct financial impact");
    }

    // Add general treasury recommendations
    recommendations.push("Document any resource requirements");
    if (treasuryBalance !== undefined) {
      recommendations.push(
        `Current treasury balance: ${treasuryBalance.toLocaleString()}`
      );
    }

    // Build context-aware reasoning
    const reasoning = this.buildReasoning(issue, hasFinancialKeywords, hasRevenueKeywords, treasuryBalance, isCategoryRelevant);

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
    hasFinancialKeywords: RegExpMatchArray | null,
    hasRevenueKeywords: RegExpMatchArray | null,
    treasuryBalance: number | undefined,
    isCategoryRelevant: boolean
  ): string {
    const parts: string[] = [];
    const signals = issue.signals || [];

    // Describe the issue being analyzed
    parts.push(`Treasury analysis of "${issue.title}" (${issue.category}, ${issue.priority} priority).`);

    // Explain category relevance
    if (isCategoryRelevant) {
      parts.push(`This ${issue.category} issue is directly relevant to treasury management.`);
    }

    // Explain financial context
    if (hasFinancialKeywords) {
      parts.push("Direct financial implications identified in this issue.");
    }
    if (hasRevenueKeywords) {
      parts.push("Potential revenue or growth opportunity detected.");
    }

    // Add treasury context
    if (treasuryBalance !== undefined) {
      if (treasuryBalance < 50000) {
        parts.push(`Treasury balance (${treasuryBalance.toLocaleString()}) requires conservative approach.`);
      } else if (treasuryBalance > 500000) {
        parts.push(`Healthy treasury balance (${treasuryBalance.toLocaleString()}) allows flexibility.`);
      }
    }

    // Add signal-based context
    if (signals.length > 0) {
      const financialSignals = signals.filter(s =>
        s.category.includes("treasury") || s.category.includes("token") || s.category.includes("price")
      );
      if (financialSignals.length > 0) {
        parts.push(`${financialSignals.length} treasury-related signals in this issue.`);
      }
    }

    return parts.join(" ");
  }
}
