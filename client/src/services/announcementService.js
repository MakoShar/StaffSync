import api from './api';

export const announcementService = {
  getAnnouncements: async () => {
    const res = await api.get('/announcements');
    return res.data;
  },

  createAnnouncement: async (data) => {
    const res = await api.post('/announcements', data);
    return res.data;
  },

  updateAnnouncement: async (id, data) => {
    const res = await api.put(`/announcements/${id}`, data);
    return res.data;
  },

  deleteAnnouncement: async (id) => {
    const res = await api.delete(`/announcements/${id}`);
    return res.data;
  },
};
