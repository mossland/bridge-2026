import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export function useSignals(sourceType?: string) {
  return useQuery({
    queryKey: ['signals', sourceType],
    queryFn: () => api.getSignals({ sourceType, limit: 100 }),
  });
}









