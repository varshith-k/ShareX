import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, registerUser } from '../services/auth';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(Boolean(localStorage.getItem('authToken')));

  async function login(credentials) {
    const data = await loginUser(credentials);
    const authToken = data.token || '';

    setToken(authToken);
    localStorage.setItem('authToken', authToken);

    return data;
  }

  async function register(userData) {
    return registerUser(userData);
  }

  function logout() {
    setToken('');
    setCurrentUser(null);
    setIsLoading(false);
    localStorage.removeItem('authToken');
  }

  useEffect(() => {
    async function loadCurrentUser() {
      if (!token) {
        setCurrentUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const user = await getCurrentUser(token);
        setCurrentUser(user);
      } catch (error) {
        setToken('');
        setCurrentUser(null);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    }

    loadCurrentUser();
  }, [token]);

  const value = useMemo(
    () => ({
      token,
      currentUser,
      isLoading,
      setCurrentUser,
      login,
      register,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, currentUser, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext, AuthProvider, useAuth };