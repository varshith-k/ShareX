import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/api';

const AuthContext = createContext(null);
const TOKEN_STORAGE_KEY = 'sharex.auth.token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem(TOKEN_STORAGE_KEY)));

  useEffect(() => {
    let isMounted = true;

    async function bootstrap() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const response = await getCurrentUser(token);
        if (!isMounted) {
          return;
        }

        setUser(response.user);
      } catch (error) {
        if (!isMounted) {
          return;
        }

        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setToken('');
        setUser(null);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    setLoading(Boolean(token));
    bootstrap();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const value = useMemo(() => ({
    loading,
    token,
    user,
    async login(credentials) {
      const response = await loginUser(credentials);
      localStorage.setItem(TOKEN_STORAGE_KEY, response.token);
      setToken(response.token);
      setUser(response.user);
      return response;
    },
    async register(payload) {
      return registerUser(payload);
    },
    logout() {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      setToken('');
      setUser(null);
    },
  }), [loading, token, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return context;
}
