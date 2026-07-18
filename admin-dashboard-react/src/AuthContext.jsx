// 
import { createContext, useContext, useState } from 'react';
import api from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('fl_user') || 'null');
    } catch {
      return null;
    }
  });

  async function login(email, password) {
    const res = await api.post('/auth/login', { email, password });
    if (!['admin', 'officer'].includes(res.data.user.role)) {
      throw new Error('Access denied. Admin or Officer accounts only.');
    }
    localStorage.setItem('fl_token', res.data.token);
    localStorage.setItem('fl_user', JSON.stringify(res.data.user));
    setUser(res.data.user);
  }

  function logout() {
    localStorage.removeItem('fl_token');
    localStorage.removeItem('fl_user');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
