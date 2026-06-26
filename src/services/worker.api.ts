import { api } from './api';

export const workerApi = {
  getAssignments: async () => {
    const response = await api.get('/workers/assignments');
    return response.data.data;
  },

  updateAssignment: async (issueId: string, status: string, progress: number) => {
    const response = await api.patch('/workers/assignments', { issueId, status, progress });
    return response.data.data;
  },

  updateGps: async (lat: number, lng: number) => {
    const response = await api.post('/workers/gps', { lat, lng });
    return response.data.data;
  }
};
