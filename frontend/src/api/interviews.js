import api from './client';

export const interviewsApi = {
  listInterviews: async (params) => {
    const res = await api.get('/interviews/', { params });
    return res.data;
  },

  getUpcomingInterviews: async () => {
    const res = await api.get('/interviews/upcoming/');
    return res.data;
  },

  scheduleInterview: async (data) => {
    const res = await api.post('/interviews/', data);
    return res.data;
  },

  rescheduleInterview: async (id, data) => {
    const res = await api.post(`/interviews/${id}/reschedule/`, data);
    return res.data;
  },

  cancelInterview: async (id, reason) => {
    const res = await api.post(`/interviews/${id}/cancel_interview/`, { reason });
    return res.data;
  }
};
