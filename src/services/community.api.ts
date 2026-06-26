import { api } from './api';

export const communityApi = {
  getCommunityData: async (section?: string, limit?: number) => {
    const response = await api.get('/community', {
      params: {
        ...(section && { section }),
        ...(limit && { limit }),
      }
    });
    return response.data.data;
  }
};
