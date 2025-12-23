import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { withdrawalService } from '../services/withdrawalService';
import { useAuth } from '../contexts/AuthContext';
import Pagination from './common/Pagination';

const Withdrawals = () => {
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchWithdrawals(page, size);
  }, [filterStatus, user, page, size]);

  const fetchWithdrawals = async (p = 0, s = 10) => {
    try {
      setLoading(true);
      let response;

      const setFromResponse = (data) => {
        if (Array.isArray(data)) {
          setWithdrawals(data.slice(p * s, p * s + s));
          setTotalElements(data.length);
          setTotalPages(Math.max(1, Math.ceil(data.length / s)));
        } else {
          setWithdrawals(data.content || []);
          setTotalElements(data.totalElements || 0);
          setTotalPages(data.totalPages || 0);
          if (typeof data.number === 'number') setPage(data.number);
        }
      };
      
      if (user?.role === 'COLLECTOR') {
        switch (filterStatus) {
          case 'PENDING':
            response = await withdrawalService.getMyPendingWithdrawalRequests(p, s);
            break;
          case 'APPROVED':
            response = await withdrawalService.getMyApprovedWithdrawalRequests(p, s);
            break;
          default:
            response = await withdrawalService.getMyWithdrawalRequests(p, s);
        }
      } else {
        switch (filterStatus) {
          case 'PENDING':
            response = await withdrawalService.getPendingWithdrawalRequests(p, s);
            break;
          case 'APPROVED':
            response = await withdrawalService.getApprovedWithdrawalRequests(p, s);
            break;
          default:
            response = await withdrawalService.getAllWithdrawalRequests(p, s);
        }
      }

      setFromResponse(response.data);
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id,requestedAmount) => {
      try {
        await withdrawalService.approveWithdrawalRequest(id, {
          approvedAmount: parseFloat(requestedAmount),
        });
        fetchWithdrawals();
        alert('Withdrawal request approved successfully');
      } catch (error) {
        console.error('Error approving withdrawal:', error);
        alert('Error approving withdrawal request');
      }

  };

  const handleReject = async (id) => {
    const rejectionReason = prompt('Enter rejection reason:');
    
    if (rejectionReason) {
      try {
        await withdrawalService.rejectWithdrawalRequest(id, {
          rejectionReason
        });
        fetchWithdrawals(); // Refresh the list
        alert('Withdrawal request rejected successfully');
      } catch (error) {
        console.error('Error rejecting withdrawal:', error);
        alert('Error rejecting withdrawal request');
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this withdrawal request?')) {
      try {
        await withdrawalService.deleteWithdrawalRequest(id);
        fetchWithdrawals(); // Refresh the list
      } catch (error) {
        console.error('Error deleting withdrawal:', error);
        alert('Error deleting withdrawal request');
      }
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING': return 'bg-warning';
      case 'APPROVED': return 'bg-success';
      case 'REJECTED': return 'bg-danger';
      default: return 'bg-secondary';
    }
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Withdrawal Management</h1>
            {/* {user?.role === 'COLLECTOR' && (
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/withdrawals/new')}
              >
                <i className="fas fa-plus me-2"></i>
                New Withdrawal Request
              </button>
            )} */}
          </div>

          <div className="card">
            <div className="card-header">
              <div className="row">
                <div className="col-md-6">
                  <h5>Withdrawal Requests</h5>
                </div>
                <div className="col-md-6">
                  <select
                    className="form-select"
                    value={filterStatus}
                    onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                  >
                    <option value="ALL">All Status</option>
                    <option value="PENDING">Pending</option>
                    <option value="APPROVED">Approved</option>
                  </select>
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
                        <th>Cycle ID</th>
                        <th>Client</th>
                        <th>Collector</th>
                        <th>Requested Amount</th>
                        <th>Request Date</th>
                        <th>Status</th>
                        <th>Reason</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center">
                            No withdrawal requests found
                          </td>
                        </tr>
                      ) : (
                        withdrawals.map((withdrawal) => (
                          <tr key={withdrawal.id}>
                            <td>{withdrawal.id}</td>
                            <td>{withdrawal.cycleId || withdrawal.cycle?.id}</td>
                            <td>{withdrawal.clientName || `${withdrawal.client?.firstName || ''} ${withdrawal.client?.lastName || ''}`.trim()}</td>
                            <td>{withdrawal.collector?.username || withdrawal.collector?.email || '-'}</td>
                            <td>{parseFloat(withdrawal.requestedAmount).toLocaleString()} UGX</td>
                            <td>{new Date(withdrawal.requestDate).toLocaleDateString()}</td>
                            <td>
                              <span className={`badge ${getStatusBadgeClass(withdrawal.status)}`}>
                                {withdrawal.status}
                              </span>
                            </td>
                            <td>{withdrawal.reason}</td>
                            <td>
                              <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => navigate(`/withdrawals/${withdrawal.id}`)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              
                              {user?.role === 'ADMIN' && withdrawal.status === 'PENDING' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-success me-2"
                                    onClick={() => handleApprove(withdrawal.id,withdrawal.requestedAmount)}
                                  >
                                    <i className="fas fa-check"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => handleReject(withdrawal.id)}
                                  >
                                    <i className="fas fa-times"></i>
                                  </button>
                                </>
                              )}
                              
                              {(user?.role === 'ADMIN' || 
                                (user?.role === 'COLLECTOR' && withdrawal.status === 'PENDING')) && (
                                <button
                                  className="btn btn-sm btn-danger"
                                  onClick={() => handleDelete(withdrawal.id)}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              )}
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

          {/* Pagination Controls */}
          <div className="mt-3 d-flex justify-content-end">
            <Pagination
              page={page}
              size={size}
              totalElements={totalElements}
              totalPages={totalPages}
              onPageChange={(newPage) => setPage(newPage)}
              onSizeChange={(newSize) => { setSize(newSize); setPage(0); }}
            />
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

export default Withdrawals;
