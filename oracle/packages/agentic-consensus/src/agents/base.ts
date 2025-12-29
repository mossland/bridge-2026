import {
  GovernanceAgent,
  AgentRole,
  AgentOpinion,
  DetectedIssue,
  AgentContext,
  now,
} from "@oracle/core";
import { LLMClient } from "../llm/index.js";
import type { LLMConfig } from "../llm/index.js";

export type { LLMConfig };

// Category mapping for each agent role
export const AGENT_CATEGORY_MAPPING: Record<AgentRole, string[]> = {
  risk: [
    "security",
    "vulnerability",
    "network_health",
    "gas_usage",
    "protocol_tvl",
    "anomaly",
  ],
  treasury: [
    "token_price",
    "moc_price",
    "moc_market",
    "moc_blockchain",
    "protocol_tvl",
    "treasury",
    "transaction_volume",
  ],
  community: [
    "vote_turnout",
    "governance_participation",
    "community_sentiment",
    "delegation_changes",
    "proposal_activity",
    "medium_activity",
    "medium_post",
    "twitter_activity",
    "social",
  ],
  product: [
    "github_commit",
    "github_activity",
    "mossland_disclosure",
    "product_update",
    "feature",
    "roadmap",
  ],
  moderator: [], // Moderator doesn't have specific categories
};

export abstract class BaseAgent implements GovernanceAgent {
  abstract readonly id: string;
  abstract readonly role: AgentRole;
  protected abstract readonly systemPrompt: string;

  protected llmClient: LLMClient;
  protected relevantCategories: string[];

  constructor(config: LLMConfig = {}) {
    this.llmClient = new LLMClient({
      ...config,
      maxTokens: config.maxTokens || 2048,
    });
    this.relevantCategories = [];
  }

  /**
   * Check if a category is relevant to this agent's expertise
   */
  protected isCategoryRelevant(category: string): boolean {
    const agentCategories = AGENT_CATEGORY_MAPPING[this.role] || [];
    const lowerCategory = category.toLowerCase();
    return agentCategories.some(c =>
      lowerCategory.includes(c) || c.includes(lowerCategory)
    );
  }

  /**
   * Get relevance score (0-1) for how well this agent matches the category
   */
  protected getCategoryRelevanceScore(category: string): number {
    if (this.isCategoryRelevant(category)) {
      return 1.0; // Full relevance
    }
    // Check for partial matches
    const agentCategories = AGENT_CATEGORY_MAPPING[this.role] || [];
    const lowerCategory = category.toLowerCase();
    for (const c of agentCategories) {
      if (lowerCategory.split("_").some(part => c.includes(part))) {
        return 0.5; // Partial relevance
      }
    }
    return 0.3; // Low relevance but still can contribute
  }

  get isLLMEnabled(): boolean {
    return this.llmClient.isAvailable;
  }

  get llmProvider(): string {
    return this.llmClient.currentProvider;
  }

  get llmModel(): string {
    return this.llmClient.currentModel;
  }

  async deliberate(
    issue: DetectedIssue,
    context: AgentContext
  ): Promise<AgentOpinion> {
    const prompt = this.buildPrompt(issue, context);

    if (this.llmClient.isAvailable) {
      try {
        return await this.deliberateWithLLM(issue, prompt);
      } catch (error) {
        console.error(`[${this.id}] LLM deliberation failed, falling back to rule-based:`, error);
        return this.deliberateRuleBased(issue, context);
      }
    }

    // Fallback to rule-based deliberation
    return this.deliberateRuleBased(issue, context);
  }

  protected async deliberateWithLLM(
    issue: DetectedIssue,
    prompt: string
  ): Promise<AgentOpinion> {
    const response = await this.llmClient.chat(this.systemPrompt, prompt);
    return this.parseResponse(issue.id, response.content);
  }

  protected abstract deliberateRuleBased(
    issue: DetectedIssue,
    context: AgentContext
  ): AgentOpinion;

  protected buildPrompt(issue: DetectedIssue, context: AgentContext): string {
    // Handle signals - may be full objects or just IDs from database
    const signals = issue.signals || [];
    const signalsSection = signals.length > 0
      ? signals.slice(0, 5).map((s: any) => `- [${s.severity}] ${s.description} (value: ${s.value})`).join("\n")
      : "(Signal data not available - refer to evidence for details)";

    // Handle evidence safely
    const evidenceSection = (issue.evidence || [])
      .map((e) => `- ${e.description}`)
      .join("\n") || "(No evidence available)";

    return `
## Issue for Deliberation

**Title:** ${issue.title}
**Category:** ${issue.category}
**Priority:** ${issue.priority}
**Description:** ${issue.description}

### Evidence
${evidenceSection}

### Signals
${signalsSection}

### Context
${JSON.stringify(context, null, 2)}

---

Please provide your analysis as a ${this.role} agent. Include:
1. Your stance (strongly_support, support, neutral, oppose, strongly_oppose)
2. Confidence level (0-1)
3. Key reasoning
4. Any concerns
5. Recommendations

Respond in JSON format:
{
  "stance": "support",
  "confidence": 0.8,
  "reasoning": "...",
  "concerns": ["..."],
  "recommendations": ["..."]
}
`;
  }

  protected parseResponse(issueId: string, response: string): AgentOpinion {
    try {
      // Extract JSON from response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        agentId: this.id,
        role: this.role,
        issueId,
        stance: parsed.stance || "neutral",
        confidence: parsed.confidence || 0.5,
        reasoning: parsed.reasoning || "",
        concerns: parsed.concerns || [],
        recommendations: parsed.recommendations || [],
        timestamp: now(),
      };
    } catch (error) {
      // Return neutral opinion on parse failure
      return {
        agentId: this.id,
        role: this.role,
        issueId,
        stance: "neutral",
        confidence: 0.3,
        reasoning: "Failed to parse LLM response",
        concerns: ["Analysis inconclusive"],
        recommendations: ["Require human review"],
        timestamp: now(),
      };
    }
  }

  protected createOpinion(
    issueId: string,
    stance: AgentOpinion["stance"],
    confidence: number,
    reasoning: string,
    concerns: string[],
    recommendations: string[]
  ): AgentOpinion {
    return {
      agentId: this.id,
      role: this.role,
      issueId,
      stance,
      confidence,
      reasoning,
      concerns,
      recommendations,
      timestamp: now(),
    };
  }
}
