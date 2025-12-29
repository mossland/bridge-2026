import {
  GovernanceAgent,
  AgentOpinion,
  DecisionPacket,
  DetectedIssue,
  AgentContext,
  ProposalType,
  generateId,
  now,
} from "@oracle/core";
import { LLMClient, LLMConfig } from "./llm/index.js";

export interface ModeratorConfig extends LLMConfig {}

export class Moderator {
  private agents: GovernanceAgent[] = [];
  private llmClient: LLMClient;

  private readonly systemPrompt = `You are a Moderator Agent synthesizing multiple expert opinions into a unified decision recommendation.
Your role is to:
1. Weigh different perspectives fairly
2. Identify consensus and dissent
3. Create a balanced recommendation
4. Define measurable KPIs for outcome tracking

Be objective, thorough, and actionable.`;

  constructor(config: ModeratorConfig = {}) {
    this.llmClient = new LLMClient({
      ...config,
      maxTokens: config.maxTokens || 4096,
    });
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
    if (this.llmClient.isAvailable) {
      try {
        return await this.synthesizeWithLLM(issue, opinions);
      } catch (error) {
        console.error("[Moderator] LLM synthesis failed, falling back to rule-based:", error);
        return this.synthesizeRuleBased(issue, opinions);
      }
    }

    return this.synthesizeRuleBased(issue, opinions);
  }

  private async synthesizeWithLLM(
    issue: DetectedIssue,
    opinions: AgentOpinion[]
  ): Promise<DecisionPacket> {
    const prompt = this.buildSynthesisPrompt(issue, opinions);
    const response = await this.llmClient.chat(this.systemPrompt, prompt);
    return this.parseSynthesisResponse(issue, opinions, response.content);
  }

  /**
   * Calculate consensus score (0-1) based on agent opinions.
   * Higher score = stronger agreement and confidence.
   */
  private calculateConsensusScore(opinions: AgentOpinion[]): {
    consensusScore: number;
    averageScore: number;
    avgConfidence: number;
  } {
    const stanceScores = {
      strongly_support: 2,
      support: 1,
      neutral: 0,
      oppose: -1,
      strongly_oppose: -2,
    };

    if (opinions.length === 0) {
      return { consensusScore: 0, averageScore: 0, avgConfidence: 0 };
    }

    let totalScore = 0;
    let totalWeight = 0;

    for (const opinion of opinions) {
      const weight = opinion.confidence;
      totalScore += stanceScores[opinion.stance] * weight;
      totalWeight += weight;
    }

    const averageScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    const avgConfidence = totalWeight > 0 ? totalWeight / opinions.length : 0;

    // Calculate consensus: how much agents agree with each other
    // 1. Agreement factor: all agents have similar stances (low variance)
    const stanceValues = opinions.map((o) => stanceScores[o.stance]);
    const meanStance = stanceValues.reduce((a, b) => a + b, 0) / stanceValues.length;
    const variance = stanceValues.reduce((sum, s) => sum + Math.pow(s - meanStance, 2), 0) / stanceValues.length;
    const stdDev = Math.sqrt(variance);
    // Max possible stdDev is ~2 (when half strongly_support, half strongly_oppose)
    const agreementFactor = Math.max(0, 1 - stdDev / 2);

    // 2. Confidence factor: average confidence of agents
    const confidenceFactor = avgConfidence;

    // 3. Direction factor: are they leaning support or oppose?
    // Normalize averageScore from [-2, 2] to [0, 1]
    const normalizedDirection = (averageScore + 2) / 4;

    // Consensus score combines agreement, confidence, and direction
    // Weight: agreement 40%, confidence 30%, direction strength 30%
    const directionStrength = Math.abs(normalizedDirection - 0.5) * 2; // 0 at neutral, 1 at extremes
    const consensusScore = (agreementFactor * 0.4) + (confidenceFactor * 0.3) + (directionStrength * 0.3);

    return { consensusScore: Math.min(1, Math.max(0, consensusScore)), averageScore, avgConfidence };
  }

