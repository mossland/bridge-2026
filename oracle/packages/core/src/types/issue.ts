import { z } from "zod";
import { NormalizedSignalSchema } from "./signal.js";

// Issue priority levels
export const IssuePrioritySchema = z.enum(["low", "medium", "high", "urgent"]);
export type IssuePriority = z.infer<typeof IssuePrioritySchema>;

// Issue status
export const IssueStatusSchema = z.enum([
  "detected",
  "analyzing",
  "deliberating",
  "voting",
  "executed",
  "closed",
]);
export type IssueStatus = z.infer<typeof IssueStatusSchema>;

// Detected issue from inference mining
export const DetectedIssueSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string(),
  category: z.string(),
  priority: IssuePrioritySchema,
  status: IssueStatusSchema,
  detectedAt: z.date(),
  signals: z.array(NormalizedSignalSchema),
  evidence: z.array(
    z.object({
      type: z.string(),
      description: z.string(),
      data: z.record(z.unknown()),
    })
  ),
  suggestedActions: z.array(z.string()).optional(),
});
export type DetectedIssue = z.infer<typeof DetectedIssueSchema>;

// Issue detector interface
export interface IssueDetector {
  readonly name: string;
  analyze(signals: z.infer<typeof NormalizedSignalSchema>[]): DetectedIssue[];
}
