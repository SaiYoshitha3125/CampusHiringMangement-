import api from './client';

export const authApi = {
  login: async (credentials) => {
    const res = await api.post('/auth/login/', credentials);
    return res.data;
  },

  register: async (userData) => {
    const res = await api.post('/auth/register/', userData);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me/');
    return res.data;
  },

  getAdminUsers: async (params) => {
    const res = await api.get('/auth/admin/users/', { params });
    return res.data;
  },

  toggleUserActive: async (userId, isActive) => {
    const res = await api.patch(`/auth/admin/users/${userId}/`, { is_active: isActive });
    return res.data;
  }
};
