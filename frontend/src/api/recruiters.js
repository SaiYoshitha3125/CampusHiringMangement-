import api from './client';

export const recruitersApi = {
  getProfile: async () => {
    const res = await api.get('/recruiters/profile/');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.patch('/recruiters/profile/', data);
    return res.data;
  },

  getMyCompany: async () => {
    const res = await api.get('/companies/my_company/');
    return res.data;
  },

  updateMyCompany: async (data) => {
    const res = await api.patch('/companies/my_company/', data);
    return res.data;
  },

  listCompanies: async (params) => {
    const res = await api.get('/companies/', { params });
    return res.data;
  },

  verifyCompany: async (id) => {
    const res = await api.post(`/companies/${id}/verify/`);
    return res.data;
  },

  listAllRecruitersAdmin: async () => {
    const res = await api.get('/recruiters/all/');
    return res.data;
  }
};
