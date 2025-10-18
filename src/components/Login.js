import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(username, password);

    if (result.success) {
      // Redirect based on role
      const role = result.user?.role;
      if (role === 'ADMIN') {
        navigate('/users');
      } else if (role === 'ACCOUNTANT') {
        navigate('/cycles');
      } else if (role === 'COLLECTOR') {
        navigate('/clients');
      } else {
        // Fallback
        navigate('/');
      }
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="card login-card">
        <div className="card-body">
          <div className="text-center mb-4">
            <h2 className="card-title">Collection Management System</h2>
            <p className="text-muted">Please sign in to continue</p>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label htmlFor="username" className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <small className="text-muted">
             if you forgot your credential, please contact the admin
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;