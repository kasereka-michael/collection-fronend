import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { clientService } from '../services/clientService';
import { useAuth } from '../contexts/AuthContext';
import { cycleService } from '../services/cycleService';

const ClientDetail = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { id } = useParams();
  const [client, setClient] = useState(null);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClientDetails();
  }, [id]);

  const fetchClientDetails = async () => {
    try {
      setLoading(true);
      
      // Fetch client details
      const clientResponse = await clientService.getClientById(id);
      setClient(clientResponse.data);
      
      // Fetch client's cycles
      const cyclesResponse = await cycleService.getCyclesByClient(id);
      setCycles(cyclesResponse.data);
      
    } catch (error) {
      console.error('Error fetching client details:', error);
      alert('Error loading client details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this client? This action cannot be undone.')) {
      try {
        await clientService.deleteClient(id);
        alert('Client deleted successfully');
        navigate('/clients');
      } catch (error) {
        console.error('Error deleting client:', error);
        alert('Error deleting client');
      }
    }
  };

  if (loading) {
    return (
      <div className="container-fluid">
        <div className="text-center mt-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          Client not found
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Client Details</h1>
            <div>
              <button 
              style={user.role ==='COLLECTOR' ? {display: 'block'} : {display: 'none'}}
                className="btn btn-warning me-2"
                onClick={() => navigate(`/clients/${id}/edit`)}
              >
                <i className="fas fa-edit me-2"></i>
                Edit Client
              </button>
              <button 
                style={user.role === 'ADMIN' ? {display: 'block'} : {display: 'none'}}
                className="btn btn-danger me-2"
                onClick={handleDelete}
              >
                <i className="fas fa-trash me-2"></i>
                Delete Client
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/clients')}
              >
                <i className="fas fa-arrow-left me-2"></i>
                Back to Clients
              </button>
            </div>
          </div>

          <div className="row">
            {/* Client Information */}
            <div className="col-md-8">
              <div className="card">
                <div className="card-header">
                  <h5>Client Information</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <strong>Full Name:</strong>
                      <p>{client.firstName}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Phone Number:</strong>
                      <p>{client.phoneNumber}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>National ID:</strong>
                      <p>{client.nationalId || 'N/A'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Date of Birth:</strong>
                      <p>{client.dateOfBirth ? new Date(client.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Occupation:</strong>
                      <p>{client.occupation || 'N/A'}</p>
                    </div>
                    <div className="col-12 mb-3">
                      <strong>Address:</strong>
                      <p>{client.address}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Emergency Contact:</strong>
                      <p>{client.emergencyContactName || 'N/A'}</p>
                    </div>
                    <div className="col-md-6 mb-3">
                      <strong>Emergency Phone:</strong>
                      <p>{client.emergencyContactPhone || 'N/A'}</p>
                    </div>
                     <div className="col-md-6 mb-3">
  <strong>Registration Fee Paid:</strong>
  <p>
    {client.registrationFeePaid === true ? (
      <span className="text-success">
        <i className="bi bi-check-circle-fill"></i> Yes
      </span>
    ) : (
      <span className="text-danger">
        <i className="bi bi-x-circle-fill"></i> No
      </span>
    )}
  </p>
</div>


                  </div>
                </div>
              </div>
            </div>

            {/* Client Statistics */}
            <div className="col-md-4">
              <div className="card">
                <div className="card-header">
                  <h5>Statistics</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <strong>Total Cycles:</strong>
                    <h4 className="text-primary">{cycles.length}</h4>
                  </div>
                  <div className="mb-3">
                    <strong>Active Cycles:</strong>
                    <h4 className="text-success">
                      {cycles.filter(cycle => cycle.status === 'ACTIVE').length}
                    </h4>
                  </div>
                  <div className="mb-3">
                    <strong>Completed Cycles:</strong>
                    <h4 className="text-info">
                      {cycles.filter(cycle => cycle.status === 'COMPLETED').length}
                    </h4>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Client Cycles */}
          <div className="row mt-4">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <div className="d-flex justify-content-between align-items-center">
                    <h5>Client Cycles</h5>
                    <button
                    style={user.role ==='COLLECTOR' ? {display: 'block'} : {display: 'none'}}
                      className="btn btn-primary btn-sm"
                      onClick={() => navigate('/cycles/new', { state: { clientId: id } })}
                    >
                      <i className="fas fa-plus me-2"></i>
                      New Cycle
                    </button>
                  </div>
                </div>
                <div className="card-body">
                  {cycles.length === 0 ? (
                    <p className="text-muted">No cycles found for this client.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Cycle ID</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {cycles.map((cycle) => (
                            <tr key={cycle.id}>
                              <td>{cycle.id}</td>
                              <td>{new Date(cycle.startDate).toLocaleDateString()}</td>
                              <td>{cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : 'N/A'}</td>
                              <td>{parseFloat(cycle.totalAmount || 0).toLocaleString()} UGX</td>
                              <td>
                                <span className={`badge ${cycle.status === 'ACTIVE' ? 'bg-success' : 'bg-info'}`}>
                                  {cycle.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => navigate(`/cycles/${cycle.id}`)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientDetail;
