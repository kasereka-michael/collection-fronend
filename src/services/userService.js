import api from './api';

export const userService = {
  // Get all users
  getAllUsers: () => api.get('/users'),
  
  // Get user by ID
  getUserById: (id) => api.get(`/users/${id}`),
  
  // Get active users
  getActiveUsers: () => api.get('/users/active'),
  
  // Get users by role
  getUsersByRole: (role) => api.get(`/users/role/${role}`),
  
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
