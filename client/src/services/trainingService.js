import api from './api';

export const trainingService = {
  getTrainings: async (params) => {
    const res = await api.get('/trainings', { params });
    return res.data;
  },

  createTraining: async (data) => {
    const res = await api.post('/trainings', data);
    return res.data;
  },

  enrollTraining: async (id) => {
    const res = await api.post(`/trainings/${id}/enroll`);
    return res.data;
  },

  withdrawTraining: async (id) => {
    const res = await api.post(`/trainings/${id}/withdraw`);
    return res.data;
  },

  updateTraining: async (id, data) => {
    const res = await api.put(`/trainings/${id}`, data);
    return res.data;
  },
};
