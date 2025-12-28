/**
 * API Client
 * 
 * 백엔드 API와 통신하는 클라이언트입니다.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Signals
  getSignals: (params?: {
    sourceType?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.sourceType) query.append('sourceType', params.sourceType);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    return fetchAPI<{ signals: any[]; total: number }>(
      `/api/signals?${query.toString()}`
    );
  },

  collectSignals: () => {
    return fetchAPI<{ collected: number }>('/api/signals/collect', {
      method: 'POST',
    });
  },

  // Proposals
  getProposals: (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    return fetchAPI<{ proposals: any[]; total: number }>(
      `/api/proposals?${query.toString()}`
    );
  },

  getProposal: (id: string) => {
    return fetchAPI<any>(`/api/proposals/${id}`);
  },

  castVote: (proposalId: string, data: {
    voterAddress: string;
    choice: 'yes' | 'no' | 'abstain';
    txHash?: string;
  }) => {
    return fetchAPI<{ success: boolean; txHash?: string }>(
      `/api/proposals/${proposalId}/vote`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // Delegation
  getDelegationPolicies: (wallet?: string) => {
    const query = wallet ? `?wallet=${wallet}` : '';
    return fetchAPI<Array<any>>(`/api/delegation/policies${query}`);
  },

  createDelegationPolicy: (data: any) => {
    return fetchAPI<any>('/api/delegation/policies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  deleteDelegationPolicy: (id: string) => {
    return fetchAPI<{ success: boolean }>(`/api/delegation/policies/${id}`, {
      method: 'DELETE',
    });
  },

  // Outcomes
  getOutcomes: (params?: {
    status?: string;
    limit?: number;
    offset?: number;
  }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.offset) query.append('offset', params.offset.toString());
    
    return fetchAPI<{ outcomes: any[]; total: number }>(
      `/api/outcomes?${query.toString()}`
    );
  },

  getOutcome: (id: string) => {
    return fetchAPI<any>(`/api/outcomes/${id}`);
  },
};


