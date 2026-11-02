import api from './client';

export const applicationsApi = {
  apply: async (jobId, resumeId) => {
    const res = await api.post('/applications/', { job_id: jobId, resume_id: resumeId });
    return res.data;
  },

  listApplications: async (params) => {
    const res = await api.get('/applications/', { params });
    return res.data;
  },

  getApplication: async (id) => {
    const res = await api.get(`/applications/${id}/`);
    return res.data;
  },

  updateStatus: async (id, status, recruiterNotes, remarks) => {
    const res = await api.patch(`/applications/${id}/update_status/`, {
      status,
      recruiter_notes: recruiterNotes,
      remarks,
    });
    return res.data;
  },

  shortlist: async (id, remarks) => {
    const res = await api.post(`/applications/${id}/shortlist/`, { remarks });
    return res.data;
  },

  acceptCandidate: async (id, remarks) => {
    const res = await api.post(`/applications/${id}/accept_candidate/`, { remarks });
    return res.data;
  },

  rejectCandidate: async (id, remarks) => {
    const res = await api.post(`/applications/${id}/reject_candidate/`, { remarks });
    return res.data;
  },

  withdraw: async (id) => {
    const res = await api.post(`/applications/${id}/withdraw/`);
    return res.data;
  }
};
