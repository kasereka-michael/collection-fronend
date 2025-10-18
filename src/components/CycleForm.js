import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { cycleService } from '../services/cycleService';
import { clientService } from '../services/clientService';
import LoadingSpinner from './common/LoadingSpinner';
import { useAuth } from '../contexts/AuthContext';

const CycleForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  const isEdit = Boolean(id);
  const clientIdFromState = location.state?.clientId;

  const [formData, setFormData] = useState({
    clientId: clientIdFromState || '',
    dailyTarget: '',
    startDate: '',
    endDate: ''
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const { user } = useAuth();

  useEffect(() => {
    // Redirect ADMIN users away from cycle form
    if (user && user.role === 'ADMIN') {
      alert('Access denied: Admins cannot create or edit cycles.');
      navigate('/cycles');
      return;
    }

    fetchClients();
    if (isEdit) {
      fetchCycle();
    }
  }, [id, isEdit, user, navigate]);

  const fetchClients = async () => {
    try {
      let response;
      if (user?.role === 'COLLECTOR') {
        response = await clientService.getClientsByCollector(user.id);
      } else {
        response = await clientService.getAllClients();
      }
      setClients(response.data);
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  const fetchCycle = async () => {
    try {
      setLoading(true);
      const response = await cycleService.getCycleById(id);
      const cycle = response.data;
      setFormData({
        clientId: cycle.client?.id || '',
        dailyTarget: cycle.dailyTargetDeposit || '',
        startDate: cycle.startDate || '',
        endDate: cycle.endDate || ''
      });
    } catch (error) {
      console.error('Error fetching cycle:', error);
      alert('Error fetching cycle details. Please try again.');
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

    if (!formData.clientId) {
      newErrors.clientId = 'Client is required';
    }

    if (!formData.dailyTarget || parseFloat(formData.dailyTarget) <= 0) {
      newErrors.dailyTarget = 'Daily target must be greater than 0';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = 'End date must be after start date';
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
      
      const cycleData = {
        clientId: parseInt(formData.clientId),
        dailyTarget: parseFloat(formData.dailyTarget),
        startDate: formData.startDate,
      };

      if (isEdit) {
        await cycleService.updateCycle(id, cycleData);
        alert('Cycle updated successfully');
      } else {
        await cycleService.createCycle(cycleData);
        alert('Cycle created successfully');
      }
      
      navigate('/cycles');
    } catch (error) {
      console.error('Error saving cycle:', error);
      alert('Error saving cycle. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getClientName = (clientId) => {
    const client = clients.find(c => c.id === parseInt(clientId));
    return client ? client.name : '';
  };

  if (loading && isEdit) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                {isEdit ? 'Edit Cycle' : 'Create New Cycle'}
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label htmlFor="clientId" className="form-label">Client *</label>
                    <select
                      className={`form-select ${errors.clientId ? 'is-invalid' : ''}`}
                      id="clientId"
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleChange}
                      disabled={true} // To avoid user to select
                    >
                      <option value="">Select a client</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.firstName} - {client.personalCode}
                        </option>
                      ))}
                    </select>
                    {errors.clientId && <div className="invalid-feedback">{errors.clientId}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="dailyTarget" className="form-label">Daily Target Amount (UGX) *</label>
                    <input
                      type="number"
                      className={`form-control ${errors.dailyTarget ? 'is-invalid' : ''}`}
                      id="dailyTarget"
                      name="dailyTarget"
                      value={formData.dailyTarget}
                      onChange={handleChange}
                      placeholder="Enter daily target amount"
                      min="0"
                      step="0.01"
                    />
                    {errors.dailyTarget && <div className="invalid-feedback">{errors.dailyTarget}</div>}
                  </div>

                  <div className="col-md-6 mb-3">
                    <label htmlFor="startDate" className="form-label">Start Date *</label>
                    <input
                      type="date"
                      className={`form-control ${errors.startDate ? 'is-invalid' : ''}`}
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleChange}
                    />
                    {errors.startDate && <div className="invalid-feedback">{errors.startDate}</div>}
                  </div>

                </div>

                {/* Summary Section */}
                {formData.dailyTarget && (
                  <div className="row">
                    <div className="col-12">
                      <div className="alert alert-info">
                        <h6>Cycle Summary:</h6>
                        <p className="mb-1">
                          <strong>Client:</strong> {getClientName(formData.clientId)}
                        </p>
                        <p className="mb-1">
                          <strong>Daily Target:</strong> {parseFloat(formData.dailyTarget).toLocaleString()} UGX
                        </p>
                        <p className="mb-0">
                          <strong>Expected Duration:</strong> 31 days (cycle closes after 31 deposits)
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="d-flex gap-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEdit ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>
                        {isEdit ? 'Update Cycle' : 'Create Cycle'}
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    onClick={() => navigate('/cycles')}
                    disabled={loading}
                  >
                    <i className="fas fa-times me-2"></i>
                    Cancel
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

export default CycleForm;
