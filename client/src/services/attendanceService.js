import api from './api';

export const attendanceService = {
  checkIn: async (remarks) => {
    const res = await api.post('/attendance/check-in', { remarks });
    return res.data;
  },

  checkOut: async (remarks) => {
    const res = await api.post('/attendance/check-out', { remarks });
    return res.data;
  },

  getTodayStatus: async () => {
    const res = await api.get('/attendance/today');
    return res.data;
  },

  getMyHistory: async (params) => {
    const res = await api.get('/attendance/my-history', { params });
    return res.data;
  },

  getMyCalendar: async () => {
    const res = await api.get('/attendance/my-calendar');
    return res.data;
  },

  resetTodayAttendance: async () => {
    const res = await api.post('/attendance/reset-today');
    return res.data;
  },

  getTeamAttendance: async (params) => {
    const res = await api.get('/attendance/team', { params });
    return res.data;
  },

  getAllAttendance: async (params) => {
    const res = await api.get('/attendance/all', { params });
    return res.data;
  },
};
