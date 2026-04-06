import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '../api/authApi';

const AuthContext = createContext(null);

const TOKEN_KEY = 'jma_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const navigate = useNavigate();

  const login = useCallback(async (username, password) => {
    const { token: newToken } = await loginApi({ username, password });
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    navigate('/login', { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ token, isAuthenticated: !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
