import { api } from './api';

export const dashboardApi = {
  getDashboardData: async (category?: string) => {
    const response = await api.get('/dashboard', { params: category ? { category } : undefined });
    return response.data.data;
  },

  getStats: async () => {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  }
};
