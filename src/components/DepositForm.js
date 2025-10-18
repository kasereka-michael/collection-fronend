import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { depositService } from '../services/depositService';
import { cycleService } from '../services/cycleService';
import { useAuth } from '../contexts/AuthContext';

const DepositForm = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  
  const [formData, setFormData] = useState({
    cycleId: '',
    amount: '',
    depositDate: new Date().toISOString().split('T')[0],
    notes: ''
  });
  
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Redirect ADMIN users away from deposit form
    if (user && user.role === 'ADMIN') {
      alert('Access denied: Admins cannot create or edit deposits.');
      navigate('/deposits');
      return;
    }

    fetchCycles();
    if (isEdit) {
      fetchDeposit();
    } else {
      // Pre-select cycle if coming from cycle detail page
      const cycleId = location.state?.cycleId;
      if (cycleId) {
        setFormData(prev => ({
          ...prev,
          cycleId: cycleId.toString()
        }));
      }
    }
  }, [id, isEdit, location.state, user, navigate]);

  const fetchCycles = async () => {
    try {
      const response = await cycleService.getActiveCycles();
      setCycles(response.data);
    } catch (error) {
      console.error('Error fetching cycles:', error);
    }
  };

  const fetchDeposit = async () => {
    try {
      setLoading(true);
      const response = await depositService.getDepositById(id);
      setFormData({
        ...response.data,
        depositDate: response.data.depositDate.split('T')[0] // Format date for input
      });
    } catch (error) {
      console.error('Error fetching deposit:', error);
      alert('Error loading deposit data');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.cycleId) {
      newErrors.cycleId = 'Cycle is required';
    }
    
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }
    
    if (!formData.depositDate) {
      newErrors.depositDate = 'Deposit date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      // Find the selected cycle to get the clientId
      const selectedCycle = cycles.find(cycle => cycle.id === parseInt(formData.cycleId));
      
      if (!selectedCycle) {
        alert('Selected cycle not found. Please refresh and try again.');
        return;
      }
      
      if (!selectedCycle.clientId) {
        alert('Selected cycle does not have a valid client ID. Please contact support.');
        return;
      }
      
      const submitData = {
        clientId: selectedCycle.clientId,
        cycleId: parseInt(formData.cycleId),
        amount: parseFloat(formData.amount),
        depositDate: formData.depositDate,
        notes: formData.notes
      };
      
      if (isEdit) {
        await depositService.updateDeposit(id, submitData);
        alert('Deposit updated successfully!');
      } else {
        await depositService.createDeposit(submitData);
        alert('Deposit recorded successfully!');
      }
      
      navigate('/deposits');
    } catch (error) {
      console.error('Error saving deposit:', error);
      alert(`Error ${isEdit ? 'updating' : 'recording'} deposit: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading && isEdit) {
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

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>{isEdit ? 'Edit Deposit' : 'Record New Deposit'}</h1>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/deposits')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Deposits
            </button>
          </div>

          {/* Show info message if cycle was pre-selected */}
          {!isEdit && location.state?.cycleId && (
            <div className="alert alert-info mb-3">
              <i className="fas fa-info-circle me-2"></i>
              Cycle has been pre-selected from the cycle details page.
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h5>{isEdit ? 'Update Deposit Information' : 'Deposit Information'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="cycleId" className="form-label">Cycle *</label>
                    <select
                      className={`form-select ${errors.cycleId ? 'is-invalid' : ''}`}
                      id="cycleId"
                      name="cycleId"
                      value={formData.cycleId}
                      onChange={handleChange}
                      disabled={true}
                    >
                      <option value="">Select a cycle</option>
                      {cycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>
                          Cycle {cycle.id} - {cycle.clientName} - {cycle.cycleCode} - ({cycle.status})
                        </option>
                      ))}
                    </select>
                    {errors.cycleId && <div className="invalid-feedback">{errors.cycleId}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="amount" className="form-label">Amount (UGX) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="depositDate" className="form-label">Deposit Date *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.depositDate ? 'is-invalid' : ''}`}
                      id="depositDate"
                      name="depositDate"
                      value={formData.depositDate}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.depositDate && <div className="invalid-feedback">{errors.depositDate}</div>}
                  </div>

                  <div className="col-12 mb-3">
                    <label htmlFor="notes" className="form-label">Notes</label>
                    <textarea
                      className="form-control"
                      id="notes"
                      name="notes"
                      rows="3"
                      value={formData.notes}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Optional notes about this deposit..."
                    ></textarea>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/deposits')}
                    disabled={loading}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEdit ? 'Updating...' : 'Recording...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${isEdit ? 'fa-save' : 'fa-plus'} me-2`}></i>
                        {isEdit ? 'Update Deposit' : 'Record Deposit'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepositForm;
