import React, { createContext, useState, useEffect, ReactNode } from 'react';
import apiClient from '../lib/apiClient';
import { handleApiError } from '../utils/errorHandling';
import { User } from '../types/user';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, first_name: string, last_name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: User) => void;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing session
    const checkSession = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const response = await apiClient.get('/api/auth/me');
          setUser(response.data);
        } catch (error) {
          // Token invalid, clear it
          localStorage.removeItem('access_token');
          setUser(null);
        }
      }
      setLoading(false);
    };
    
    checkSession();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/api/auth/login', { email, password });
      const { user: userData, access_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      setUser(userData);
    } catch (error: any) {
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  };

  const signup = async (email: string, password: string, first_name: string, last_name: string) => {
    try {
      console.log('Signup request:', { email, first_name, last_name });
      const response = await apiClient.post('/api/auth/signup', { email, password, first_name, last_name });
      console.log('Signup response:', response.data);
      const { user: userData, access_token } = response.data;
      
      localStorage.setItem('access_token', access_token);
      setUser(userData);
    } catch (error: any) {
      console.error('Signup API error:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        response: error.response?.data,
        status: error.response?.status
      });
      const errorMessage = handleApiError(error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  const updateUser = (userData: User) => {
    setUser(userData);
  };

  const refreshUser = async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

