import api from './api';

export const withdrawalService = {
  // Get all withdrawal requests
  getAllWithdrawalRequests: () => api.get('/withdrawals'),
  // Get my withdrawal requests (collector)
  getMyWithdrawalRequests: () => api.get('/withdrawals/my'),
  
  // Get withdrawal request by ID
  getWithdrawalRequestById: (id) => api.get(`/withdrawals/${id}`),
  
  // Get pending withdrawal requests
  getPendingWithdrawalRequests: () => api.get('/withdrawals/pending'),
  // Get my pending withdrawal requests (collector)
  getMyPendingWithdrawalRequests: () => api.get('/withdrawals/my/pending'),
  
  // Get approved withdrawal requests
  getApprovedWithdrawalRequests: () => api.get('/withdrawals/approved'),
  // Get my approved withdrawal requests (collector)
  getMyApprovedWithdrawalRequests: () => api.get('/withdrawals/my/approved'),
  
  // Get withdrawal requests by client
  getWithdrawalRequestsByClient: (clientId) => api.get(`/withdrawals/client/${clientId}`),
  
  // Get withdrawal requests by cycle
  getWithdrawalRequestsByCycle: (cycleId) => api.get(`/withdrawals/cycle/${cycleId}`),
  
  // Create new withdrawal request
  createWithdrawalRequest: (requestData) => api.post('/withdrawals', requestData),
  
  // Update withdrawal request
  updateWithdrawalRequest: (id, requestData) => api.put(`/withdrawals/${id}`, requestData),
  
  // Approve withdrawal request
  approveWithdrawalRequest: (id, approvalData) => api.put(`/withdrawals/${id}/approve`, approvalData),
  
  // Reject withdrawal request
  rejectWithdrawalRequest: (id, rejectionData) => api.put(`/withdrawals/${id}/reject`, rejectionData),
  
  // Delete withdrawal request
  deleteWithdrawalRequest: (id) => api.delete(`/withdrawals/${id}`)
};
