import api from './api';

export const depositService = {
  // Get all deposits (paginated)
  getAllDeposits: (page = 0, size = 10) => api.get(`/deposits?page=${page}&size=${size}`),
  
  // Get deposit by ID
  getDepositById: (id) => api.get(`/deposits/${id}`),
  
  // Get deposits by cycle (paginated)
  getDepositsByCycle: (cycleId, page = 0, size = 10) => api.get(`/deposits/cycle/${cycleId}?page=${page}&size=${size}`),
  
  // Get deposits by client (paginated)
  getDepositsByClient: (clientId, page = 0, size = 10) => api.get(`/deposits/client/${clientId}?page=${page}&size=${size}`),
  
  // Get deposits by date range (paginated)
  getDepositsByDateRange: (startDate, endDate, page = 0, size = 10) => 
    api.get(`/deposits/date-range?startDate=${startDate}&endDate=${endDate}&page=${page}&size=${size}`),
  
  // Get deposit summary by cycle
  getDepositSummaryByCycle: (cycleId) => api.get(`/deposits/summary/cycle/${cycleId}`),
  
  // Create new deposit
  createDeposit: (depositData) => api.post('/deposits', depositData),
  
  // Update deposit
  updateDeposit: (id, depositData) => api.put(`/deposits/${id}`, depositData),
  
  // Delete deposit
  deleteDeposit: (id) => api.delete(`/deposits/${id}`)
};
