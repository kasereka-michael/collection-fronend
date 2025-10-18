import api from './api';

export const reportService = {
  getReports: (filters) =>
    api.get('/reports', { params: filters }),
};
