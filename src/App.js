import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Users from './components/Users';
import UserForm from './components/UserForm';
import Clients from './components/Clients';
import ClientForm from './components/ClientForm';
import ClientDetail from './components/ClientDetail';
import Deposits from './components/Deposits';
import DepositDetail from './components/DepositDetail';
import DepositForm from './components/DepositForm';
import Withdrawals from './components/Withdrawals';
import WithdrawalDetail from './components/WithdrawalDetail';
import WithdrawalForm from './components/WithdrawalForm';
import Cycles from './components/Cycles';
import CycleForm from './components/CycleForm';
import CycleDetail from './components/CycleDetail';
import ProtectedRoute from './components/ProtectedRoute';
import Reports from './components/Reports';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Users />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients"
            element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposits"
            element={
              <ProtectedRoute>
                <Deposits />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdrawals"
            element={
              <ProtectedRoute>
                <Withdrawals />
              </ProtectedRoute>
            }
          />
          {/* Form Routes */}
          <Route
            path="/users/new"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/users/:id/edit"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <UserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/new"
            element={
              <ProtectedRoute>
                <ClientForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id"
            element={
              <ProtectedRoute>
                <ClientDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/clients/:id/edit"
            element={
              <ProtectedRoute>
                <ClientForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposits/new"
            element={
              <ProtectedRoute>
                <DepositForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposits/:id"
            element={
              <ProtectedRoute>
                <DepositDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/deposits/:id/edit"
            element={
              <ProtectedRoute>
                <DepositForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdrawals/new"
            element={
              <ProtectedRoute>
                <WithdrawalForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdrawals/:id"
            element={
              <ProtectedRoute>
                <WithdrawalDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/withdrawals/:id/edit"
            element={
              <ProtectedRoute>
                <WithdrawalForm />
              </ProtectedRoute>
            }
          />
          {/* Cycle Routes */}
          <Route
            path="/cycles"
            element={
              <ProtectedRoute>
                <Cycles />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Reports />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cycles/new"
            element={
              <ProtectedRoute>
                <CycleForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cycles/:id"
            element={
              <ProtectedRoute>
                <CycleDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/cycles/:id/edit"
            element={
              <ProtectedRoute>
                <CycleForm />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
