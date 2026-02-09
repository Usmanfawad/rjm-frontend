import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { RegisterForm } from '../RegisterForm'
import userEvent from '@testing-library/user-event'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'

jest.mock('@/context/AuthContext')
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
  usePathname: jest.fn(() => '/'),
  useSearchParams: jest.fn(() => new URLSearchParams()),
}))

const mockRegister = jest.fn()
const mockPush = jest.fn()

beforeEach(() => {
  (useAuth as jest.Mock).mockReturnValue({
    register: mockRegister,
    isLoading: false,
  })
  ;(useRouter as jest.Mock).mockReturnValue({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    prefetch: jest.fn(),
  })
  mockRegister.mockClear()
  mockPush.mockClear()
})

describe('RegisterForm', () => {
  it('renders registration form', () => {
    render(<RegisterForm />)
    expect(screen.getByText(/create your account/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/full name/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/email address/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/password.*min 8/i)).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/please provide all required fields/i)).toBeInTheDocument()
    })
  })

  it('validates password length', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    await user.type(screen.getByPlaceholderText(/full name/i), 'Test User')
    await user.type(screen.getByPlaceholderText(/email address/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/password.*min 8/i), 'short')
    await user.type(screen.getByPlaceholderText(/confirm password/i), 'short')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/password must be at least 8 characters/i)).toBeInTheDocument()
    })
  })

  it('validates password match', async () => {
    const user = userEvent.setup()
    render(<RegisterForm />)
    
    await user.type(screen.getByPlaceholderText(/full name/i), 'Test User')
    await user.type(screen.getByPlaceholderText(/email address/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/password.*min 8/i), 'password123')
    await user.type(screen.getByPlaceholderText(/confirm password/i), 'different123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument()
    })
  })

  it('calls register with correct data', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ success: true })
    
    render(<RegisterForm />)
    
    await user.type(screen.getByPlaceholderText(/full name/i), 'Test User')
    await user.type(screen.getByPlaceholderText(/email address/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/password.*min 8/i), 'password123')
    await user.type(screen.getByPlaceholderText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        full_name: 'Test User',
      })
    })
  })

  it('redirects to dashboard on successful registration', async () => {
    const user = userEvent.setup()
    mockRegister.mockResolvedValue({ success: true })
    
    render(<RegisterForm />)
    
    await user.type(screen.getByPlaceholderText(/full name/i), 'Test User')
    await user.type(screen.getByPlaceholderText(/email address/i), 'test@example.com')
    await user.type(screen.getByPlaceholderText(/password.*min 8/i), 'password123')
    await user.type(screen.getByPlaceholderText(/confirm password/i), 'password123')
    await user.click(screen.getByRole('button', { name: /create account/i }))
    
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith('/dashboard')
    })
  })
})
