import Anthropic from "@anthropic-ai/sdk";
import {
  GovernanceAgent,
  AgentOpinion,
  DecisionPacket,
  DetectedIssue,
  AgentContext,
  AgentRole,
  generateId,
  now,
} from "@oracle/core";

export interface ModeratorConfig {
  apiKey?: string;
  model?: string;
  maxTokens?: number;
}

export class Moderator {
  private agents: GovernanceAgent[] = [];
  private client: Anthropic | null = null;
  private config: ModeratorConfig;

  constructor(config: ModeratorConfig = {}) {
    this.config = {
      model: config.model || "claude-3-5-sonnet-20241022",
      maxTokens: config.maxTokens || 4096,
      apiKey: config.apiKey,
    };

    if (config.apiKey) {
      this.client = new Anthropic({ apiKey: config.apiKey });
    }
  }

  registerAgent(agent: GovernanceAgent): void {
    this.agents.push(agent);
  }

  unregisterAgent(agentId: string): void {
    this.agents = this.agents.filter((a) => a.id !== agentId);
  }

  async deliberate(
    issue: DetectedIssue,
    context: AgentContext = {}
  ): Promise<DecisionPacket> {
    // Collect opinions from all agents
    const opinions: AgentOpinion[] = [];

    for (const agent of this.agents) {
      try {
        const opinion = await agent.deliberate(issue, context);
        opinions.push(opinion);
      } catch (error) {
        console.error(`Agent ${agent.id} failed to deliberate:`, error);
      }
    }

    // Synthesize into decision packet
    if (this.client) {
      return this.synthesizeWithLLM(issue, opinions);
    }

    return this.synthesizeRuleBased(issue, opinions);
  }

  private async synthesizeWithLLM(
    issue: DetectedIssue,
    opinions: AgentOpinion[]
  ): Promise<DecisionPacket> {
    const prompt = this.buildSynthesisPrompt(issue, opinions);

    const response = await this.client!.messages.create({
      model: this.config.model!,
      max_tokens: this.config.maxTokens!,
      system: `You are a Moderator Agent synthesizing multiple expert opinions into a unified decision recommendation.
Your role is to:
1. Weigh different perspectives fairly
2. Identify consensus and dissent
3. Create a balanced recommendation
4. Define measurable KPIs for outcome tracking

Be objective, thorough, and actionable.`,
      messages: [{ role: "user", content: prompt }],
    });

    const content = response.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from LLM");
    }

