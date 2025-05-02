import { useState, useEffect, useCallback, useContext } from 'react';
import { useRouter } from 'next/router';
import { AuthContext } from '../providers/AuthProvider';
import useApi from './useApi';

/**
 * Custom hook for authentication
 * @returns {Object} Authentication utilities
 */
const useAuth = () => {
  const router = useRouter();
  const { user, setUser, isAuthenticated, setIsAuthenticated } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(true);

  // API hooks for authentication actions
  const loginApi = useApi({
    url: '/api/auth/login',
    method: 'POST',
    showErrors: true,
    loadOnMount: false,
  });

  const registerApi = useApi({
    url: '/api/auth/register',
    method: 'POST',
    showErrors: true,
    loadOnMount: false,
  });

  const logoutApi = useApi({
    url: '/api/auth/logout',
    method: 'POST',
    showErrors: false,
    loadOnMount: false,
  });

  const getCurrentUserApi = useApi({
    url: '/api/auth/me',
    method: 'GET',
    showErrors: false,
    loadOnMount: false,
  });

  // Check if the user is authenticated
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const userData = await getCurrentUserApi.callApi();
      
      if (userData) {
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [getCurrentUserApi, setUser, setIsAuthenticated]);

  // Login
  const login = useCallback(async (email, password) => {
    try {
      setIsLoading(true);
      const result = await loginApi.callApi({
        data: { email, password },
      });
      
      if (result && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [loginApi, setUser, setIsAuthenticated]);

  // Register
  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const result = await registerApi.callApi({
        data: userData,
      });
      
      if (result && result.user) {
        setUser(result.user);
        setIsAuthenticated(true);
        return result;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [registerApi, setUser, setIsAuthenticated]);

  // Logout
  const logout = useCallback(async () => {
    try {
      setIsLoading(true);
      await logoutApi.callApi();
      
      setUser(null);
      setIsAuthenticated(false);
      
      // Redirect to login page
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [logoutApi, router, setUser, setIsAuthenticated]);

  // Update user profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      setIsLoading(true);
      const result = await useApi({
        url: '/api/auth/profile',
        method: 'PUT',
        data: profileData,
        showErrors: true,
      }).callApi();
      
      if (result && result.user) {
        setUser(result.user);
        return result;
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [setUser]);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateProfile,
    checkAuth,
  };
};

export default useAuth;
