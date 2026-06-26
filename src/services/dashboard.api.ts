import { api } from './api';

export const dashboardApi = {
  getDashboardData: async (type?: string) => {
    const response = await api.get('/dashboard', { params: type ? { type } : undefined });
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  }
};
