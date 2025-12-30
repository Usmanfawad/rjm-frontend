'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Handle unauthorized (401) responses - redirect to login
  const handleUnauthorized = useCallback(() => {
    setUser(null);
    router.push('/login');
  }, [router]);

  // Set up the unauthorized callback when component mounts
  useEffect(() => {
    api.setOnUnauthorized(handleUnauthorized);
  }, [handleUnauthorized]);

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
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (credentials: LoginRequest) => {
    setIsLoading(true);
    try {
      const response = await api.login(credentials);
      if (response.success && response.data) {
        api.setToken(response.data.access_token);
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
      const response = await api.register(data);
      if (response.success && response.data) {
        // Auto-login after registration
        api.setToken(response.data.access_token);
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

  const logout = () => {
    api.logout();
    setUser(null);
  };

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