    return this.parseSynthesisResponse(issue, opinions, content.text);
  }

  private synthesizeRuleBased(
    issue: DetectedIssue,
    opinions: AgentOpinion[]
  ): DecisionPacket {
    // Calculate weighted consensus
    const stanceScores = {
      strongly_support: 2,
      support: 1,
      neutral: 0,
      oppose: -1,
      strongly_oppose: -2,
    };

    let totalScore = 0;
    let totalWeight = 0;

    for (const opinion of opinions) {
      const weight = opinion.confidence;
      totalScore += stanceScores[opinion.stance] * weight;
      totalWeight += weight;
    }

    const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    // Determine recommendation
    let action: string;
    let rationale: string;

    if (averageScore >= 1) {
      action = "Approve and proceed with implementation";
      rationale = "Strong consensus in favor of addressing this issue";
    } else if (averageScore >= 0.3) {
      action = "Approve with conditions";
      rationale = "Moderate support with some reservations";
    } else if (averageScore >= -0.3) {
      action = "Defer for further analysis";
      rationale = "Mixed opinions require additional deliberation";
    } else if (averageScore >= -1) {
      action = "Reject with option to resubmit";
      rationale = "Significant concerns raised by agents";
    } else {
      action = "Reject";
      rationale = "Strong consensus against proceeding";
    }

    // Collect all concerns and recommendations
    const allConcerns = opinions.flatMap((o) => o.concerns);
    const allRecommendations = opinions.flatMap((o) => o.recommendations);

    // Identify dissent
    const dissent = opinions
      .filter((o) => o.stance === "oppose" || o.stance === "strongly_oppose")
      .map((o) => ({
        agentRole: o.role,
        reason: o.reasoning,
      }));

    // Create alternatives
    const alternatives = [
      {
        action: "Proceed immediately",
        pros: ["Quick resolution", "Addresses urgent needs"],
        cons: ["May miss edge cases", "Limited deliberation"],
      },
      {
        action: "Proceed with extended review period",
        pros: ["More thorough analysis", "Better community input"],
        cons: ["Delayed resolution", "Resource intensive"],
      },
      {
        action: "Reject and close",
        pros: ["Conserves resources", "Avoids potential risks"],
        cons: ["Issue remains unaddressed", "May recur"],
      },
    ];

    // Generate KPIs
    const kpis = [
      {
        name: "Resolution Time",
        target: issue.priority === "urgent" ? 24 : 168,
        unit: "hours",
        measurementMethod: "Time from approval to resolution",
      },
      {
        name: "Issue Recurrence",
        target: 0,
        unit: "occurrences",
        measurementMethod: "Similar issues within 30 days",
      },
      {
        name: "Stakeholder Satisfaction",
        target: 80,
        unit: "percent",
        measurementMethod: "Post-resolution survey",
      },
    ];

    // Generate risks
    const risks = [
      {
        description: "Implementation may not fully address root cause",
        likelihood: "medium" as const,
        impact: "medium" as const,
        mitigation: "Conduct thorough root cause analysis",
      },
      {
        description: "Unintended side effects on other systems",
        likelihood: "low" as const,
        impact: "high" as const,
        mitigation: "Comprehensive testing before deployment",
      },
    ];

    return {
      id: generateId(),
      issueId: issue.id,
      issue,
      recommendation: {
        action,
        rationale,
        expectedOutcome: `Successful resolution of ${issue.title} with measurable improvement in ${issue.category} metrics.`,
      },
      alternatives,
      risks,
      kpis,
      agentOpinions: opinions,
      dissent,
      createdAt: now(),
    };
  }

  private buildSynthesisPrompt(
    issue: DetectedIssue,
    opinions: AgentOpinion[]
  ): string {
    const opinionsText = opinions
      .map(
        (o) => `
### ${o.role.toUpperCase()} Agent
- Stance: ${o.stance}
- Confidence: ${(o.confidence * 100).toFixed(0)}%
- Reasoning: ${o.reasoning}
- Concerns: ${o.concerns.join(", ")}
- Recommendations: ${o.recommendations.join(", ")}
`
      )
      .join("\n");

    return `
## Issue Summary
**Title:** ${issue.title}
**Category:** ${issue.category}
**Priority:** ${issue.priority}
**Description:** ${issue.description}

## Agent Opinions
${opinionsText}

---

Please synthesize these opinions into a Decision Packet with:
1. A clear recommendation (action, rationale, expected outcome)
2. 2-3 alternatives with pros/cons
3. Key risks with likelihood, impact, and mitigation
4. 3-5 measurable KPIs
5. Any dissenting opinions

Respond in JSON format matching the DecisionPacket schema.
`;
  }

  private parseSynthesisResponse(
    issue: DetectedIssue,
    opinions: AgentOpinion[],
    response: string
  ): DecisionPacket {
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }

      const parsed = JSON.parse(jsonMatch[0]);

      return {
        id: generateId(),
        issueId: issue.id,
        issue,
        recommendation: parsed.recommendation || {
          action: "Review required",
          rationale: "LLM response parsing incomplete",
          expectedOutcome: "To be determined",
        },
        alternatives: parsed.alternatives || [],
        risks: parsed.risks || [],
        kpis: parsed.kpis || [],
        agentOpinions: opinions,
        dissent: parsed.dissent || [],
        createdAt: now(),
      };
    } catch (error) {
      // Fallback to rule-based synthesis
      return this.synthesizeRuleBased(issue, opinions);
    }
  }
}
