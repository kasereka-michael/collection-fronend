import api from './api';

export const userService = {
  // Get all users (paginated)
  getAllUsers: ({ page = 0, size = 10 } = {}) => api.get('/users', { params: { page, size } }),
  
  // Get user by ID
  getUserById: (id) => api.get(`/users/${id}`),
  
  // Get active users (paginated)
  getActiveUsers: ({ page = 0, size = 10 } = {}) => api.get('/users/active', { params: { page, size } }),
  
  // Get users by role (paginated)
  getUsersByRole: (role, { page = 0, size = 10 } = {}) => api.get(`/users/role/${role}`, { params: { page, size } }),
  
  // Create new user
  createUser: (userData) => api.post('/users', userData),
  
  // Update user
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  
  // Update user password
  updateUserPassword: (id, passwordData) => api.put(`/users/${id}/password`, passwordData),
  
  // Activate user
  activateUser: (id) => api.put(`/users/${id}/activate`),
  
  // Deactivate user
  deactivateUser: (id) => api.put(`/users/${id}/deactivate`),
  
  // Delete user
  deleteUser: (id) => api.delete(`/users/${id}`)
};