  /**
   * Determine recommended proposal type based on consensus score.
   * score >= 0.5 → action (clear consensus, ready for execution)
   * score < 0.5 → investigation (unclear, needs more research)
   */
  private determineProposalType(consensusScore: number, averageScore: number): ProposalType {
    // High consensus with clear direction → action
    if (consensusScore >= 0.5) {
      return "action";
    }
    // Low consensus or mixed opinions → investigation
    return "investigation";
  }

  private synthesizeRuleBased(
    issue: DetectedIssue,
    opinions: AgentOpinion[]
  ): DecisionPacket {
    // Calculate consensus metrics
    const { consensusScore, averageScore, avgConfidence } = this.calculateConsensusScore(opinions);
    const recommendedProposalType = this.determineProposalType(consensusScore, averageScore);

    // Collect all concerns and recommendations from agents
    const allConcerns = [...new Set(opinions.flatMap((o) => o.concerns))];
    const allRecommendations = [...new Set(opinions.flatMap((o) => o.recommendations))];

    // Determine recommendation based on issue content and agent consensus
    let action: string;
    let rationale: string;

    if (averageScore >= 1) {
      action = `Approve: Address "${issue.title}"`;
      rationale = `Strong agent consensus (score: ${averageScore.toFixed(2)}) supports immediate action on this ${issue.priority} priority ${issue.category} issue.`;
    } else if (averageScore >= 0.3) {
      action = `Conditional Approval: "${issue.title}"`;
      rationale = `Moderate support (score: ${averageScore.toFixed(2)}) with conditions. Key concerns: ${allConcerns.slice(0, 2).join("; ")}.`;
    } else if (averageScore >= -0.3) {
      action = `Further Analysis Required: "${issue.title}"`;
      rationale = `Mixed agent opinions (score: ${averageScore.toFixed(2)}) on this ${issue.category} issue. Needs additional community input and data.`;
    } else if (averageScore >= -1) {
      action = `Reconsider: "${issue.title}"`;
      rationale = `Significant concerns (score: ${averageScore.toFixed(2)}) raised. Primary issues: ${allConcerns.slice(0, 2).join("; ")}.`;
    } else {
      action = `Reject: "${issue.title}"`;
      rationale = `Strong opposition (score: ${averageScore.toFixed(2)}). Major concerns must be addressed before resubmission.`;
    }

    // Identify dissent
    const dissent = opinions
      .filter((o) => o.stance === "oppose" || o.stance === "strongly_oppose")
      .map((o) => ({
        agentRole: o.role,
        reason: o.reasoning,
      }));

    // Generate issue-specific alternatives
    const alternatives = this.generateAlternatives(issue, allRecommendations);

    // Generate issue-specific KPIs
    const kpis = this.generateKPIs(issue);

    // Generate issue-specific risks from agent concerns
    const risks = this.generateRisks(issue, allConcerns);

    // Build expected outcome from issue description and recommendations
    const expectedOutcome = this.buildExpectedOutcome(issue, allRecommendations);

    return {
      id: generateId(),
      issueId: issue.id,
      issue,
      consensusScore,
      recommendedProposalType,
      recommendation: {
        action,
        rationale,
        expectedOutcome,
      },
      alternatives,
      risks,
      kpis,
      agentOpinions: opinions,
      dissent,
      createdAt: now(),
    };
  }

