import { api } from './api';

export const notificationsApi = {
  getNotifications: async (unreadOnly = false) => {
    const response = await api.get('/notifications', { params: { unread: unreadOnly } });
    return response.data.data;
  },

  markAllAsRead: async () => {
    const response = await api.patch('/notifications');
    return response.data.data;
  },

  markAsRead: async (id: string) => {
    const response = await api.patch(`/notifications/${id}`);
    return response.data.data;
  },

  getUnreadCount: async () => {
    const response = await api.get('/notifications/unread-count');
    return response.data.data; // { count: number }
  }
};
