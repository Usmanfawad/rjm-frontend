import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import '@testing-library/jest-dom'
import { mockAuthContext, MockAuthProvider } from '../__mocks__/context'

// Custom render function that includes providers
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <MockAuthProvider>
      {children}
    </MockAuthProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>,
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'
export { customRender as render }

// Helper to create mock user
export const createMockUser = (overrides = {}) => ({
  id: '1',
  email: 'test@example.com',
  full_name: 'Test User',
  created_at: '2024-01-01T00:00:00Z',
  ...overrides,
})

// Helper to wait for async operations
export const waitForAsync = () => new Promise(resolve => setTimeout(resolve, 0))

// Helper to create mock API response
export const createMockApiResponse = <T,>(data: T, success = true) => ({
  success,
  data,
  message: success ? 'Success' : 'Error',
})
