/**
 * Integration Test: Authentication Flow
 * Tests the complete user journey from landing page to authenticated dashboard
 */
import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { LoginForm } from '@/components/auth/LoginForm'
import { RegisterForm } from '@/components/auth/RegisterForm'
import userEvent from '@testing-library/user-event'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

jest.mock('@/context/AuthContext')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

const mockLogin = jest.fn()
const mockRegister = jest.fn()
const mockPush = jest.fn()

describe('Authentication Flow Integration', () => {
  beforeEach(() => {
    (useAuth as jest.Mock).mockReturnValue({
      login: mockLogin,
      register: mockRegister,
      isLoading: false,
      isAuthenticated: false,
    })
    ;(useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
    })
    mockLogin.mockClear()
    mockRegister.mockClear()
    mockPush.mockClear()
  })

  describe('Login Flow', () => {
    it('completes full login flow with valid credentials', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ success: true })
      
      render(<LoginForm />)
      
      // Step 1: User sees login form
      expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
      expect(screen.getByText(/sign in to continue building/i)).toBeInTheDocument()
      
      // Step 2: User enters credentials
      await user.type(screen.getByPlaceholderText(/email address/i), 'user@example.com')
      await user.type(screen.getByPlaceholderText(/^password$/i), 'securepassword123')
      
      // Step 3: User submits form
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      // Step 4: API is called with correct data
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          email: 'user@example.com',
          password: 'securepassword123',
        })
      })
      
      // Step 5: User is redirected to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('shows error for invalid credentials', async () => {
      const user = userEvent.setup()
      mockLogin.mockResolvedValue({ 
        success: false, 
        error: 'Invalid email or password' 
      })
      
      render(<LoginForm />)
      
      await user.type(screen.getByPlaceholderText(/email address/i), 'wrong@example.com')
      await user.type(screen.getByPlaceholderText(/^password$/i), 'wrongpassword')
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/invalid email or password/i)).toBeInTheDocument()
      })
      expect(mockPush).not.toHaveBeenCalled()
    })

    it('validates empty fields with RJM Voice message', async () => {
      const user = userEvent.setup()
      render(<LoginForm />)
      
      await user.click(screen.getByRole('button', { name: /sign in/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/please provide your email and password to continue/i)).toBeInTheDocument()
      })
    })
  })

  describe('Registration Flow', () => {
    it('completes full registration flow', async () => {
      const user = userEvent.setup()
      mockRegister.mockResolvedValue({ success: true })
      
      render(<RegisterForm />)
      
      // Step 1: User sees registration form
      expect(screen.getByText(/create your account/i)).toBeInTheDocument()
      expect(screen.getByText(/start building persona programs/i)).toBeInTheDocument()
      
      // Step 2: User fills in all fields
      await user.type(screen.getByPlaceholderText(/full name/i), 'John Doe')
      await user.type(screen.getByPlaceholderText(/email address/i), 'john@example.com')
      await user.type(screen.getByPlaceholderText(/password.*min 8/i), 'password123')
      await user.type(screen.getByPlaceholderText(/confirm password/i), 'password123')
      
      // Step 3: User submits form
      await user.click(screen.getByRole('button', { name: /create account/i }))
      
      // Step 4: API is called with correct data
      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
          full_name: 'John Doe',
        })
      })
      
      // Step 5: User is redirected to dashboard
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/dashboard')
      })
    })

    it('validates password strength', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)
      
      await user.type(screen.getByPlaceholderText(/full name/i), 'John Doe')
      await user.type(screen.getByPlaceholderText(/email address/i), 'john@example.com')
      await user.type(screen.getByPlaceholderText(/password.*min 8/i), 'short')
      await user.type(screen.getByPlaceholderText(/confirm password/i), 'short')
      await user.click(screen.getByRole('button', { name: /create account/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
      })
      expect(mockRegister).not.toHaveBeenCalled()
    })

    it('validates password match', async () => {
      const user = userEvent.setup()
      render(<RegisterForm />)
      
      await user.type(screen.getByPlaceholderText(/full name/i), 'John Doe')
      await user.type(screen.getByPlaceholderText(/email address/i), 'john@example.com')
      await user.type(screen.getByPlaceholderText(/password.*min 8/i), 'password123')
      await user.type(screen.getByPlaceholderText(/confirm password/i), 'different123')
      await user.click(screen.getByRole('button', { name: /create account/i }))
      
      await waitFor(() => {
        expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
      })
      expect(mockRegister).not.toHaveBeenCalled()
    })
  })
})
