import { authentication, readMe } from '@directus/sdk';
import { directus } from './directusClient';
import { DIRECTUS_URL } from '../config';
import type { User, LoginCredentials, SignupCredentials } from '../types';

// Add authentication to the client
const directusWithAuth = directus.with(authentication());

export const login = async (credentials: LoginCredentials): Promise<User> => {
  try {
    await directusWithAuth.login(credentials);
    const user = await directusWithAuth.request(readMe());
    return user as User;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const signup = async (credentials: SignupCredentials): Promise<User> => {
  try {
    // Directus signup typically requires admin approval or specific setup
    // This is a basic implementation - adjust based on your Directus configuration
    const response = await fetch(`${DIRECTUS_URL}/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: credentials.email,
        password: credentials.password,
        first_name: credentials.first_name,
        last_name: credentials.last_name,
      }),
    });

    if (!response.ok) {
      throw new Error('Signup failed');
    }

    const user = await response.json();
    return user.data as User;
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const logout = async (): Promise<void> => {
  try {
    await directusWithAuth.logout();
  } catch (error) {
    console.error('Logout error:', error);
    throw error;
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const user = await directusWithAuth.request(readMe());
    return user as User;
  } catch (error) {
    console.error('Get current user error:', error);
    return null;
  }
};

export const isAuthenticated = async (): Promise<boolean> => {
  try {
    await directusWithAuth.request(readMe());
    return true;
  } catch {
    return false;
  }
};