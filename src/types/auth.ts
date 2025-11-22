export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role?: 'user' | 'admin';
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}