import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('tl_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('tl_token');
    if (token) {
      api.get('/auth/me')
        .then(res => {
          setUser(res.data.user);
          localStorage.setItem('tl_user', JSON.stringify(res.data.user));
        })
        .catch(() => {
          localStorage.removeItem('tl_token');
          localStorage.removeItem('tl_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token, user } = res.data;
    localStorage.setItem('tl_token', token);
    localStorage.setItem('tl_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (username, email, password) => {
    const res = await api.post('/auth/register', { username, email, password });
    const { token, user } = res.data;
    localStorage.setItem('tl_token', token);
    localStorage.setItem('tl_user', JSON.stringify(user));
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('tl_token');
    localStorage.removeItem('tl_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
