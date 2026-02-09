import React from 'react'
import type { ReactNode } from 'react'

// Mock Auth Context
export const mockAuthContext = {
  user: {
    id: '1',
    email: 'test@example.com',
    full_name: 'Test User',
    created_at: '2024-01-01T00:00:00Z',
  },
  isAuthenticated: true,
  isLoading: false,
  login: jest.fn().mockResolvedValue({ success: true }),
  register: jest.fn().mockResolvedValue({ success: true }),
  logout: jest.fn(),
  refreshToken: jest.fn(),
}

export const MockAuthProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}

// Mock Theme Context
export const mockThemeContext = {
  theme: 'light',
  setTheme: jest.fn(),
  resolvedTheme: 'light',
}

export const MockThemeProvider = ({ children }: { children: ReactNode }) => {
  return <>{children}</>
}
