import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { depositService } from '../services/depositService';
import { cycleService } from '../services/cycleService';
import { useAuth } from '../contexts/AuthContext';
import Pagination from './common/Pagination';

const Deposits = () => {
  const [deposits, setDeposits] = useState([]);
  const [cycles, setCycles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCycle, setFilterCycle] = useState('ALL');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    fetchCycles();
  }, []);

  useEffect(() => {
    // when filters change, ensure we fetch appropriate paged data
    if (filterCycle !== 'ALL') {
      fetchDepositsByCycle(page, size);
    } else if (dateRange.startDate && dateRange.endDate) {
      fetchDepositsByDateRange(page, size);
    } else {
      fetchDeposits(page, size);
    }
  }, [filterCycle, page, size, dateRange.startDate, dateRange.endDate]);

  const syncPageInfo = (data, fallbackLength = 0, p = 0, s = 10) => {
    if (Array.isArray(data)) {
      // Non-paginated response
      setTotalElements(fallbackLength || data.length);
      // Compute pages from current page size
      const pages = Math.max(1, Math.ceil((fallbackLength || data.length) / s));
      setTotalPages(pages);
    } else {
      setTotalElements(data.totalElements ?? 0);
      setTotalPages(data.totalPages ?? 0);
      // Keep our page state aligned with backend's page number
      if (typeof data.number === 'number') setPage(data.number);
    }
  };

  const fetchDeposits = async (p = 0, s = 10) => {
    try {
      setLoading(true);
      const response = await depositService.getAllDeposits(p, s);
      const data = response.data;
      if (Array.isArray(data)) {
        setDeposits(data.slice(p * s, p * s + s));
        syncPageInfo(data, data.length, p, s);
      } else {
        setDeposits(data.content || []);
        syncPageInfo(data, 0, p, s);
      }
    } catch (error) {
      console.error('Error fetching deposits:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCycles = async () => {
    try {
      const response = await cycleService.getAllCycles();
      setCycles(response.data);
    } catch (error) {
      console.error('Error fetching cycles:', error);
    }
  };

  const fetchDepositsByCycle = async (p = 0, s = 10) => {
    try {
      setLoading(true);
      const response = await depositService.getDepositsByCycle(filterCycle, p, s);
      const data = response.data;
      if (Array.isArray(data)) {
        setDeposits(data.slice(p * s, p * s + s));
        syncPageInfo(data, data.length, p, s);
      } else {
        setDeposits(data.content || []);
        syncPageInfo(data, 0, p, s);
      }
    } catch (error) {
      console.error('Error fetching deposits by cycle:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDepositsByDateRange = async (p = 0, s = 10) => {
    try {
      setLoading(true);
      const response = await depositService.getDepositsByDateRange(
        dateRange.startDate,
        dateRange.endDate,
        p,
        s
      );
      const data = response.data;
      if (Array.isArray(data)) {
        setDeposits(data.slice(p * s, p * s + s));
        syncPageInfo(data, data.length, p, s);
      } else {
        setDeposits(data.content || []);
        syncPageInfo(data, 0, p, s);
      }
    } catch (error) {
      console.error('Error fetching deposits by date range:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateRangeFilter = async () => {
    if (dateRange.startDate && dateRange.endDate) {
      setPage(0); // reset to first page when applying filter
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this deposit?')) {
      try {
        await depositService.deleteDeposit(id);
        fetchDeposits(page, size); // Refresh the list
      } catch (error) {
        console.error('Error deleting deposit:', error);
        alert('Error deleting deposit');
      }
    }
  };

  const getTotalAmount = () => {
    const list = Array.isArray(deposits) ? deposits : [];
    return list.reduce((sum, deposit) => sum + parseFloat(deposit.amount || 0), 0);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Deposit Management</h1>
            {/* <button 
            style={user.role ==='COLLECTOR' ? {display: 'block'} : {display: 'none'}}
              className="btn btn-primary"
              onClick={() => navigate('/deposits/new')}
            >
              <i className="fas fa-plus me-2"></i>
              Record New Deposit
            </button> */}
          </div>

          {/* Summary Card */}
          <div className="row mb-4">
            <div className="col-md-4">
              <div className="card bg-success text-white">
                <div className="card-body">
                  <h4>{deposits.length}</h4>
                  <p>Total Deposits</p>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card bg-info text-white">
                <div className="card-body">
                  <h4>{getTotalAmount().toLocaleString()} UGX</h4>
                  <p>Total Amount</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="row">
                <div className="col-md-3">
                  <h5>All Deposits</h5>
                </div>
                <div className="col-md-3">
                  <select
                    className="form-select"
                    value={filterCycle}
                    onChange={(e) => {
                      setFilterCycle(e.target.value);
                      setPage(0); // reset to first page when filter changes
                    }}
                  >
                    <option value="ALL">All Cycles</option>
                    {cycles.map(cycle => (
                      <option key={cycle.id} value={cycle.id}>
                        Cycle {cycle.id} - {cycle.clientName}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <input
                    type="date"
                    className="form-control"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange({...dateRange, startDate: e.target.value})}
                  />
                </div>
                <div className="col-md-3">
                  <div className="input-group">
                    <input
                      type="date"
                      className="form-control"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({...dateRange, endDate: e.target.value})}
                    />
                    <button 
                      className="btn btn-outline-secondary" 
                      onClick={() => {
                        handleDateRangeFilter();
                      }}
                    >
                      Filter
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
                        <th>Client</th>
                        {user.role === 'ADMIN' && <th>Collector</th>}
                        <th>Cycle</th>
                        <th>Amount (UGX)</th>
                        <th>Date</th>
                        <th>Notes</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {deposits.length === 0 ? (
                        <tr>
                          <td colSpan={user.role === 'ADMIN' ? 8 : 7} className="text-center">
                            No deposits found
                          </td>
                        </tr>
                      ) : (
                        deposits.map((deposit) => (
                          <tr key={deposit.id}>
                            <td>{deposit.id}</td>
                              <td>{deposit.clientName || `${deposit.client?.firstName ?? ''} ${deposit.client?.lastName ?? ''}`.trim() || '—'}</td>
                            {user.role === 'ADMIN' && (
                              <td>{deposit.collectorName || deposit.collector?.username || deposit.collector?.firstName || deposit.collectorId || (deposit.client?.collector?.username) || 'N/A'}</td>
                            )}
                            <td>{deposit.cycleCode || `Cycle ${deposit.cycleId ?? deposit.cycle?.id ?? ''}`}</td>
                            <td>{parseFloat(deposit.amount).toLocaleString()}</td>
                            <td>{deposit.depositDate ? new Date(deposit.depositDate).toLocaleDateString() : (deposit.createdDate ? new Date(deposit.createdDate).toLocaleDateString() : '—')}</td>
                            <td>{deposit.notes || 'N/A'}</td>
                            <td style={{display:'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                              <button
                                className="btn btn-sm btn-info me-2"
                                onClick={() => navigate(`/deposits/${deposit.id}`)}
                              >
                                <i className="fas fa-eye"></i>
                              </button>
                              {user.role !== 'COLLECTOR' && (
                                <>
                                  <button
                                    className="btn btn-sm btn-warning me-2"
                                    onClick={() => navigate(`/deposits/${deposit.id}/edit`)}
                                  >
                                    <i className="fas fa-edit"></i>
                                  </button>
                                  <button
                                    className="btn btn-sm btn-danger"
                                    onClick={() => handleDelete(deposit.id)}
                                  >
                                    <i className="fas fa-trash"></i>
                                  </button>
                                </>
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
              onSizeChange={(newSize) => {
                setSize(newSize);
                setPage(0);
              }}
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

export default Deposits;
