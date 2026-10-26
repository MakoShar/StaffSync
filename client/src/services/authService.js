import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('staffsync_token', response.data.token);
      localStorage.setItem('staffsync_user', JSON.stringify(response.data.user));
      if (response.data.employee) {
        localStorage.setItem('staffsync_employee', JSON.stringify(response.data.employee));
      }
    }
    return response.data;
  },

  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      localStorage.removeItem('staffsync_token');
      localStorage.removeItem('staffsync_user');
      localStorage.removeItem('staffsync_employee');
    }
  },
};
