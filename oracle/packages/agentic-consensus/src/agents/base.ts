import Anthropic from "@anthropic-ai/sdk";
import {
  GovernanceAgent,
  AgentRole,
  AgentOpinion,
  DetectedIssue,
  AgentContext,
  generateId,
  now,
} from "@oracle/core";

export interface LLMConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

export abstract class BaseAgent implements GovernanceAgent {
  abstract readonly id: string;
  abstract readonly role: AgentRole;
  protected abstract readonly systemPrompt: string;

  protected client: Anthropic | null = null;
  protected config: LLMConfig;

  constructor(config: LLMConfig = {}) {
    this.config = {
      model: config.model || "claude-3-5-sonnet-20241022",
      maxTokens: config.maxTokens || 2048,
      apiKey: config.apiKey,
    };

    if (config.apiKey) {
      this.client = new Anthropic({ apiKey: config.apiKey });
    }
  }

  async deliberate(
    issue: DetectedIssue,
    context: AgentContext
  ): Promise<AgentOpinion> {
    const prompt = this.buildPrompt(issue, context);

    if (this.client) {
      return this.deliberateWithLLM(issue, prompt);
    }

    // Fallback to rule-based deliberation
    return this.deliberateRuleBased(issue, context);
  }

  protected async deliberateWithLLM(
    issue: DetectedIssue,
    prompt: string
  ): Promise<AgentOpinion> {
    const response = await this.client!.messages.create({
      model: this.config.model!,
      max_tokens: this.config.maxTokens!,
      system: this.systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from LLM");
    }

    return this.parseResponse(issue.id, content.text);
  }

  protected abstract deliberateRuleBased(
    issue: DetectedIssue,
    context: AgentContext
  ): AgentOpinion;

  protected buildPrompt(issue: DetectedIssue, context: AgentContext): string {
    return `
## Issue for Deliberation

**Title:** ${issue.title}
**Category:** ${issue.category}
**Priority:** ${issue.priority}
**Description:** ${issue.description}

### Evidence
${issue.evidence.map((e) => `- ${e.description}`).join("\n")}

### Signals
${issue.signals.slice(0, 5).map((s) => `- [${s.severity}] ${s.description} (value: ${s.value})`).join("\n")}

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
