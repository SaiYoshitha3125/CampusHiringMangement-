import api from './client';

export const jobsApi = {
  listJobs: async (params) => {
    const res = await api.get('/jobs/', { params });
    return res.data;
  },

  getJob: async (id) => {
    const res = await api.get(`/jobs/${id}/`);
    return res.data;
  },

  createJob: async (data) => {
    const res = await api.post('/jobs/', data);
    return res.data;
  },

  updateJob: async (id, data) => {
    const res = await api.patch(`/jobs/${id}/`, data);
    return res.data;
  },

  closeJob: async (id) => {
    const res = await api.post(`/jobs/${id}/close/`);
    return res.data;
  },

  approveJob: async (id) => {
    const res = await api.post(`/jobs/${id}/approve/`);
    return res.data;
  },

  rejectJob: async (id, reason) => {
    const res = await api.post(`/jobs/${id}/reject/`, { reason });
    return res.data;
  },

  checkEligibility: async (id) => {
    const res = await api.get(`/jobs/${id}/eligibility-check/`);
    return res.data;
  },

  checkSkillMatch: async (id) => {
    const res = await api.get(`/jobs/${id}/skill-match/`);
    return res.data;
  },

  getMyJobs: async () => {
    const res = await api.get('/jobs/my_jobs/');
    return res.data;
  },

  listCycles: async () => {
    const res = await api.get('/jobs/cycles/');
    return res.data;
  },

  createCycle: async (data) => {
    const res = await api.post('/jobs/cycles/', data);
    return res.data;
  }
};
