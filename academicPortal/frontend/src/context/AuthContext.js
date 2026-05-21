import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  ADMIN: 'admin',
};

const setAuthHeader = (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('academicPortalUser');
    return stored ? JSON.parse(stored) : null;
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('academicPortalToken');
    if (token) {
      setAuthHeader(token);
      axios
        .get('/api/auth/profile')
        .then((res) => {
          setUser(res.data.user);
          localStorage.setItem('academicPortalUser', JSON.stringify(res.data.user));
        })
        .catch(() => {
          logout();
        })
        .finally(() => setIsLoading(false));
    } else {
      setAuthHeader(null);
      setIsLoading(false);
    }
  }, []);

  const saveSession = (userData, token) => {
    setUser(userData);
    localStorage.setItem('academicPortalUser', JSON.stringify(userData));
    localStorage.setItem('academicPortalToken', token);
    setAuthHeader(token);
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      saveSession(response.data.user, response.data.token);
      return { success: true };
    } catch (err) {
      console.error('Login error:', err);
      let msg = 'Login failed.';
      if (err?.response?.data) msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || JSON.stringify(err.response.data));
      else if (err?.message) msg = err.message;
      return { success: false, message: msg };
    }
  };

  const register = async (name, email, password, role = ROLES.STUDENT) => {
    try {
      const response = await axios.post('/api/auth/register', { name, email, password, role });
      saveSession(response.data.user, response.data.token);
      return { success: true };
    } catch (err) {
      console.error('Register error:', err);
      let msg = 'Registration failed.';
      if (err?.response?.data) msg = typeof err.response.data === 'string' ? err.response.data : (err.response.data.message || JSON.stringify(err.response.data));
      else if (err?.message) msg = err.message;
      return { success: false, message: msg };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('academicPortalUser');
    localStorage.removeItem('academicPortalToken');
    setAuthHeader(null);
  };

  const canEdit = user && (user.role === ROLES.ADMIN || user.role === ROLES.FACULTY);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, canEdit, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
