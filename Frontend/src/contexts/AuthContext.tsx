'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '@/services/authApi';
import type { User, AuthContextValue, AuthState, LoginRequest, RegisterRequest } from '@/types/auth';

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [state, setState] = useState<AuthState>('loading');
  const [error, setError] = useState<string | null>(null);

  // Initialize: Check for existing token on mount
  useEffect(() => {
    let completed = false;

    const initAuth = async () => {
      console.log('[AuthContext] Initializing authentication...');

      try {
        const storedToken = authApi.getToken();
        console.log('[AuthContext] Stored token found:', !!storedToken);

        if (storedToken) {
          try {
            console.log('[AuthContext] Validating stored token...');
            const user = await authApi.getCurrentUser(storedToken);

            if (!completed) {
              console.log('[AuthContext] Token valid, user authenticated:', user.email);
              setUser(user);
              setToken(storedToken);
              setState('authenticated');
              completed = true;
              clearTimeout(timeoutId);
            }
          } catch (err) {
            // Token invalid or expired
            console.error('[AuthContext] Stored token validation failed:', err);
            authApi.clearToken();

            if (!completed) {
              setState('unauthenticated');
              completed = true;
              clearTimeout(timeoutId);
            }
          }
        } else {
          console.log('[AuthContext] No stored token, user unauthenticated');
          if (!completed) {
            setState('unauthenticated');
            completed = true;
            clearTimeout(timeoutId);
          }
        }
      } catch (err) {
        // Unexpected error in initialization
        console.error('[AuthContext] Unexpected error during init:', err);

        if (!completed) {
          setState('unauthenticated');
          completed = true;
          clearTimeout(timeoutId);
        }
      }
    };

    // Timeout fallback: Force unauthenticated after 3 seconds if still loading
    const timeoutId = setTimeout(() => {
      if (!completed) {
        console.warn('[AuthContext] Init timeout reached (3s), forcing unauthenticated state');
        setState('unauthenticated');
        completed = true;
      }
    }, 3000);

    initAuth();

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  const login = async (credentials: LoginRequest) => {
    console.log('[AuthContext] Login attempt for:', credentials.email);
    setState('loading');
    setError(null);

    try {
      const { user, token } = await authApi.login(credentials);
      console.log('[AuthContext] Login successful for:', user.email);
      setUser(user);
      setToken(token);
      setState('authenticated');
    } catch (err) {
      console.error('[AuthContext] Login failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      setState('unauthenticated'); // Always go back to unauthenticated, not error
      throw err;
    }
  };

  const register = async (data: RegisterRequest) => {
    console.log('[AuthContext] Registration attempt for:', data.email);
    setState('loading');
    setError(null);

    try {
      await authApi.register(data);
      console.log('[AuthContext] Registration successful, auto-logging in...');
      // After registration, auto-login
      await login({ email: data.email, password: data.password });
    } catch (err) {
      console.error('[AuthContext] Registration failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Registration failed';
      setError(errorMessage);
      setState('unauthenticated'); // Always go back to unauthenticated, not error
      throw err;
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
    setToken(null);
    setState('unauthenticated');
    setError(null);
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const user = await authApi.getCurrentUser(token);
      setUser(user);
    } catch (err) {
      // Token expired, logout
      console.error('Failed to refresh user:', err);
      logout();
    }
  };

  const value: AuthContextValue = {
    user,
    token,
    state,
    error,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
