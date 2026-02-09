import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { LoginForm } from '../LoginForm'
import userEvent from '@testing-library/user-event'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

// Mock dependencies
jest.mock('@/context/AuthContext')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

const mockLogin = jest.fn()
const mockPush = jest.fn()

beforeEach(() => {
  (useAuth as jest.Mock).mockReturnValue({
    login: mockLogin,
    isLoading: false,
  })
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  })
  mockLogin.mockClear()
  mockPush.mockClear()
})

describe('LoginForm', () => {
  it('renders login form', () => {
    render(<LoginForm />)
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/^password$/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('shows error when fields are empty', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const submitButton = screen.getByRole('button', { name: /sign in/i })
    await user.click(submitButton)
    
    await waitFor(() => {
      expect(screen.getByText(/please provide your email and password/i)).toBeInTheDocument()
    })
  })

  it('calls login with correct credentials', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })
    
    render(<LoginForm />)
    
    await user.type(screen.getByPlaceholderText(/email address/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
      })
    })
  })

  it('shows error message on login failure', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: false, error: 'Invalid credentials' })
    
    render(<LoginForm />)
    
    await user.type(screen.getByPlaceholderText(/email address/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/^password$/i), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })

  it('toggles password visibility', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const passwordInput = screen.getByPlaceholderText(/^password$/i)
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    const toggleButton = screen.getByRole('button', { name: /show password/i })
    await user.click(toggleButton)
    
    expect(passwordInput).toHaveAttribute('type', 'text')
  })

  it('redirects to dashboard on successful login', async () => {
    const user = userEvent.setup()
    mockLogin.mockResolvedValue({ success: true })
    
    render(<LoginForm />)
    
    await user.type(screen.getByPlaceholderText(/email address/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/^password$/i), 'password123')
    await user.click(screen.getByRole('button', { name: /sign in/i }))
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
