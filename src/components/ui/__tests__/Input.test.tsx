import { render, screen } from '@/__tests__/utils/test-utils'
import { Input } from '../Input'
import userEvent from '@testing-library/user-event'

describe('Input', () => {
  it('renders with label', () => {
    render(<Input label="Email" />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('handles input changes', async () => {
    const handleChange = jest.fn()
    const user = userEvent.setup()
    render(<Input label="Email" onChange={handleChange} />)
    
    const input = screen.getByLabelText(/email/i)
    await user.type(input, 'test@example.com')
    expect(handleChange).toHaveBeenCalled()
  })

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />)
    expect(screen.getByText(/invalid email/i)).toBeInTheDocument()
  })

  it('displays helper text', () => {
    render(<Input label="Email" helperText="Enter your email address" />)
    expect(screen.getByText(/enter your email address/i)).toBeInTheDocument()
  })

  it('is disabled when disabled prop is true', () => {
    render(<Input label="Email" disabled />)
    expect(screen.getByLabelText(/email/i)).toBeDisabled()
  })

  it('supports different input types', () => {
    const { rerender } = render(<Input label="Email" type="email" />)
    expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email')

    rerender(<Input label="Password" type="password" />)
    expect(screen.getByLabelText(/password/i)).toHaveAttribute('type', 'password')
  })
})
