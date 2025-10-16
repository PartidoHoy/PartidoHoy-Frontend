import React, { createContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('jwt');
      console.log('🔍 Checking auth status - Token exists:', !!token);
      
      if (token) {
        console.log('🔍 Validating token with backend...');
        const userData = await authService.getCurrentUser();
        console.log('✅ Token valid, user data:', userData);
        setUser(userData);
      } else {
        console.log('🚫 No token found');
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      console.log('🧹 Clearing invalid token and user data');
      // Si hay error, limpiar autenticación completamente
      localStorage.removeItem('jwt');
      localStorage.removeItem('fallbackProfile'); // También limpiar perfil fallback
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const response = await authService.login(email, password);
    setUser(response.user);
    return response;
  };

  const register = async (nombre, email, password) => {
    const response = await authService.register(nombre, email, password);
    return response;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !loading && !!localStorage.getItem('jwt'), // Triple validación
    isAdmin: user?.roles?.includes('ADMIN'),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };