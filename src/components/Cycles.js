import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cycleService } from '../services/cycleService';
import { clientService } from '../services/clientService';
import LoadingSpinner from './common/LoadingSpinner';
import ConfirmModal from './common/ConfirmModal';

const Cycles = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cycles, setCycles] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [filterClient, setFilterClient] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cycleToDelete, setCycleToDelete] = useState(null);

  useEffect(() => {
    fetchCycles();
    fetchClients();
  }, []);

  useEffect(() => {
    filterCycles();
  }, [filterStatus, filterClient, searchQuery]);

  const fetchCycles = async () => {
    try {
      setLoading(true);
      const response = await cycleService.getCyclesForCurrentCollector();
      const data = response.data;
      const items = Array.isArray(data) ? data : (data?.content ?? []);
      setCycles(items);
    } catch (error) {
      console.error('Error fetching cycles:', error);
      alert('Error fetching cycles. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await clientService.getAllClients();
      const data = response.data;
      const items = Array.isArray(data) ? data : (data?.content ?? []);
      setClients(items);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const filterCycles = () => {
    let filtered = cycles;

    if (filterStatus !== 'ALL') {
      filtered = filtered.filter(cycle => cycle.status === filterStatus);
    }

    if (filterClient !== 'ALL') {
      filtered = filtered.filter(cycle => cycle.client?.id === parseInt(filterClient));
    }

    if (searchQuery) {
      filtered = filtered.filter(cycle => 
        cycle.client?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cycle.id.toString().includes(searchQuery)
      );
    }

    return filtered;
  };

  const handleDeleteCycle = async () => {
    try {
      await cycleService.deleteCycle(cycleToDelete.id);
      setCycles(cycles.filter(cycle => cycle.id !== cycleToDelete.id));
      setShowDeleteModal(false);
      setCycleToDelete(null);
      alert('Cycle deleted successfully');
    } catch (error) {
      console.error('Error deleting cycle:', error);
      alert('Error deleting cycle. Please try again.');
    }
  };

  const handleCompleteCycle = async (cycleId) => {
    try {
      await cycleService.completeCycle(cycleId);
      fetchCycles(); // Refresh the list
      alert('Cycle completed successfully');
    } catch (error) {
      console.error('Error completing cycle:', error);
      alert('Error completing cycle. Please try again.');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'ACTIVE': return 'bg-success';
      case 'COMPLETED': return 'bg-info';
      case 'CLOSED': return 'bg-secondary';
      default: return 'bg-secondary';
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.firstName : 'Unknown Client';
  };

  const filteredCycles = Array.isArray(cycles) ? filterCycles() : [];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Cycles Management</h1>
            {/* <button 
              className="btn btn-primary"
              onClick={() => navigate('/cycles/new')}
            >
              <i className="fas fa-plus me-2"></i>
              New Cycle
            </button> */}
          </div>

          {/* Filters */}
          <div className="card mb-4">
            <div className="card-body">
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label htmlFor="filterStatus" className="form-label">Filter by Status</label>
                  <select
                    id="filterStatus"
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>
                <div className="col-md-3 mb-3">
                  <label htmlFor="filterClient" className="form-label">Filter by Client</label>
                  <select
                    id="filterClient"
                    className="form-select"
                    value={filterClient}
                    onChange={(e) => setFilterClient(e.target.value)}
                  >
                    <option value="ALL">All Clients</option>
                    {Array.isArray(clients) && clients.map(client => (
                      <option key={client.id} value={client.id}>
                        {client.firstName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-6 mb-3">
                  <label htmlFor="searchQuery" className="form-label">Search</label>
                  <input
                    type="text"
                    id="searchQuery"
                    className="form-control"
                    placeholder="Search by client name or cycle ID..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cycles Table */}
          <div className="card">
            <div className="card-body">
              {filteredCycles.length === 0 ? (
                <p className="text-muted text-center">No cycles found.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Client</th>
                        <th>Status</th>
                        <th>Total Deposits</th>
                        <th>Total Amount</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCycles.map((cycle) => (
                        <tr key={cycle.id}>
                          <td>{cycle.id}</td>
                          <td>{getClientName(cycle.client?.id)}</td>
                          <td>
                            <span className={`badge ${getStatusBadgeClass(cycle.status)}`}>
                              {cycle.status}
                            </span>
                          </td>
                          <td>{cycle.totalDeposits || 0}</td>
                          <td>{parseFloat(cycle.totalAmount || 0).toLocaleString()} UGX</td>
                          <td>{cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : 'N/A'}</td>
                          <td>{cycle.endDate ? new Date(cycle.endDate).toLocaleDateString() : 'N/A'}</td>
                          <td>
                            <div className="btn-group" role="group">
                              <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => navigate(`/cycles/${cycle.id}`)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              <button
                                className="btn btn-sm btn-warning me-2"
                                onClick={() => navigate(`/cycles/${cycle.id}/edit`)}
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              {cycle.status === 'ACTIVE' && cycle.totalDeposits >= 31 && (
                                <button
                                  className="btn btn-sm btn-success me-2"
                                  onClick={() => handleCompleteCycle(cycle.id)}
                                >
                                  <i className="fas fa-check"></i>
                                </button>
                              )}
                              {user?.role === 'ADMIN' && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => {
                                    setCycleToDelete(cycle);
                                    setShowDeleteModal(true);
                                  }}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Delete Cycle"
        message={`Are you sure you want to delete cycle ${cycleToDelete?.id}? This action cannot be undone.`}
        onConfirm={handleDeleteCycle}
        onCancel={() => {
          setShowDeleteModal(false);
          setCycleToDelete(null);
        }}
      />
    </div>
  );
};

export default Cycles;
