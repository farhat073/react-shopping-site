import { strapi } from './strapiClient';
import type { User, LoginCredentials, SignupCredentials } from '../types';

export const login = async (credentials: LoginCredentials): Promise<{ user: User; jwt: string }> => {
  const response = await strapi.post('/auth/local', {
    identifier: credentials.email,
    password: credentials.password,
  });

  if (response.jwt) {
    strapi.setToken(response.jwt);
    return {
      user: response.user,
      jwt: response.jwt,
    };
  }
  throw new Error('Login failed');
};

export const signup = async (credentials: SignupCredentials): Promise<{ user: User; jwt: string }> => {
  const response = await strapi.post('/auth/local/register', {
    username: credentials.email,
    email: credentials.email,
    password: credentials.password,
    firstName: credentials.first_name,
    lastName: credentials.last_name,
  });

  if (response.jwt) {
    strapi.setToken(response.jwt);
    return {
      user: response.user,
      jwt: response.jwt,
    };
  }
  throw new Error('Signup failed');
};

export const logout = async (): Promise<void> => {
  // For Strapi, logout is just clearing the token on client side
  strapi.setToken('');
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await strapi.get('/users/me');
  return response;
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await getCurrentUser();
    return true;
  } catch {
    return false;
  }
};