  private generateAlternatives(
    issue: DetectedIssue,
    recommendations: string[]
  ): DecisionPacket["alternatives"] {
    const categoryActions: Record<string, { fast: string; moderate: string; defer: string }> = {
      treasury: {
        fast: "Immediate treasury action",
        moderate: "Phased treasury adjustment over 7 days",
        defer: "Monitor treasury metrics for 30 days",
      },
      protocol: {
        fast: "Deploy protocol update immediately",
        moderate: "Staged rollout with testing period",
        defer: "Schedule for next protocol upgrade cycle",
      },
      community: {
        fast: "Direct community announcement",
        moderate: "Community discussion period (1 week)",
        defer: "Gather more community feedback",
      },
      security: {
        fast: "Emergency security patch",
        moderate: "Security audit then deploy",
        defer: "Long-term security review",
      },
    };

    const actions = categoryActions[issue.category] || {
      fast: `Immediate action on ${issue.title}`,
      moderate: `Phased approach to ${issue.title}`,
      defer: `Defer ${issue.title} for further analysis`,
    };

    const topRecs = recommendations.slice(0, 2);

    return [
      {
        action: actions.fast,
        pros: [
          `Quick resolution of ${issue.category} issue`,
          issue.priority === "urgent" ? "Addresses urgent timeline" : "Prevents escalation",
        ],
        cons: [
          "Limited review time",
          topRecs[0] ? `May not fully address: ${topRecs[0]}` : "Risk of incomplete solution",
        ],
      },
      {
        action: actions.moderate,
        pros: [
          "Balanced approach with review period",
          "Allows for adjustments based on feedback",
        ],
        cons: [
          issue.priority === "urgent" ? "May be too slow for urgent issue" : "Extended timeline",
          "Requires ongoing coordination",
        ],
      },
      {
        action: actions.defer,
        pros: [
          "More data for informed decision",
          "Lower risk of unintended consequences",
        ],
        cons: [
          `${issue.title} remains unresolved`,
          issue.priority === "high" ? "High priority issue delayed" : "Potential for escalation",
        ],
      },
    ];
  }

  private generateKPIs(issue: DetectedIssue): DecisionPacket["kpis"] {
    const baseKPIs = [
      {
        name: "Resolution Time",
        target: issue.priority === "urgent" ? 24 : issue.priority === "high" ? 72 : 168,
        unit: "hours",
        measurementMethod: `Time from approval to ${issue.title} resolution`,
      },
    ];

    // Category-specific KPIs
    const categoryKPIs: Record<string, Array<{ name: string; target: number; unit: string; measurementMethod: string }>> = {
      treasury: [
        { name: "Treasury Balance Impact", target: 0, unit: "percent deviation", measurementMethod: "Compare treasury balance before/after" },
        { name: "Transaction Success Rate", target: 100, unit: "percent", measurementMethod: "Successful vs failed treasury operations" },
      ],
      protocol: [
        { name: "Protocol Uptime", target: 99.9, unit: "percent", measurementMethod: "System availability after changes" },
        { name: "Error Rate", target: 0, unit: "errors per hour", measurementMethod: "Monitor error logs post-deployment" },
      ],
      community: [
        { name: "Community Engagement", target: 50, unit: "responses", measurementMethod: "Community feedback count within 7 days" },
        { name: "Sentiment Score", target: 70, unit: "percent positive", measurementMethod: "Analyze community reaction sentiment" },
      ],
      security: [
        { name: "Vulnerability Status", target: 0, unit: "open vulnerabilities", measurementMethod: "Security scan after mitigation" },
        { name: "Incident Recurrence", target: 0, unit: "incidents", measurementMethod: "Similar security events within 30 days" },
      ],
    };

    const specific = categoryKPIs[issue.category] || [
      { name: "Issue Recurrence", target: 0, unit: "occurrences", measurementMethod: `Similar ${issue.category} issues within 30 days` },
    ];

    return [...baseKPIs, ...specific];
  }

