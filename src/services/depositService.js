import api from './api';

export const depositService = {
  // Get all deposits
  getAllDeposits: () => api.get('/deposits'),
  
  // Get deposit by ID
  getDepositById: (id) => api.get(`/deposits/${id}`),
  
  // Get deposits by cycle
  getDepositsByCycle: (cycleId) => api.get(`/deposits/cycle/${cycleId}`),
  
  // Get deposits by client
  getDepositsByClient: (clientId) => api.get(`/deposits/client/${clientId}`),
  
  // Get deposits by date range
  getDepositsByDateRange: (startDate, endDate) => 
    api.get(`/deposits/date-range?startDate=${startDate}&endDate=${endDate}`),
  
  // Get deposit summary by cycle
  getDepositSummaryByCycle: (cycleId) => api.get(`/deposits/summary/cycle/${cycleId}`),
  
  // Create new deposit
  createDeposit: (depositData) => api.post('/deposits', depositData),
  
  // Update deposit
  updateDeposit: (id, depositData) => api.put(`/deposits/${id}`, depositData),
  
  // Delete deposit
  deleteDeposit: (id) => api.delete(`/deposits/${id}`)
};
