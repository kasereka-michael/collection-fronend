import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { depositService } from '../services/depositService';

const DepositDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [deposit, setDeposit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeposit = async () => {
      try {
        setLoading(true);
        const response = await depositService.getDepositById(id);
        setDeposit(response.data);
      } catch (e) {
        console.error('Failed to load deposit:', e);
        setError('Failed to load deposit details');
      } finally {
        setLoading(false);
      }
    };

    fetchDeposit();
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

  if (!deposit) return null;

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h1>Deposit #{deposit.id}</h1>
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
                  <strong>Client</strong>
                  <div>{deposit.clientName || '—'}</div>
                </div>
                <div className="col-md-6">
                  <strong>Cycle</strong>
                  <div>{deposit.cycleId}</div>
                </div>
                <div className="col-md-6">
                  <strong>Amount</strong>
                  <div>{parseFloat(deposit.amount || 0).toLocaleString()} UGX</div>
                </div>
                <div className="col-md-6">
                  <strong>Date</strong>
                  <div>{deposit.depositDate ? new Date(deposit.depositDate).toLocaleString() : '—'}</div>
                </div>
                <div className="col-12">
                  <strong>Notes</strong>
                  <div>{deposit.notes || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 d-flex gap-2">
            <button className="btn btn-primary" onClick={() => navigate(`/deposits/${deposit.id}/edit`)}>
              <i className="fas fa-edit me-2"></i>
              Edit
            </button>
            <button className="btn btn-outline-primary" onClick={() => navigate(`/cycles/${deposit.cycleId}`)}>
              <i className="fas fa-sync me-2"></i>
              View Cycle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositDetail;