  private generateRisks(
    issue: DetectedIssue,
    concerns: string[]
  ): DecisionPacket["risks"] {
    const risks: DecisionPacket["risks"] = [];

    // Convert agent concerns to risks
    const uniqueConcerns = concerns.filter((c, i) =>
      concerns.indexOf(c) === i &&
      c.length > 10 &&
      !c.toLowerCase().includes("standard") &&
      !c.toLowerCase().includes("routine")
    );

    for (const concern of uniqueConcerns.slice(0, 3)) {
      risks.push({
        description: concern,
        likelihood: issue.priority === "urgent" ? "high" : issue.priority === "high" ? "medium" : "low",
        impact: issue.priority === "urgent" || issue.priority === "high" ? "high" : "medium",
        mitigation: this.suggestMitigation(concern, issue.category),
      });
    }

    // Add category-specific risk if not enough from concerns
    if (risks.length < 2) {
      const categoryRisks: Record<string, { description: string; mitigation: string }> = {
        treasury: {
          description: "Treasury operations may affect token economics",
          mitigation: "Implement transaction limits and multi-sig approval",
        },
        protocol: {
          description: "Protocol changes may introduce regression bugs",
          mitigation: "Comprehensive testing on testnet before mainnet deployment",
        },
        community: {
          description: "Community response may differ from expectations",
          mitigation: "Phased communication with feedback loops",
        },
        security: {
          description: "Security fix may have incomplete coverage",
          mitigation: "Third-party security audit before deployment",
        },
      };

      const categoryRisk = categoryRisks[issue.category] || {
        description: `Addressing ${issue.title} may have unforeseen effects`,
        mitigation: "Monitor closely after implementation",
      };

      risks.push({
        description: categoryRisk.description,
        likelihood: "medium",
        impact: "medium",
        mitigation: categoryRisk.mitigation,
      });
    }

    return risks;
  }

  private suggestMitigation(concern: string, category: string): string {
    const lowerConcern = concern.toLowerCase();

    if (lowerConcern.includes("security") || lowerConcern.includes("vulnerability")) {
      return "Conduct security audit and implement protective measures";
    }
    if (lowerConcern.includes("urgent") || lowerConcern.includes("immediate")) {
      return "Establish emergency response protocol with clear escalation path";
    }
    if (lowerConcern.includes("risk") || lowerConcern.includes("implementation")) {
      return "Implement staged rollout with rollback capability";
    }
    if (lowerConcern.includes("monitor") || lowerConcern.includes("escalation")) {
      return "Set up real-time monitoring and alerting system";
    }
    if (lowerConcern.includes("test")) {
      return "Execute comprehensive test suite before deployment";
    }

    // Category-based default
    const categoryMitigations: Record<string, string> = {
      treasury: "Review with treasury committee before execution",
      protocol: "Test on staging environment with gradual rollout",
      community: "Gather community feedback through governance forum",
      security: "Engage security team for review and approval",
    };

    return categoryMitigations[category] || "Review thoroughly before proceeding";
  }

  private buildExpectedOutcome(
    issue: DetectedIssue,
    recommendations: string[]
  ): string {
    const topRec = recommendations[0] || "standard procedures";

    const categoryOutcomes: Record<string, string> = {
      treasury: `Treasury stability restored with ${issue.title} addressed. Expected improvement in financial metrics through ${topRec}.`,
      protocol: `Protocol performance optimized after resolving ${issue.title}. System reliability improved via ${topRec}.`,
      community: `Community concerns regarding ${issue.title} addressed. Enhanced engagement through ${topRec}.`,
      security: `Security posture strengthened after mitigating ${issue.title}. Reduced vulnerability exposure through ${topRec}.`,
    };

    return categoryOutcomes[issue.category] ||
      `${issue.title} successfully resolved. ${issue.description.slice(0, 100)}${issue.description.length > 100 ? "..." : ""} Expected improvement through ${topRec}.`;
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

      // Calculate consensus metrics from opinions
      const { consensusScore, averageScore } = this.calculateConsensusScore(opinions);
      const recommendedProposalType = this.determineProposalType(consensusScore, averageScore);

      return {
        id: generateId(),
        issueId: issue.id,
        issue,
        consensusScore,
        recommendedProposalType,
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
