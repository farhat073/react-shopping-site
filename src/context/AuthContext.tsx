import React, { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import toast from 'react-hot-toast';
import { login, signup, logout, getCurrentUser } from '../api/auth';
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
      const token = localStorage.getItem('strapi_jwt');
      if (token) {
        try {
          // Import the strapi client and set token
          const { strapi } = await import('../api/strapiClient');
          strapi.setToken(token);
          const currentUser = await getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Error restoring session:', error);
          // Clear token on failure
          localStorage.removeItem('strapi_jwt');
          setUser(null);
        }
      }
      setLoading(false);
    };

    restoreSession();
  }, []);

  const handleLogin = async (credentials: LoginCredentials) => {
    setLoading(true);
    try {
      const { user: loggedInUser, jwt } = await login(credentials);
      localStorage.setItem('strapi_jwt', jwt);
      setUser(loggedInUser);
      toast.success('Successfully logged in!');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (credentials: SignupCredentials) => {
    setLoading(true);
    try {
      const { user: newUser, jwt } = await signup(credentials);
      localStorage.setItem('strapi_jwt', jwt);
      setUser(newUser);
      toast.success('Account created successfully!');
    } catch (error) {
      toast.error('Signup failed. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      localStorage.removeItem('strapi_jwt');
      setUser(null);
      toast.success('Successfully logged out!');
    } catch (error) {
      console.error('Logout error:', error);
      // Clear token even on error
      localStorage.removeItem('strapi_jwt');
      setUser(null);
      toast.error('Logout failed.');
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    login: handleLogin,
    signup: handleSignup,
    logout: handleLogout,
    loading,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
