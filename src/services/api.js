import axios from 'axios';

const api = axios.create({
  baseURL: 'https://collection-system-r29s.onrender.com/api' || 'https://collection-system-r29s.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Send cookies with requests
});

// Remove JWT request interceptor (no Authorization header needed)

// Response interceptor to handle unauthorized errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      try {
        // Clear any persisted auth state
        localStorage.removeItem('user');
      } catch {}
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
