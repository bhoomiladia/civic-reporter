import { api } from './api';

export const categoriesApi = {
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data.data;
  }
};
