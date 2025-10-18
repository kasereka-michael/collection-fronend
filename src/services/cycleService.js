import api from './api';

export const cycleService = {
  // Get all cycles
  getAllCycles: () => api.get('/cycles'),

  // Get cycles for current collector (my clients)
  getCyclesForCurrentCollector: () => api.get('/cycles/my-clients'),
  
  // Get cycle by ID
  getCycleById: (id) => api.get(`/cycles/${id}`),
  
  // Get active cycles
  getActiveCycles: () => api.get('/cycles/active'),
  
  // Get cycles by client
  getCyclesByClient: (clientId) => api.get(`/cycles/client/${clientId}`),
  
  // Create new cycle
  createCycle: (cycleData) => api.post('/cycles', cycleData),
  
  // Update cycle
  updateCycle: (id, cycleData) => api.put(`/cycles/${id}`, cycleData),
  
  // Complete cycle
  completeCycle: (id) => api.put(`/cycles/${id}/complete`),
  
  // Delete cycle
  deleteCycle: (id) => api.delete(`/cycles/${id}`)
};
