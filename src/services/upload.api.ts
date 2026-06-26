import { api } from './api';

export const uploadApi = {
  uploadFile: async (file: File, onProgress?: (percent: number) => void): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percent);
        }
      },
    });

    return response.data.data.url;
  },

  uploadBase64: async (base64String: string, filename: string): Promise<string> => {
    const response = await api.post('/upload', {
      file: base64String,
      filename,
    });
    return response.data.data.url;
  }
};
