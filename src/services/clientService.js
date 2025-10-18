import api from './api';

export const clientService = {
  // Get all clients
  getAllClients: () => api.get('/clients'),
  
  // Get client by ID
  getClientById: (id) => api.get(`/clients/${id}`),
  
  // Create new client
  createClient: (clientData) => api.post('/clients', clientData),
  
  // Update client
  updateClient: (id, clientData) => api.put(`/clients/${id}`, clientData),
  
  // Delete client
  deleteClient: (id) => api.delete(`/clients/${id}`),
  
  // Search clients
  searchClients: (query) => api.get(`/clients/search?query=${encodeURIComponent(query)}`),

  // Get clients by collector
  getClientsByCollector: (collectorId) => api.get(`/clients/collector/${collectorId}`)

};
