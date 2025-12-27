import { API_BASE_URL } from "./config";

class APIClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async fetch<T>(path: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // Health
  async getHealth() {
    return this.fetch<{ status: string; version: string; timestamp: string }>("/health");
  }

  // Signals
  async getSignals() {
    return this.fetch<{ signals: any[]; count: number }>("/api/signals");
  }

  async collectSignals() {
    return this.fetch<{ collected: number; signals: any[] }>("/api/signals/collect", {
      method: "POST",
    });
  }

  // Issues
  async detectIssues() {
    return this.fetch<{ issues: any[]; count: number }>("/api/issues/detect", {
      method: "POST",
    });
  }

  // Deliberation
  async deliberate(issue: any, context?: any) {
    return this.fetch<{ decisionPacket: any }>("/api/deliberate", {
      method: "POST",
      body: JSON.stringify({ issue, context }),
    });
  }

  // Proposals
  async getProposals(status?: string) {
    const query = status ? `?status=${status}` : "";
    return this.fetch<{ proposals: any[]; count: number }>(`/api/proposals${query}`);
  }

  async createProposal(decisionPacket: any, proposer: string, options?: any) {
    return this.fetch<{ proposal: any }>("/api/proposals", {
      method: "POST",
      body: JSON.stringify({ decisionPacket, proposer, options }),
    });
  }

  async getProposal(id: string) {
    return this.fetch<{ proposal: any }>(`/api/proposals/${id}`);
  }

  async castVote(proposalId: string, voter: string, choice: string, weight: string, reason?: string) {
    return this.fetch<{ vote: any }>(`/api/proposals/${proposalId}/vote`, {
      method: "POST",
      body: JSON.stringify({ voter, choice, weight, reason }),
    });
  }

  async tallyVotes(proposalId: string) {
    return this.fetch<{ tally: any }>(`/api/proposals/${proposalId}/tally`, {
      method: "POST",
    });
  }

  // Outcomes
  async recordOutcome(proposalId: string, actions: any[]) {
    return this.fetch<{ execution: any }>("/api/outcomes", {
      method: "POST",
      body: JSON.stringify({ proposalId, actions }),
    });
  }

  async getOutcomeProof(executionId: string) {
    return this.fetch<{ proof: any }>(`/api/outcomes/${executionId}/proof`);
  }

  // Trust
  async getTrustScore(entityId: string) {
    return this.fetch<{ score: any }>(`/api/trust/${entityId}`);
  }

  async getLeaderboard(type: string, limit?: number) {
    const query = limit ? `?limit=${limit}` : "";
    return this.fetch<{ leaderboard: any[] }>(`/api/trust/leaderboard/${type}${query}`);
  }

  // Stats
  async getStats() {
    return this.fetch<{
      signals: { adapterCount: number; rawSignalCount: number; normalizedSignalCount: number };
      proposals: { total: number; active: number; passed: number; rejected: number };
      outcomes: { totalProofs: number; successRate: number };
    }>("/api/stats");
  }
}

export const api = new APIClient(API_BASE_URL);
