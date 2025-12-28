import {
  Proposal,
  Vote,
  VoteTally,
  VoteChoice,
  DecisionPacket,
  generateId,
  now,
} from "@oracle/core";

export interface VotingConfig {
  defaultQuorum: number; // Minimum votes required
  defaultThreshold: number; // Percentage to pass (0-100)
  votingPeriod: number; // Duration in milliseconds
}

export class VotingSystem {
  private proposals: Map<string, Proposal> = new Map();
  private votes: Map<string, Vote[]> = new Map();
  private config: VotingConfig;

  constructor(config: Partial<VotingConfig> = {}) {
    this.config = {
      defaultQuorum: config.defaultQuorum || 100,
      defaultThreshold: config.defaultThreshold || 50,
      votingPeriod: config.votingPeriod || 7 * 24 * 60 * 60 * 1000, // 7 days
    };
  }

  createProposal(
    decisionPacket: DecisionPacket,
    proposer: string,
    options?: {
      quorum?: number;
      threshold?: number;
      votingPeriod?: number;
    }
  ): Proposal {
    const votingStartsAt = now();
    const votingEndsAt = new Date(
      votingStartsAt.getTime() +
        (options?.votingPeriod || this.config.votingPeriod)
    );

    const proposal: Proposal = {
      id: generateId(),
      decisionPacket,
      proposer,
      status: "pending",
      votingStartsAt,
      votingEndsAt,
      quorum: options?.quorum || this.config.defaultQuorum,
      threshold: options?.threshold || this.config.defaultThreshold,
      createdAt: now(),
    };

    this.proposals.set(proposal.id, proposal);
    this.votes.set(proposal.id, []);

    return proposal;
  }

  activateProposal(proposalId: string): Proposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== "pending") {
      throw new Error(`Proposal ${proposalId} is not pending`);
    }

    proposal.status = "active";
    proposal.votingStartsAt = now();
    proposal.votingEndsAt = new Date(
      proposal.votingStartsAt.getTime() + this.config.votingPeriod
    );

    return proposal;
  }

  castVote(
    proposalId: string,
    voter: string,
    choice: VoteChoice,
    weight: bigint,
    reason?: string
  ): Vote {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== "active") {
      throw new Error(`Proposal ${proposalId} is not active for voting`);
    }

    const currentTime = now();
    if (currentTime > proposal.votingEndsAt) {
      throw new Error(`Voting period for proposal ${proposalId} has ended`);
    }

    // Check for duplicate vote
    const existingVotes = this.votes.get(proposalId) || [];
    const existingVote = existingVotes.find((v) => v.voter === voter);
    if (existingVote) {
      throw new Error(`Voter ${voter} has already voted on this proposal`);
    }

    const vote: Vote = {
      id: generateId(),
      proposalId,
      voter,
      choice,
      weight,
      reason,
      timestamp: currentTime,
    };

    existingVotes.push(vote);
    this.votes.set(proposalId, existingVotes);

    return vote;
  }

  tallyVotes(proposalId: string): VoteTally {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    const votes = this.votes.get(proposalId) || [];

    let forVotes = 0n;
    let againstVotes = 0n;
    let abstainVotes = 0n;

    for (const vote of votes) {
      switch (vote.choice) {
        case "for":
          forVotes += vote.weight;
          break;
        case "against":
          againstVotes += vote.weight;
          break;
        case "abstain":
          abstainVotes += vote.weight;
          break;
      }
    }

    const totalVotes = forVotes + againstVotes + abstainVotes;
    const quorumReached = votes.length >= proposal.quorum;

    // Calculate pass/fail (abstains don't count toward threshold)
    const decisiveVotes = forVotes + againstVotes;
    const forPercentage =
      decisiveVotes > 0n
        ? Number((forVotes * 100n) / decisiveVotes)
        : 0;
    const passed = quorumReached && forPercentage >= proposal.threshold;

    return {
      proposalId,
      forVotes,
      againstVotes,
      abstainVotes,
      totalVotes,
      participationRate: votes.length / proposal.quorum,
      quorumReached,
      passed,
    };
  }

  finalizeProposal(proposalId: string): Proposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== "active") {
      throw new Error(`Proposal ${proposalId} is not active`);
    }

    const tally = this.tallyVotes(proposalId);

    proposal.status = tally.passed ? "passed" : "rejected";

    return proposal;
  }

  executeProposal(proposalId: string): Proposal {
    const proposal = this.proposals.get(proposalId);
    if (!proposal) {
      throw new Error(`Proposal ${proposalId} not found`);
    }

    if (proposal.status !== "passed") {
      throw new Error(`Proposal ${proposalId} has not passed (status: ${proposal.status})`);
    }

    proposal.status = "executed";
    proposal.executedAt = now();

    return proposal;
  }

  getProposal(proposalId: string): Proposal | undefined {
    return this.proposals.get(proposalId);
  }

  getVotes(proposalId: string): Vote[] {
    return this.votes.get(proposalId) || [];
  }

  listProposals(status?: Proposal["status"]): Proposal[] {
    const proposals = Array.from(this.proposals.values());
    if (status) {
      return proposals.filter((p) => p.status === status);
    }
    return proposals;
  }
}
