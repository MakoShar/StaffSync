import api from './api';

export const reportService = {
  getHrDashboard: async () => {
    const res = await api.get('/reports/hr-dashboard');
    return res.data;
  },

  getManagerDashboard: async () => {
    const res = await api.get('/reports/manager-dashboard');
    return res.data;
  },

  getEmployeeDashboard: async () => {
    const res = await api.get('/reports/employee-dashboard');
    return res.data;
  },
};
