import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return (
    <div className="d-flex">
      {/* Mobile top navbar */}
      <div className="mobile-topnav d-block d-md-none bg-dark text-white">
        <div className="container-fluid d-flex align-items-center justify-content-between py-2 px-3">
          <div>
            <strong>Collection MS</strong>
            <div style={{ fontSize: '0.8rem', color: '#adb5bd' }}>{user?.username} ({user?.role})</div>
          </div>
          <div className="d-flex gap-2">
            <Link className={`btn btn-sm ${isActive('/') && location.pathname === '/' ? 'btn-primary' : 'btn-outline-light'}`} to="/">
              <i className="fas fa-home"></i>
            </Link>
            {user?.role === 'ADMIN' && (
              <>
                <Link className={`btn btn-sm ${isActive('/users') ? 'btn-primary' : 'btn-outline-light'}`} to="/users" title="Users">
                  <i className="fas fa-user-cog"></i>
                </Link>
                <Link className={`btn btn-sm ${isActive('/reports') ? 'btn-primary' : 'btn-outline-light'}`} to="/reports" title="Reports">
                  <i className="fas fa-chart-bar"></i>
                </Link>
              </>
            )}
            {/* Common/Collector links */}
            <Link className={`btn btn-sm ${isActive('/clients') ? 'btn-primary' : 'btn-outline-light'}`} to="/clients" title="Clients">
              <i className="fas fa-users"></i>
            </Link>
            <Link className={`btn btn-sm ${isActive('/deposits') ? 'btn-primary' : 'btn-outline-light'}`} to="/deposits" title="Deposits">
              <i className="fas fa-coins"></i>
            </Link>
            <Link className={`btn btn-sm ${isActive('/cycles') ? 'btn-primary' : 'btn-outline-light'}`} to="/cycles" title="Cycles">
              <i className="fas fa-sync"></i>
            </Link>
            <Link className={`btn btn-sm ${isActive('/withdrawals') ? 'btn-primary' : 'btn-outline-light'}`} to="/withdrawals" title="Withdrawals">
              <i className="fas fa-hand-holding-usd"></i>
            </Link>
            <button className="btn btn-sm btn-outline-light" onClick={() => { logout(); window.location.href = '/login'; }} title="Logout">
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </div>
      </div>

      <nav className="sidebar col-md-3 col-lg-2 d-none d-md-block bg-dark">
        <div className="position-sticky pt-3">
          <div className="text-center mb-4">
            <h5 className="text-white">Collection MS</h5>
            <small className="text-light">{user?.username} ({user?.role})</small>
          </div>

          <ul className="nav flex-column">
            <li className="nav-item">
              <Link 
                className={`nav-link text-light ${isActive('/') && location.pathname === '/' ? 'active bg-primary' : ''}`} 
                to="/"
              >
                <i className="fas fa-tachometer-alt me-2"></i>
                Dashboard
              </Link>
            </li>

            {user?.role === 'COLLECTOR' && (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-light ${isActive('/clients') ? 'active bg-primary' : ''}`} 
                    to="/clients"
                  >
                    <i className="fas fa-users me-2"></i>
                    Clients
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-light ${isActive('/deposits') ? 'active bg-primary' : ''}`} 
                    to="/deposits"
                  >
                    <i className="fas fa-coins me-2"></i>
                    Deposits
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-light ${isActive('/cycles') ? 'active bg-primary' : ''}`} 
                    to="/cycles"
                  >
                    <i className="fas fa-sync me-2"></i>
                    Cycles
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-light ${isActive('/withdrawals') ? 'active bg-primary' : ''}`} 
                    to="/withdrawals"
                  >
                    <i className="fas fa-hand-holding-usd me-2"></i>
                    Withdrawals
                  </Link>
                </li>
              </>
            )}

            {user?.role === 'ADMIN' &&  (
              <>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-light ${isActive('/users') ? 'active bg-primary' : ''}`} 
                    to="/users"
                  >
                    <i className="fas fa-user-cog me-2"></i>
                    Users
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-light ${isActive('/clients') ? 'active bg-primary' : ''}`} 
                    to="/clients"
                  >
                    <i className="fas fa-users me-2"></i>
                    Clients
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-light ${isActive('/deposits') ? 'active bg-primary' : ''}`} 
                    to="/deposits"
                  >
                    <i className="fas fa-coins me-2"></i>
                    Deposits
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-light ${isActive('/withdrawals') ? 'active bg-primary' : ''}`} 
                    to="/withdrawals"
                  >
                    <i className="fas fa-check-circle me-2"></i>
                    Withdrawals
                  </Link>
                </li>
                <li className="nav-item">
                  <Link 
                    className={`nav-link text-light ${isActive('/reports') ? 'active bg-primary' : ''}`} 
                    to="/reports"
                  >
                    <i className="fas fa-chart-bar me-2"></i>
                    Reports
                  </Link>
                </li>
              </>
            )}

            <li className="nav-item mt-auto">
              <button className="nav-link btn btn-link text-light text-start w-100" onClick={() => { logout(); window.location.href = '/login'; }}>
                <i className="fas fa-sign-out-alt me-2"></i>
                Logout
              </button>
            </li>
          </ul>
        </div>
      </nav>

      <main className="col-md-9 ms-sm-auto col-lg-10 px-md-4 main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;
