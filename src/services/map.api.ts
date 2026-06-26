import { api } from './api';

export const mapApi = {
  reverseGeocode: async (lat: number, lng: number) => {
    const response = await api.get('/map/reverse-geocode', { params: { lat, lng } });
    return response.data.data;
  },

  forwardGeocode: async (q: string) => {
    const response = await api.get('/map/forward-geocode', { params: { q } });
    return response.data.data;
  },

  autocomplete: async (q: string) => {
    const response = await api.get('/map/autocomplete', { params: { q } });
    return response.data.data;
  },

  getClusters: async (bbox: string, zoom: number) => {
    const response = await api.get('/map/clusters', { params: { bbox, zoom } });
    return response.data.data;
  },

  getHeatmap: async (lat: number, lng: number, radius = 5000) => {
    const response = await api.get('/map/heatmap', { params: { lat, lng, radius } });
    return response.data.data;
  }
};
