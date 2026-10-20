import { createContext, useContext, useState } from 'react';
import { api } from '../lib/api';

const C = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('hdss_user') || 'null');
    } catch {
      return null;
    }
  });

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('hdss_token', data.token);
    localStorage.setItem('hdss_user', JSON.stringify(data.user));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('hdss_token');
    localStorage.removeItem('hdss_user');
    setUser(null);
  };

  return <C.Provider value={{ user, login, logout }}>{children}</C.Provider>;
}

export const useAuth = () => useContext(C);
