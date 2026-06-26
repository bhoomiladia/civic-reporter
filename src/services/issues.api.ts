import { api } from './api';

export interface IssueQueryParams {
  category?: string;
  status?: string;
  priority?: string;
  assignee?: string;
  q?: string;
  limit?: number;
  offset?: number;
}

export const issuesApi = {
  getIssues: async (params?: IssueQueryParams) => {
    const response = await api.get('/issues', { params });
    return response.data; // paginated: data, total, limit, offset
  },

  getIssueById: async (id: string) => {
    const response = await api.get(`/issues/${id}`);
    return response.data.data;
  },

  createIssue: async (issueData: any) => {
    const response = await api.post('/issues', issueData);
    return response.data.data;
  },

  updateIssue: async (id: string, issueData: any) => {
    const response = await api.patch(`/issues/${id}`, issueData);
    return response.data.data;
  },

  deleteIssue: async (id: string) => {
    const response = await api.delete(`/issues/${id}`);
    return response.data.data;
  },

  getTimeline: async (id: string) => {
    const response = await api.get(`/issues/${id}/timeline`);
    return response.data.data;
  },

  voteIssue: async (id: string, type: 'up' | 'down') => {
    const response = await api.post(`/issues/${id}/vote`, { type });
    return response.data.data;
  },

  verifyIssue: async (id: string) => {
    const response = await api.post(`/issues/${id}/verify`);
    return response.data.data;
  },

  reportIssue: async (id: string, reason: string) => {
    const response = await api.post(`/issues/${id}/report`, { reason });
    return response.data.data;
  },

  getComments: async (issueId: string) => {
    const response = await api.get(`/issues/${issueId}/comments`);
    return response.data.data;
  },

  addComment: async (issueId: string, content: string) => {
    const response = await api.post(`/issues/${issueId}/comments`, { content });
    return response.data.data;
  },

  getNearbyIssues: async (lat: number, lng: number, radius = 5000) => {
    const response = await api.get('/issues/nearby', { params: { lat, lng, radius } });
    return response.data.data;
  },

  getTrendingIssues: async () => {
    const response = await api.get('/issues/trending');
    return response.data.data;
  }
};
