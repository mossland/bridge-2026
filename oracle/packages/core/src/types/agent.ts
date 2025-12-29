import { z } from "zod";
import { DetectedIssueSchema } from "./issue.js";

// Agent roles in the deliberation process
export const AgentRoleSchema = z.enum([
  "risk",
  "treasury",
  "community",
  "product",
  "moderator",
]);
export type AgentRole = z.infer<typeof AgentRoleSchema>;

// Agent's stance on an issue
export const StanceSchema = z.enum([
  "strongly_support",
  "support",
  "neutral",
  "oppose",
  "strongly_oppose",
]);
export type Stance = z.infer<typeof StanceSchema>;

// Recommended proposal type based on consensus
export const ProposalTypeSchema = z.enum([
  "action",        // High confidence: direct action proposal
  "investigation", // Low confidence: needs more research/discussion
]);
export type ProposalType = z.infer<typeof ProposalTypeSchema>;

// Agent opinion on an issue
export const AgentOpinionSchema = z.object({
  agentId: z.string(),
  role: AgentRoleSchema,
  issueId: z.string().uuid(),
  stance: StanceSchema,
  confidence: z.number().min(0).max(1),
  reasoning: z.string(),
  concerns: z.array(z.string()),
  recommendations: z.array(z.string()),
  timestamp: z.date(),
});
export type AgentOpinion = z.infer<typeof AgentOpinionSchema>;

// Decision packet synthesized by moderator
export const DecisionPacketSchema = z.object({
  id: z.string().uuid(),
  issueId: z.string().uuid(),
  issue: DetectedIssueSchema,
  // Consensus metrics
  consensusScore: z.number().min(0).max(1), // 0-1 score indicating agent agreement level
  recommendedProposalType: ProposalTypeSchema, // action or investigation based on score
  recommendation: z.object({
    action: z.string(),
    rationale: z.string(),
    expectedOutcome: z.string(),
  }),
  alternatives: z.array(
    z.object({
      action: z.string(),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
    })
  ),
  risks: z.array(
    z.object({
      description: z.string(),
      likelihood: z.enum(["low", "medium", "high"]),
      impact: z.enum(["low", "medium", "high"]),
      mitigation: z.string().optional(),
    })
  ),
  kpis: z.array(
    z.object({
      name: z.string(),
      target: z.number(),
      unit: z.string(),
      measurementMethod: z.string(),
    })
  ),
  agentOpinions: z.array(AgentOpinionSchema),
  dissent: z.array(
    z.object({
      agentRole: AgentRoleSchema,
      reason: z.string(),
    })
  ),
  createdAt: z.date(),
});
export type DecisionPacket = z.infer<typeof DecisionPacketSchema>;

// Context provided to agents
export const AgentContextSchema = z.object({
  historicalDecisions: z.array(z.unknown()).optional(),
  treasuryBalance: z.number().optional(),
  activeProposals: z.number().optional(),
  communityMetrics: z.record(z.number()).optional(),
});
export type AgentContext = z.infer<typeof AgentContextSchema>;

// Governance agent interface
export interface GovernanceAgent {
  readonly id: string;
  readonly role: AgentRole;
  deliberate(
    issue: z.infer<typeof DetectedIssueSchema>,
    context: AgentContext
  ): Promise<AgentOpinion>;
}
