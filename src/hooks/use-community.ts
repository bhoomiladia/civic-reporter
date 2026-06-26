import { useQuery } from '@tanstack/react-query';
import { communityApi } from '@/services/community.api';
import { dashboardApi } from '@/services/dashboard.api';

export function useCommunityOverview() {
  return useQuery({
    queryKey: ['community', 'overview'],
    queryFn: () => communityApi.getCommunityData(),
  });
}

export function usePublicStats() {
  return useQuery({
    queryKey: ['public', 'stats'],
    queryFn: () => dashboardApi.getStats(),
  });
}
