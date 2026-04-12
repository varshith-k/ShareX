import { createContext, useContext, useMemo, useState } from 'react';
import { loginUser, registerUser } from '../services/auth';

const AuthContext = createContext(null);

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('authToken') || '');
  const [currentUser, setCurrentUser] = useState(null);

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
    localStorage.removeItem('authToken');
  }

  const value = useMemo(
    () => ({
      token,
      currentUser,
      setCurrentUser,
      login,
      register,
      logout,
    }),
    [token, currentUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

function useAuth() {
  return useContext(AuthContext);
}

export { AuthContext, AuthProvider, useAuth };