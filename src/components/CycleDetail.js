import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { cycleService } from '../services/cycleService';
import { depositService } from '../services/depositService';
import { withdrawalService } from '../services/withdrawalService';
import LoadingSpinner from './common/LoadingSpinner';
import ConfirmModal from './common/ConfirmModal';

const CycleDetail = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [cycle, setCycle] = useState(null);
  const [deposits, setDeposits] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  useEffect(() => {
    fetchCycleDetails();
    fetchCycleDeposits();
    fetchCycleWithdrawals();
  }, [id]);

  const fetchCycleDetails = async () => {
    try {
      setLoading(true);
      const response = await cycleService.getCycleById(id);
      setCycle(response.data);
    } catch (error) {
      console.error('Error fetching cycle details:', error);
      alert('Error fetching cycle details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCycleDeposits = async () => {
    try {
      const response = await depositService.getDepositsByCycle(id);
      setDeposits(response.data);
    } catch (error) {
      console.error('Error fetching cycle deposits:', error);
    }
  };
    const getTotalAmount = () => {
        return deposits.reduce((sum, deposit) => sum + parseFloat(deposit.amount || 0), 0);
    };

  const fetchCycleWithdrawals = async () => {
    try {
      const response = await withdrawalService.getWithdrawalRequestsByCycle(id);
      setWithdrawals(response.data);
    } catch (error) {
      console.error('Error fetching cycle withdrawals:', error);
    }
  };

  const handleDeleteCycle = async () => {
    try {
      await cycleService.deleteCycle(id);
      alert('Cycle deleted successfully');
      navigate('/cycles');
    } catch (error) {
      console.error('Error deleting cycle:', error);
      alert('Error deleting cycle. Please try again.');
    }
  };

  const handleCompleteCycle = async () => {
    try {
      await cycleService.completeCycle(id);
      alert('Cycle completed successfully');
      fetchCycleDetails(); // Refresh cycle details
      setShowCompleteModal(false);
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

  // const canRequestWithdrawal = user?.role === 'COLLECTOR' &&
  //       !withdrawals.some(w => w.status === 'APPROVED');

  // const canDeposit =  user?.role === 'COLLECTOR' &&
  //     !cycle.some(c => c.status === 'CLOSED');

  const calculateProgress = () => {
    if (!cycle) return 0;
    const completed = parseInt(cycle.totalDeposits || 0, 10);
    const pct = (completed / 31) * 100;
    return Math.max(0, Math.min(pct, 100));
  };

  // const getRemainingAmount = () => {
  //   if (!cycle) return 0;
  //   return Math.max(cycle.targetAmount - cycle.totalAmount, 0);
  // };

  const getRemainingDeposits = () => {
    if (!cycle) return 31;
    return Math.max(31 - cycle.totalDeposits, 0);
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!cycle) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger">
          Cycle not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Cycle Details - #{cycle.id}</h1>
            <div className="btn-group">
              {user?.role === 'COLLECTOR' && (
                <button
                  className="btn btn-warning me-2"
                  onClick={() => navigate(`/cycles/${id}/edit`)}
                >
                  <i className="fas fa-edit me-2"></i>
                  Edit
                </button>
              )}
              {cycle.status === 'ACTIVE' && cycle.totalDeposits >= 31 && (
                <button
                  className="btn btn-success me-2"
                  onClick={() => setShowCompleteModal(true)}
                >
                  <i className="fas fa-check me-2"></i>
                  Complete Cycle
                </button>
              )}
              {user?.role === 'ADMIN' && (
                <button
                  className="btn btn-danger"
                  onClick={() => setShowDeleteModal(true)}
                >
                  <i className="fas fa-trash me-2"></i>
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Cycle Information */}
          <div className="row">
            <div className="col-md-8">
              <div className="card mb-4">
                <div className="card-header">
                  <h5>Cycle Information</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">

                        <div className="mb-3">
                            <strong>Cycle Code:</strong>
                            <p className="mb-1">{cycle.cycleCode}</p>
                        </div>
                      <div className="mb-3">
                        <strong>Client:</strong>
                        <p className="mb-1">{cycle.client?.firstName || 'Unknown Client'}</p>
                      </div>
                      <div className="mb-3">
                        <strong>Status:</strong>
                        <p>
                          <span className={`badge ${getStatusBadgeClass(cycle.status)}`}>
                            {cycle.status}
                          </span>
                        </p>
                      </div>

                        <div className="mb-3">
                            <strong>Daily target Deposit:</strong>
                            <p>{cycle.dailyTargetDeposit} UGX</p>
                        </div>


                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <strong>Start Date:</strong>
                        <p className="mb-1">{cycle.startDate ? new Date(cycle.startDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                      <div className="mb-3">
                        <strong>Created Date:</strong>
                        <p className="mb-1">{cycle.createdDate ? new Date(cycle.createdDate).toLocaleDateString() : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="col-md-4">
              <div className="card mb-4">
                <div className="card-header">
                  <h5>Progress Summary</h5>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <strong>Total Deposits:</strong>
                    <h4 className="text-primary">{cycle.totalDeposits || 0} / 31</h4>
                  </div>
                  <div className="mb-3">
                    <strong>Total Amount:</strong>
                    <h4 className="text-success">{parseFloat(getTotalAmount() || 0).toLocaleString()} UGX</h4>
                  </div>
                  <div className="mb-3">
                    <strong>Remaining Deposits:</strong>
                    <h4 className="text-info">{getRemainingDeposits()}</h4>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="mb-3">
                    <strong>Progress:</strong>
                    <div className="progress mt-2">
                      <div 
                        className="progress-bar" 
                        role="progressbar" 
                        style={{ width: `${calculateProgress()}%` }}
                        aria-valuenow={calculateProgress()} 
                        aria-valuemin="0" 
                        aria-valuemax="100"
                      >
                        {calculateProgress().toFixed(1)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Deposits */}
          <div className="row">
            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5>Deposits ({deposits.length})</h5>
                    {user?.role === 'COLLECTOR' && cycle.status !== 'CLOSED' && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => navigate('/deposits/new', { state: { cycleId: id } })}
                      >
                        <i className="fas fa-plus me-1"></i>
                        Add Deposit
                      </button>
                    )}
                </div>
                <div className="card-body">
                  {deposits.length === 0 ? (
                    <p className="text-muted">No deposits found for this cycle.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {deposits.slice(0, 5).map((deposit) => (
                            <tr key={deposit.id}>
                              <td>{new Date(deposit.depositDate).toLocaleDateString()}</td>
                              <td>{parseFloat(deposit.amount).toLocaleString()} UGX</td>
                              <td>
                                  {/*{canDeposit && (*/}
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => navigate(`/deposits/${deposit.id}`)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                                  {/*)}*/}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {deposits.length > 5 && (
                        <div className="text-center">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => navigate('/deposits', { state: { cycleFilter: id } })}
                          >
                            View All Deposits
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>



            {
            /* withdrawals section*/
            }

            <div className="col-md-6">
              <div className="card mb-4">
                <div className="card-header d-flex justify-content-between align-items-center">
                  <h5>Withdrawal Requests ({withdrawals.length})</h5>
                    {/*{canRequestWithdrawal && (*/}
                        {user?.role === 'COLLECTOR' &&
                          cycle.status !== 'CLOSED' &&
                          !withdrawals.some(w => w.status === 'PENDING') && (
                            <button
                              disabled={cycle.totalDeposits <= 0}
                              className="btn btn-sm btn-warning"
                              onClick={() => navigate('/withdrawals/new', { state: { cycleId: id } })}
                            >
                              <i className="fas fa-plus me-1"></i>
                              Request Withdrawal
                            </button>
                        )}
                    {/*)}*/}

                </div>
                <div className="card-body">
                  {withdrawals.length === 0 ? (
                    <p className="text-muted">No withdrawal requests found for this cycle.</p>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-sm">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawals.slice(0, 5).map((withdrawal) => (
                            <tr key={withdrawal.id}>
                              <td>{new Date(withdrawal.requestDate).toLocaleDateString()}</td>
                              <td>{parseFloat(withdrawal.requestedAmount).toLocaleString()} UGX</td>
                              <td>
                                <span className={`badge ${
                                  withdrawal.status === 'APPROVED' ? 'bg-success' : 
                                  withdrawal.status === 'REJECTED' ? 'bg-danger' : 'bg-warning'
                                }`}>
                                  {withdrawal.status}
                                </span>
                              </td>
                              <td>
                                <button
                                  className="btn btn-sm btn-info"
                                  onClick={() => navigate(`/withdrawals/${withdrawal.id}`)}
                                >
                                  <i className="fas fa-eye"></i>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {withdrawals.length > 5 && (
                        <div className="text-center">
                          <button
                            className="btn btn-sm btn-outline-warning"
                            onClick={() => navigate('/withdrawals', { state: { cycleFilter: id } })}
                          >
                            View All Withdrawals
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Back Button */}
          <div className="mt-3">
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/cycles')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Cycles
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        show={showDeleteModal}
        title="Delete Cycle"
        message={`Are you sure you want to delete cycle #${cycle.id}? This action cannot be undone and will also delete all associated deposits and withdrawal requests.`}
        onConfirm={handleDeleteCycle}
        onCancel={() => setShowDeleteModal(false)}
        confirmButtonClass="btn-danger"
      />

      {/* Complete Confirmation Modal */}
      <ConfirmModal
        show={showCompleteModal}
        title="Complete Cycle"
        message={`Are you sure you want to mark cycle #${cycle.id} as completed? This action cannot be undone.`}
        onConfirm={handleCompleteCycle}
        onCancel={() => setShowCompleteModal(false)}
        confirmButtonClass="btn-success"
      />
    </div>
  );
};

export default CycleDetail;
