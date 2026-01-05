import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useProposals(status?: string) {
  return useQuery({
    queryKey: ['proposals', status],
    queryFn: () => api.getProposals({ status, limit: 100 }),
  });
}

export function useProposal(id: string) {
  return useQuery({
    queryKey: ['proposal', id],
    queryFn: () => api.getProposal(id),
    enabled: !!id,
  });
}









