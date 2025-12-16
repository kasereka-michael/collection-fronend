import React, { useState, useEffect, createContext, useContext } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate user from localStorage if available
    try {
      const stored = localStorage.getItem('user');
      if (stored) {
        setUser(JSON.parse(stored));
      }
    } catch {}
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const response = await authService.login({ username, password });
      const userData = response.data;
      // Response contains user info
      setUser(userData);
      return { success: true, user: userData };
    } catch (error) {
      setUser(null);
      return {
        success: false,
        message: error.response?.data?.message || 'Please make sure the server is running',
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (e) {}
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
