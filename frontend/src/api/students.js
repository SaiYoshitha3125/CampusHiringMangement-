import api from './client';

export const studentsApi = {
  getProfile: async () => {
    const res = await api.get('/students/profile/');
    return res.data;
  },

  updateProfile: async (data) => {
    const res = await api.patch('/students/profile/', data);
    return res.data;
  },

  uploadResume: async (formData) => {
    const res = await api.post('/students/resume/upload/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  listResumes: async () => {
    const res = await api.get('/students/resumes/');
    return res.data;
  },

  getResume: async (id) => {
    const res = await api.get(`/students/resumes/${id}/`);
    return res.data;
  },

  deleteResume: async (id) => {
    const res = await api.delete(`/students/resumes/${id}/`);
    return res.data;
  },

  listAllStudentsAdmin: async (params) => {
    const res = await api.get('/students/admin/all/', { params });
    return res.data;
  },

  togglePlacementEligibility: async (id) => {
    const res = await api.patch(`/students/admin/${id}/toggle-eligibility/`);
    return res.data;
  }
};
