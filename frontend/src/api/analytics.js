import api from './client';

export const analyticsApi = {
  getOverview: async () => {
    const res = await api.get('/analytics/overview/');
    return res.data;
  },

  getDepartments: async () => {
    const res = await api.get('/analytics/departments/');
    return res.data;
  },

  getFunnel: async () => {
    const res = await api.get('/analytics/funnel/');
    return res.data;
  },

  getCompanies: async () => {
    const res = await api.get('/analytics/companies/');
    return res.data;
  },

  getTrends: async () => {
    const res = await api.get('/analytics/trends/');
    return res.data;
  },

  getExportCSVUrl: () => {
    return '/api/analytics/export-csv/';
  }
};
