import api from './api';

export const reportService = {
  // Unified reports endpoint with filters and pagination
  getReports: (params) => api.get('/reports', { params }),

  // Specific helpers if backend has individual endpoints
  getDepositReports: (params) => api.get('/deposits', { params }),
  getWithdrawalReports: (params) => api.get('/withdrawals', { params }),
  getCommissionReports: (params) => api.get('/commissions', { params }),

  // Today's totals
  getTodayRegistrationFees: () => api.get('/reports/registration-fees/today'),
};
