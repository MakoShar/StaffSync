import api from './api';

export const leaveService = {
  applyLeave: async (data) => {
    const res = await api.post('/leaves', data);
    return res.data;
  },

  getMyLeaves: async (params) => {
    const res = await api.get('/leaves/my-leaves', { params });
    return res.data;
  },

  getTeamLeaves: async (params) => {
    const res = await api.get('/leaves/team-leaves', { params });
    return res.data;
  },

  getAllLeaves: async (params) => {
    const res = await api.get('/leaves/all', { params });
    return res.data;
  },

  reviewLeave: async (id, status, remarks) => {
    const res = await api.patch(`/leaves/${id}/review`, { status, remarks });
    return res.data;
  },

  cancelLeave: async (id) => {
    const res = await api.delete(`/leaves/${id}`);
    return res.data;
  },
};
