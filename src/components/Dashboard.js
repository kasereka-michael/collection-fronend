import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { clientService } from '../services/clientService';
import { cycleService } from '../services/cycleService';
import { depositService } from '../services/depositService';
import { commissionService } from '../services/commissionService';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCycles: 0,
    todaysCollections: 0,
    totalRegistrationFees: 0,
    totalCommissionFees: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        let totalClients = 0;
        let activeCycles = 0;
        if (user?.role === 'COLLECTOR') {
          // Fetch clients for this collector
          const clientsResponse = await clientService.getClientsByCollector(user.id);
          totalClients = clientsResponse.data.length;

          // Fetch active cycles for this collector
          const activeCyclesResponse = await cycleService.getCyclesForCurrentCollector();
          activeCycles = activeCyclesResponse.data.filter(cycle => cycle.status === 'ACTIVE').length;
        } else {
          // Admin: fetch all
          const clientsResponse = await clientService.getAllClients();
          totalClients = clientsResponse.data.length;

          const activeCyclesResponse = await cycleService.getActiveCycles();
          activeCycles = activeCyclesResponse.data.length;
        }

        // Fetch today's collections (deposits)
        const today = new Date().toISOString().split('T')[0];
        const depositsResponse = await depositService.getDepositsByDateRange(today, today);
        const todaysCollections = depositsResponse.data.reduce((sum, deposit) => sum + parseFloat(deposit.amount || 0), 0);

        let totalRegistrationFees = 0;
        let totalCommissionFees = 0;

        // Admin-only aggregates
        if (user?.role !== 'COLLECTOR') {
          try {
            // Get all commissions and sum amounts
            const commissionsResp = await commissionService.getAllCommissions();
            totalCommissionFees = (commissionsResp.data || []).reduce((sum, c) => sum + parseFloat(c.commissionAmount || 0), 0);
          } catch (e) {
            console.warn('Failed to load commissions for dashboard summary', e);
          }

          try {
            // Registration and renewal fees are recorded in deposits via notes
            // Fetch all deposits and sum amounts where notes indicate fees
            const allDepositsResp = await depositService.getAllDeposits?.();
            if (allDepositsResp?.data) {
              totalRegistrationFees = allDepositsResp.data
                .filter(d => typeof d.notes === 'string' && /registration fee|renewal fee/i.test(d.notes))
                .reduce((sum, d) => sum + parseFloat(d.amount || 0), 0);
            }
          } catch (e) {
            console.warn('Failed to load registration/renewal fees from deposits', e);
          }
        }

        setStats({
          totalClients,
          activeCycles,
          todaysCollections,
          totalRegistrationFees,
          totalCommissionFees
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <h1>Welcome, {user?.username}!</h1>
          <p className="lead">Role: {user?.role}</p>

          <div className="row">
            <div className="col-md-4 mb-3">
              <div className="card stats-card">
                <div className="card-body">
                  <h3>{loading ? '...' : stats.totalClients}</h3>
                  <p>Total Clients</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card stats-card">
                <div className="card-body">
                  <h3>{loading ? '...' : stats.activeCycles}</h3>
                  <p>Active Cycles</p>
                </div>
              </div>
            </div>

            <div className="col-md-4 mb-3">
              <div className="card stats-card">
                <div className="card-body">
                  <h3>{loading ? '...' : `${stats.todaysCollections.toLocaleString()} UGX`}</h3>
                  <p>Today's Collections</p>
                </div>
              </div>
            </div>

            {user?.role !== 'COLLECTOR' && (
              <>
                <div className="col-md-6 mb-3">
                  <div className="card stats-card">
                    <div className="card-body">
                      <h3>{loading ? '...' : `${stats.totalRegistrationFees.toLocaleString()} UGX`}</h3>
                      <p>Total Registration & Renewal Fees</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 mb-3">
                  <div className="card stats-card">
                    <div className="card-body">
                      <h3>{loading ? '...' : `${stats.totalCommissionFees.toLocaleString()} UGX`}</h3>
                      <p>Total Commissions</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="card mt-4">
            <div className="card-header">
              <h5>Quick Actions</h5>
            </div>
            <div className="card-body">
              {user?.role === 'COLLECTOR' ? (
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-primary w-100"
                      onClick={() => navigate('/clients')}
                    >
                      <i className="fas fa-user-plus me-2"></i>
                      Register Client
                    </button>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-success w-100"
                      onClick={() => navigate('/deposits')}
                    >
                      <i className="fas fa-coins me-2"></i>
                      Record Deposit
                    </button>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-info w-100"
                      onClick={() => navigate('/deposits')}
                    >
                      <i className="fas fa-chart-line me-2"></i>
                      View Reports
                    </button>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-warning w-100"
                      onClick={() => navigate('/withdrawals')}
                    >
                      <i className="fas fa-hand-holding-usd me-2"></i>
                      Withdrawal Request
                    </button>
                  </div>
                </div>
              ) : (
                <div className="row">
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-primary w-100"
                      onClick={() => navigate('/users')}
                    >
                      <i className="fas fa-users me-2"></i>
                      Manage Users
                    </button>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-success w-100"
                      onClick={() => navigate('/withdrawals')}
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      Approve Withdrawals
                    </button>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-info w-100"
                      onClick={() => navigate('/deposits')}
                    >
                      <i className="fas fa-chart-bar me-2"></i>
                      View All Reports
                    </button>
                  </div>
                  <div className="col-md-3 mb-2">
                    <button 
                      className="btn btn-secondary w-100"
                      onClick={() => navigate('/users')}
                    >
                      <i className="fas fa-cog me-2"></i>
                      System Settings
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;