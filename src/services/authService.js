import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.token) {
      localStorage.setItem('jwt', response.data.token);
    }
    return response.data;
  },

  register: async (nombre, email, password) => {
    const response = await api.post('/auth/register', { nombre, email, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('jwt');
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/status');
    return response.data;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('jwt');
  }
};