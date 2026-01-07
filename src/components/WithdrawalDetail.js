import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { withdrawalService } from '../services/withdrawalService';

const WithdrawalDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [withdrawal, setWithdrawal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWithdrawal = async () => {
      try {
        setLoading(true);
        const response = await withdrawalService.getWithdrawalRequestById(id);
        setWithdrawal(response.data);
      } catch (e) {
        console.error('Failed to load withdrawal:', e);
        setError('Failed to load withdrawal details');
      } finally {
        setLoading(false);
      }
    };

    fetchWithdrawal();
  }, [id]);


    if (loading) {
    return (
      <div className="loading-spinner">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="alert alert-danger mt-3">{error}</div>
        <button className="btn btn-secondary" onClick={() => navigate(-1)}>
          <i className="fas fa-arrow-left me-2"></i>
          Back
        </button>
      </div>
    );
  }

  if (!withdrawal) return null;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Withdrawal #{withdrawal.id}</h1>
            <div className="d-flex gap-2">
              <button className="btn btn-outline-secondary" onClick={() => navigate(-1)}>
                <i className="fas fa-arrow-left me-2"></i>
                Back
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <strong>Cycle</strong>
                  <div>{withdrawal.cycle.cycleId}</div>
                </div>
                <div className="col-md-6">
                  <strong>Status</strong>
                  <div>{withdrawal.status}</div>
                </div>
                <div className="col-md-6">
                  <strong>Requested Amount</strong>
                  <div>{parseFloat(withdrawal.requestedAmount || 0).toLocaleString()} UGX</div>
                </div>
                <div className="col-md-6">
                  <strong>Approved Amount</strong>
                  <div>{parseFloat(withdrawal.requestedAmount || 0).toLocaleString()} UGX</div>
                </div>
                <div className="col-md-6">
                  <strong>Request Date</strong>
                  <div>{withdrawal.requestDate ? new Date(withdrawal.requestDate).toLocaleString() : '—'}</div>
                </div>
                {withdrawal.approvalDate && (
                  <div className="col-md-6">
                    <strong>Approval Date</strong>
                    <div>{new Date(withdrawal.approvalDate).toLocaleString()}</div>
                  </div>
                )}
                <div className="col-12">
                  <strong>Reason</strong>
                  <div>{withdrawal.reason || '—'}</div>
                </div>
                {withdrawal.approvalNotes && (
                  <div className="col-12">
                    <strong>Approval Notes</strong>
                    <div>{withdrawal.approvalNotes}</div>
                  </div>
                )}
                {withdrawal.rejectionReason && (
                  <div className="col-12">
                    <strong>Rejection Reason</strong>
                    <div>{withdrawal.rejectionReason}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={() => navigate(`/cycles/${withdrawal.cycleId}`)}>
              <i className="fas fa-sync me-2"></i>
              View Cycle
            </button>
              {/*{(user?.role === 'COLLECTOR' || user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT') &&*/}
              {/*    !withdrawal.isApproved && (*/}
                      <button
                          className="btn btn-primary"
                          onClick={() => navigate(`/withdrawals/${withdrawal.id}/edit`)}
                      >
                          <i className="fas fa-edit me-2"></i>
                          Edit
                      </button>
                  {/*)}*/}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WithdrawalDetail;
