// User types
export interface User {
  id: number;
  email: string;
  full_name: string;
  is_active: boolean;
  is_superuser: boolean;
}

// Request/Response schemas
export interface RegisterRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string; // "bearer"
}

export interface AuthResponse {
  user: User;
  token: AuthToken;
}

// Auth state management
export type AuthState = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

export interface AuthContextValue {
  user: User | null;
  token: string | null;
  state: AuthState;
  error: string | null;

  // Actions
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}
