import { api } from './api';

export const municipalityApi = {
  getAssignments: async () => {
    const response = await api.get('/municipality/assignments');
    return response.data.data;
  },

  createAssignment: async (issueId: string, workerId: string, notes?: string) => {
    const response = await api.post('/municipality/assignments', { issueId, workerId, notes });
    return response.data.data;
  },

  updateAssignment: async (assignmentId: string, status: string, notes?: string) => {
    const response = await api.patch(`/municipality/assignments/${assignmentId}`, { status, notes });
    return response.data.data;
  }
};
