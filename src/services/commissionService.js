import api from './api';

export const commissionService = {
  // Get all commissions
  getAllCommissions: () => api.get('/commissions'),
  
  // Get commission by ID
  getCommissionById: (id) => api.get(`/commissions/${id}`),
  
  // Get commissions by collector
  getCommissionsByCollector: (collectorId) => api.get(`/commissions/collector/${collectorId}`),
  
  // Get commissions by cycle
  getCommissionsByCycle: (cycleId) => api.get(`/commissions/cycle/${cycleId}`),
  
  // Get commissions by date range
  getCommissionsByDateRange: (startDate, endDate) => 
    api.get(`/commissions/date-range?startDate=${startDate}&endDate=${endDate}`),
  
  // Get pending commissions
  getPendingCommissions: () => api.get('/commissions/pending'),
  
  // Get paid commissions
  getPaidCommissions: () => api.get('/commissions/paid'),
  
  // Get commission summary by collector
  getCommissionSummaryByCollector: (collectorId) => api.get(`/commissions/summary/collector/${collectorId}`),
  
  // Create new commission
  createCommission: (commissionData) => api.post('/commissions', commissionData),
  
  // Update commission
  updateCommission: (id, commissionData) => api.put(`/commissions/${id}`, commissionData),
  
  // Pay commission
  payCommission: (id, paymentData) => api.put(`/commissions/${id}/pay`, paymentData),
  
  // Delete commission
  deleteCommission: (id) => api.delete(`/commissions/${id}`)
};
