import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function loadUser() {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        try {
          const res = await api.getMe();
          if (!isCancelled) {
            if (res.success) {
              setUser(res.data);
            } else {
              logout();
            }
          }
        } catch (err) {
          console.error('Failed to load user session:', err);
          if (!isCancelled) {
            logout();
          }
        }
      } else {
        if (!isCancelled) {
          setUser(null);
        }
      }
      if (!isCancelled) {
        setLoading(false);
      }
    }

    loadUser();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    const syncRefreshedToken = () => setToken(localStorage.getItem('token'));
    window.addEventListener('auth-token-refreshed', syncRefreshedToken);
    return () => window.removeEventListener('auth-token-refreshed', syncRefreshedToken);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return res.data.user;
    }
    throw new Error(res.error || 'Login failed');
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('token', res.data.token);
      if (res.data.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken);
      setToken(res.data.token);
      setUser(res.data.user);
      setLoading(false);
      return res.data.user;
    }
    throw new Error(res.error || 'Registration failed');
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
    setLoading(false);
    api.logout().catch(() => {});
  };

  const updateUser = (updatedUserData) => {
    setUser(prev => ({ ...prev, ...updatedUserData }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
