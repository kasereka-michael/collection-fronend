import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchClients();
    }
    // eslint-disable-next-line
  }, [user]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      let response;
      if (user && user.role === 'ADMIN') {
        response = await clientService.getAllClients();
      } else if (user && user.role === 'COLLECTOR') {
        response = await clientService.getClientsByCollector(user.id);
      } else {
        response = { data: [] };
      }
      setClients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (searchQuery.trim()) {
      try {
        let response;
        if (user && user.role === 'ADMIN') {
          response = await clientService.searchClients(searchQuery);
        } else if (user && user.role === 'COLLECTOR') {
          // Optionally, implement a search endpoint for collector if needed
          response = await clientService.getClientsByCollector(user.id); // fallback: filter client-side
          // Optionally filter client-side:
          response = { data: response.data.filter(client =>
            (client.firstName && client.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (client.lastName && client.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
            (client.phoneNumber && client.phoneNumber.includes(searchQuery)) ||
            (client.personalCode && client.personalCode.includes(searchQuery))
          ) };
        } else {
          response = { data: [] };
        }
        setClients(response.data);
      } catch (error) {
        console.error('Error searching clients:', error);
      }
    } else {
      fetchClients();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this client?')) {
      try {
        await clientService.deleteClient(id);
        fetchClients(); // Refresh the list
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client');
      }
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Client Management</h1>
            <button 
              style={user.role === 'COLLECTOR' ? {display: 'block'} : {display: 'none'}}
              className="btn btn-primary"
              onClick={() => navigate('/clients/new')}
            >
              <i className="fas fa-plus me-2"></i>
              Add New Client
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="row">
                <div className="col-md-6">
                  <h5>All Clients</h5>
                </div>
                <div className="col-md-6">
                  <div className="input-group">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search clients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={handleSearch}
                    >
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>First Name</th>
                        <th>Last Name</th>
                        <th>Phone</th>
                        <th>Address</th>
                        <th>Personal Code</th>
                        <th>Reg. Fee Paid</th>
                        {user.role !== 'COLLECTOR' && <th>Collector</th>}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(clients) && clients.length === 0 ? (
                        <tr>
                          <td colSpan={user.role !== 'COLLECTOR' ? 9 : 8} className="text-center">
                            No clients found
                          </td>
                        </tr>
                      ) : (
                        Array.isArray(clients) && clients.map((client) => (
                          <tr key={client.id}>
                            <td>{client.id}</td>
                            <td>{client.firstName}</td>
                            <td>{client.lastName}</td>
                            <td>{client.phoneNumber}</td>
                            <td>{client.address}</td>
                            <td>{client.personalCode}</td>
                            <td>{client.registrationFeePaid ? 'Yes' : 'No'}</td>
                            {user.role !== 'COLLECTOR' && (
                              <td>{client.collector ? (client.collector.username || client.collector.firstName || client.collector.id) : 'N/A'}</td>
                            )}
                            <td style={{display:'flex',flexDirection:'row', alignItems: 'center'}}>
                              <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => navigate(`/clients/${client.id}`)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                              style={user.role ==='COLLECTOR' ? {display: 'block'} : {display: 'none'}}
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => navigate(`/clients/${client.id}/edit`)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              <button
                                style={user.role === 'ADMIN' ? {display: 'block'} : {display: 'none'}}
                                className="btn btn-sm btn-danger"
                                onClick={() => handleDelete(client.id)}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clients;
