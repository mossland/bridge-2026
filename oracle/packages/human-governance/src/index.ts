// Voting System
export { VotingSystem, type VotingConfig } from "./voting.js";

// Delegation
export {
  DelegationManager,
  DELEGATION_TEMPLATES,
  type DelegationCondition,
} from "./delegation.js";

// Re-export core types
export type {
  Proposal,
  Vote,
  VoteTally,
  VoteChoice,
  DelegationPolicy,
} from "@oracle/core";
