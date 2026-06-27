import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { issuesApi, IssueQueryParams } from '@/services/issues.api';

export function useIssues(params?: IssueQueryParams) {
  return useQuery({
    queryKey: ['issues', params],
    queryFn: () => issuesApi.getIssues(params),
    refetchInterval: 5000,
  });
}

// Fetch single issue details
export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issue', id],
    queryFn: () => issuesApi.getIssueById(id),
    enabled: !!id,
  });
}

export function useIssueTimeline(id: string) {
  return useQuery({
    queryKey: ['issue-timeline', id],
    queryFn: () => issuesApi.getTimeline(id),
    enabled: !!id,
    refetchInterval: 3000, // Poll every 3 seconds for live AI updates
  });
}

// Create new issue mutation
export function useCreateIssue() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issueData: any) => issuesApi.createIssue(issueData),
    onSuccess: () => {
      // Invalidate issues cache to trigger reload
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

// Update issue details mutation (e.g. status transition)
export function useUpdateIssue(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (issueData: any) => issuesApi.updateIssue(id, issueData),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
    },
  });
}

// Upvote/downvote mutation (updates cache optimistically or refetches)
export function useVoteIssue(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (type: 'up' | 'down') => issuesApi.voteIssue(id, type),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
      queryClient.invalidateQueries({ queryKey: ['issues'] });
    },
  });
}

// Add comment to issue mutation
export function useAddComment(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => issuesApi.addComment(id, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
    },
  });
}

// Verify issue existence mutation
export function useVerifyIssue(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => issuesApi.verifyIssue(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issue', id] });
    },
  });
}

// Fetch trending issues
export function useTrendingIssues() {
  return useQuery({
    queryKey: ['issues', 'trending'],
    queryFn: () => issuesApi.getTrendingIssues(),
  });
}

// Fetch nearby issues
export function useNearbyIssues(lat: number, lng: number, radius = 5000) {
  return useQuery({
    queryKey: ['issues', 'nearby', lat, lng, radius],
    queryFn: () => issuesApi.getNearbyIssues(lat, lng, radius),
    enabled: !isNaN(lat) && !isNaN(lng),
  });
}
