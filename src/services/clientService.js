import api from './api';

export const clientService = {
  // Get all clients (paginated)
  getAllClients: ({ page = 0, size = 10 } = {}) => api.get('/clients', { params: { page, size } }),
  
  // Get client by ID
  getClientById: (id) => api.get(`/clients/${id}`),
  
  // Create new client
  createClient: (clientData) => api.post('/clients', clientData),
  
  // Update client
  updateClient: (id, clientData) => api.put(`/clients/${id}`, clientData),
  
  // Delete client
  deleteClient: (id) => api.delete(`/clients/${id}`),
  
  // Search clients (paginated)
  searchClients: (query, { page = 0, size = 10 } = {}) => api.get(`/clients/search`, { params: { query, page, size } }),

  // Get clients by collector (paginated)
  getClientsByCollector: (collectorId, { page = 0, size = 10 } = {}) => api.get(`/clients/collector/${collectorId}`, { params: { page, size } })

};
