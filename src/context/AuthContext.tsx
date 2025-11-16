import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { directus } from '../api/directusClient';
import { readMe, createUser } from '@directus/sdk';
import type { User, LoginCredentials, SignupCredentials } from '../types';

interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  signup: (credentials: SignupCredentials) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const accessToken = localStorage.getItem('directus_access_token');
      const refreshToken = localStorage.getItem('directus_refresh_token');
      if (accessToken && refreshToken) {
        try {
          directus.setToken(accessToken);
          const currentUser = await directus.request(readMe());
          setUser(currentUser as User);
        } catch (error) {
          console.error('Error restoring session:', error);
          // Clear tokens on failure
          localStorage.removeItem('directus_access_token');
          localStorage.removeItem('directus_refresh_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const response = await directus.login({
        email: credentials.email,
        password: credentials.password,
      });
      const accessToken = response.access_token;
      const refreshToken = response.refresh_token;
      localStorage.setItem('directus_access_token', accessToken || '');
      localStorage.setItem('directus_refresh_token', refreshToken || '');
      directus.setToken(accessToken);
      const currentUser = await directus.request(readMe());
      setUser(currentUser as User);
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (credentials: SignupCredentials) => {
    setLoading(true);
    try {
      await directus.request(
        createUser({
          email: credentials.email,
          password: credentials.password,
          first_name: credentials.first_name,
          last_name: credentials.last_name,
        })
      );
      // After signup, automatically log in
      await login({ email: credentials.email, password: credentials.password });
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Signup failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      const refreshToken = localStorage.getItem('directus_refresh_token');
      if (refreshToken) {
        await directus.logout({ refresh_token: refreshToken });
      }
      localStorage.removeItem('directus_access_token');
      localStorage.removeItem('directus_refresh_token');
      setUser(null);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear tokens even on error
      localStorage.removeItem('directus_access_token');
      localStorage.removeItem('directus_refresh_token');
      setUser(null);
      toast.error('Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    logout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
