'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import type { User, LoginRequest, RegisterRequest } from '@/types/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterRequest) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Decode a JWT payload without verification (just to read exp claim).
 */
function decodeJwtExp(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearRefreshTimer = useCallback(() => {
    if (refreshTimerRef.current) {
      clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }, []);

  // Handle unauthorized (401) responses - redirect to login
  const handleUnauthorized = useCallback(() => {
    clearRefreshTimer();
    setUser(null);
    router.push('/login');
  }, [router, clearRefreshTimer]);

  // Set up the unauthorized callback when component mounts
  useEffect(() => {
    api.setOnUnauthorized(handleUnauthorized);
  }, [handleUnauthorized]);

  /**
   * Schedule a token refresh at 75% of the token's lifetime.
   * On failure, logs the user out.
   */
  const scheduleTokenRefresh = useCallback((accessToken: string) => {
    clearRefreshTimer();

    const exp = decodeJwtExp(accessToken);
    if (!exp) return;

    const nowSec = Math.floor(Date.now() / 1000);
    const lifetime = exp - nowSec;
    if (lifetime <= 0) return;

    // Refresh at 75% of lifetime
    const refreshInMs = lifetime * 0.75 * 1000;

    refreshTimerRef.current = setTimeout(async () => {
      const refreshToken = typeof window !== 'undefined'
        ? localStorage.getItem('refresh_token')
        : null;

      if (!refreshToken) {
        handleUnauthorized();
        return;
      }

      try {
        const response = await api.refreshToken({ refresh_token: refreshToken });
        if (response.success && response.data) {
          api.setToken(response.data.access_token);
          api.setRefreshToken(response.data.refresh_token);
          // Schedule next refresh
          scheduleTokenRefresh(response.data.access_token);
        } else {
          handleUnauthorized();
        }
      } catch {
        handleUnauthorized();
      }
    }, refreshInMs);
  }, [clearRefreshTimer, handleUnauthorized]);

  const refreshUser = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.getCurrentUser();
      if (response.success && response.data) {
        setUser(response.data);
        // Start auto-refresh timer
        scheduleTokenRefresh(token);
      } else {
        api.logout();
        setUser(null);
      }
    } catch {
      api.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [scheduleTokenRefresh]);

  useEffect(() => {
    refreshUser();
    return () => clearRefreshTimer();
  }, [refreshUser, clearRefreshTimer]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await api.signIn(credentials);
      if (response.success && response.data) {
        api.setToken(response.data.access_token);
        api.setRefreshToken(response.data.refresh_token);
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: response.detail || response.error || 'Login failed' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterRequest) => {
    setIsLoading(true);
    try {
      const response = await api.signUp(data);
      if (response.success && response.data) {
        // Auto-login after registration
        api.setToken(response.data.access_token);
        api.setRefreshToken(response.data.refresh_token);
        await refreshUser();
        return { success: true };
      }
      return { success: false, error: response.detail || response.error || 'Registration failed' };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Registration failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearRefreshTimer();
    api.logout();
    setUser(null);
    router.push('/login');
  }, [clearRefreshTimer, router]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
