import { AgentRole, DetectedIssue, AgentContext, AgentOpinion } from "@oracle/core";
import { BaseAgent, LLMConfig } from "./base.js";

export class RiskAgent extends BaseAgent {
  readonly id = "risk-agent";
  readonly role: AgentRole = "risk";

  protected readonly systemPrompt = `You are a Risk Analysis Agent in a decentralized governance system.

Your role is to:
1. Identify potential security vulnerabilities and threats
2. Assess the risk level of proposed actions
3. Evaluate potential negative consequences
4. Recommend safeguards and mitigation strategies

You should be conservative and prioritize system stability and security.
Always consider worst-case scenarios and edge cases.
Your analysis should help protect the system and its users from harm.`;

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

    // Rule-based risk assessment
    const hasHighSeveritySignals = issue.signals.some(
      (s) => s.severity === "critical" || s.severity === "high"
    );

    const hasSecurityKeywords = [issue.title, issue.description]
      .join(" ")
      .toLowerCase()
      .match(/security|vulnerability|attack|exploit|breach|leak/);

    if (issue.priority === "urgent") {
      stance = "strongly_support";
      confidence = 0.9;
      concerns.push("Urgent priority requires immediate attention");
      recommendations.push("Implement emergency response procedures");
    } else if (hasSecurityKeywords) {
      stance = "strongly_support";
      confidence = 0.85;
      concerns.push("Potential security implications detected");
      recommendations.push("Conduct thorough security review");
      recommendations.push("Consider temporary protective measures");
    } else if (hasHighSeveritySignals) {
      stance = "support";
      confidence = 0.7;
      concerns.push("High severity signals require attention");
      recommendations.push("Monitor closely for escalation");
    } else if (issue.priority === "high") {
      stance = "support";
      confidence = 0.65;
      concerns.push("Elevated risk level");
    } else {
      stance = "neutral";
      confidence = 0.5;
      concerns.push("Standard risk profile");
      recommendations.push("Continue routine monitoring");
    }

    // Add general risk concerns
    concerns.push("All actions carry inherent implementation risk");
    recommendations.push("Ensure proper testing before deployment");

    return this.createOpinion(
      issue.id,
      stance,
      confidence,
      `Risk assessment based on priority (${issue.priority}) and signal severity analysis.`,
      concerns,
      recommendations
    );
  }
}
