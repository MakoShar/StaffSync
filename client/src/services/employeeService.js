import api from './api';

export const employeeService = {
  getEmployees: async (params) => {
    const res = await api.get('/employees', { params });
    return res.data;
  },

  getDirectory: async (params) => {
    const res = await api.get('/employees/directory', { params });
    return res.data;
  },

  getEmployeeById: async (id) => {
    const res = await api.get(`/employees/${id}`);
    return res.data;
  },

  createEmployee: async (data) => {
    const res = await api.post('/employees', data);
    return res.data;
  },

  updateEmployee: async (id, data) => {
    const res = await api.put(`/employees/${id}`, data);
    return res.data;
  },

  updateMyProfile: async (data) => {
    const res = await api.patch('/employees/profile/me', data);
    return res.data;
  },

  changeStatus: async (id, status) => {
    const res = await api.patch(`/employees/${id}/status`, { status });
    return res.data;
  },

  getManagers: async () => {
    const res = await api.get('/managers');
    return res.data;
  },

  getMyTeam: async () => {
    const res = await api.get('/managers/my-team');
    return res.data;
  },
};
