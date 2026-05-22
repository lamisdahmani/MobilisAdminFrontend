// src/context/AuthContext.jsx
import { createContext, useContext, useState, useCallback } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('admin_token'));
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem('admin_user') || 'null'); }
    catch { return null; }
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (emailOrPhone, password) => {
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(emailOrPhone, password);
      const data = res.data;
      localStorage.setItem('admin_token', data.token);
      localStorage.setItem('admin_user', JSON.stringify(data));
      setToken(data.token);
      setAdmin(data);
      return true;
    } catch (err) {
      setError(err.message || 'Erreur de connexion.');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    setToken(null);
    setAdmin(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, admin, login, logout, error, loading, isLoggedIn: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
