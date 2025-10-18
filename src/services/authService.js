import api from './api';

export const authService = {
  // User login
  login: (credentials) => api.post('/auth/login', credentials),

  // User logout
  logout: () => api.post('/auth/logout'),
};
