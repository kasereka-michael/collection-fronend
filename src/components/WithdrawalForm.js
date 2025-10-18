import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { withdrawalService } from '../services/withdrawalService';
import { cycleService } from '../services/cycleService';

const WithdrawalForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    cycleId: '',
    requestedAmount: '',
    requestDate: new Date().toISOString().split('T')[0],
    reason: ''
  });
  
  const [cycles, setCycles] = useState([]);
  const [selectedCycle, setSelectedCycle] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchCycles();
    if (isEdit) {
      fetchWithdrawal();
    }
  }, [id, isEdit]);

  // Preselect cycle when navigated from CycleDetail and prefill amount
  useEffect(() => {
    if (isEdit) return;
    const stateCycleId = location.state?.cycleId;
    if (stateCycleId) {
      setFormData(prev => ({ ...prev, cycleId: String(stateCycleId) }));
    }
  }, [location.state, isEdit]);

  // When a cycle is selected, auto-compute requested amount = totalAmount - dailyTargetDeposit
  useEffect(() => {
    if (isEdit) return; // don't override existing amount during edit
    const selectedId = formData.cycleId;
    if (!selectedId) return;

    const computePrefill = async () => {
      try {
        const resp = await cycleService.getCycleById(selectedId);
        const cycle = resp.data;
        setSelectedCycle(cycle);
        // Ensure selected cycle is present in dropdown options
        setCycles(prev => prev.some(c => String(c.id) === String(cycle.id)) ? prev : [...prev, cycle]);
        const totalAmount = parseFloat(cycle.totalAmount || 0);
        const dailyTarget = parseFloat(cycle.dailyTargetDeposit || 0);
        const computed = Math.max(totalAmount - dailyTarget, 0);
        setFormData(prev => ({ ...prev, requestedAmount: computed.toFixed(2) }));
      } catch (err) {
        console.error('Error computing prefill amount:', err);
      }
    };

    computePrefill();
  }, [formData.cycleId, isEdit]);

  const fetchCycles = async () => {
    try {
      const response = await cycleService.getActiveCycles();
      let list = response.data || [];

      // Ensure the preselected cycle is in the list (from navigation state)
      const stateCycleId = location.state?.cycleId;
      if (stateCycleId && !list.some(c => String(c.id) === String(stateCycleId))) {
        try {
          const resp = await cycleService.getCycleById(stateCycleId);
          if (resp?.data) {
            list = [...list, resp.data];
          }
        } catch (e) {
          console.warn('Could not load preselected cycle for dropdown:', e);
        }
      }

      setCycles(list);
    } catch (error) {
      console.error('Error fetching cycles:', error);
    }
  };

  const fetchWithdrawal = async () => {
    try {
      setLoading(true);
      const response = await withdrawalService.getWithdrawalRequestById(id);
      setFormData({
        ...response.data,
        requestDate: response.data.requestDate.split('T')[0] // Format date for input
      });

      try {
        const cid = response.data.cycle?.id ?? response.data.cycleId;
        if (cid) {
          const cRes = await cycleService.getCycleById(cid);
          setSelectedCycle(cRes.data);
          setCycles(prev => prev.some(c => String(c.id) === String(cRes.data.id)) ? prev : [...prev, cRes.data]);
        }
      } catch (e) {
        console.error('Error loading selected cycle for edit:', e);
      }
    } catch (error) {
      console.error('Error fetching withdrawal:', error);
      alert('Error loading withdrawal data');
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
    
    if (!formData.requestedAmount || parseFloat(formData.requestedAmount) <= 0) {
      newErrors.requestedAmount = 'Requested amount must be greater than 0';
    }
    
    if (!formData.requestDate) {
      newErrors.requestDate = 'Request date is required';
    }

    // Reason is optional

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
      
      const submitData = {
        ...formData,
        requestedAmount: parseFloat(formData.requestedAmount),
        cycleId: parseInt(formData.cycleId)
      };
      
      if (isEdit) {
        await withdrawalService.updateWithdrawalRequest(id, submitData);
        alert('Withdrawal request updated successfully!');
      } else {
        await withdrawalService.createWithdrawalRequest(submitData);
        alert('Withdrawal request submitted successfully!');
      }
      
      navigate('/withdrawals');
    } catch (error) {
      console.error('Error saving withdrawal:', error);
      alert(`Error ${isEdit ? 'updating' : 'submitting'} withdrawal request: ${error.response?.data?.message || error.message}`);
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
            <h1>{isEdit ? 'Edit Withdrawal Request' : 'New Withdrawal Request'}</h1>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/withdrawals')}
            >
              <i className="fas fa-arrow-left me-2"></i>
              Back to Withdrawals
            </button>
          </div>

          <div className="card">
            <div className="card-header">
              <h5>{isEdit ? 'Update Withdrawal Request' : 'Withdrawal Request Information'}</h5>
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
                      disabled={loading}
                    >
                      <option value="">Select a cycle</option>
                      {cycles.map(cycle => (
                        <option key={cycle.id} value={cycle.id}>
                          Cycle {cycle.id} - {cycle.clientName} ({cycle.status})
                        </option>
                      ))}
                    </select>
                    {errors.cycleId && <div className="invalid-feedback">{errors.cycleId}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label className="form-label">Cycle Info</label>
                    <div className="card card-body bg-light">
                      <div><strong>Owner:</strong> {selectedCycle ? (selectedCycle.clientName || `${selectedCycle.client?.firstName || ''} ${selectedCycle.client?.lastName || ''}`.trim()) : '-'}</div>
                      <div><strong>Status:</strong> {selectedCycle?.status || '-'}</div>
                      <div><strong>Cycle Code:</strong> {selectedCycle?.cycleCode || '-'}</div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="requestedAmount" className="form-label">Requested Amount (UGX) *</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className={`form-control ${errors.requestedAmount ? 'is-invalid' : ''}`}
                      id="requestedAmount"
                      name="requestedAmount"
                      value={formData.requestedAmount}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.requestedAmount && <div className="invalid-feedback">{errors.requestedAmount}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="requestDate" className="form-label">Request Date *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.requestDate ? 'is-invalid' : ''}`}
                      id="requestDate"
                      name="requestDate"
                      value={formData.requestDate}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    {errors.requestDate && <div className="invalid-feedback">{errors.requestDate}</div>}
                  </div>

                  <div className="col-12 mb-3">
                    <label htmlFor="reason" className="form-label">Reason for Withdrawal</label>
                    <textarea
                      className={`form-control ${errors.reason ? 'is-invalid' : ''}`}
                      id="reason"
                      name="reason"
                      rows="4"
                      value={formData.reason}
                      onChange={handleChange}
                      disabled={loading}
                      placeholder="Please provide a detailed reason for this withdrawal request..."
                    ></textarea>
                    {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
                  </div>
                </div>

                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Note:</strong> Your withdrawal request will be reviewed by an administrator. 
                  You will be notified once it has been approved or rejected.
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => navigate('/withdrawals')}
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
                        {isEdit ? 'Updating...' : 'Submitting...'}
                      </>
                    ) : (
                      <>
                        <i className={`fas ${isEdit ? 'fa-save' : 'fa-paper-plane'} me-2`}></i>
                        {isEdit ? 'Update Request' : 'Submit Request'}
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

export default WithdrawalForm;
