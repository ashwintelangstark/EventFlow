import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('eventflow_session');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('eventflow_session', JSON.stringify(user));
    } else {
      localStorage.removeItem('eventflow_session');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const data = await api.login(email, password);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (formData) => {
    setLoading(true);
    try {
      const data = await api.signup(formData);
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  // Allow switching roles/views dynamically while in-session (only admin@gmail.com can preview admin role)
  const setRole = (newRole) => {
    if (!user) return;
    if (newRole === 'admin' && user?.email?.toLowerCase() !== 'admin@gmail.com') {
      return;
    }
    const updated = {
      ...user,
      role: newRole
    };
    setUser(updated);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('eventflow_session');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: Boolean(user),
        loading,
        login,
        signup,
        setRole,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
