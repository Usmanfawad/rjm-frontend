import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { GeneratorForm } from '../GeneratorForm'
import userEvent from '@testing-library/user-event'
import { api } from '@/lib/api'

jest.mock('@/lib/api')

const mockOnGenerate = jest.fn()
const mockGenerateProgram = api.generateProgram as jest.Mock

beforeEach(() => {
  mockOnGenerate.mockClear()
  mockGenerateProgram.mockClear()
})

describe('GeneratorForm', () => {
  it('renders generator form with RJM Voice labels', () => {
    render(<GeneratorForm onGenerate={mockOnGenerate} />)
    
    expect(screen.getByText(/build your persona program/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/brand name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/campaign brief/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /build program/i })).toBeInTheDocument()
  })

  it('validates required fields', async () => {
    const user = userEvent.setup()
    render(<GeneratorForm onGenerate={mockOnGenerate} />)
    
    await user.click(screen.getByRole('button', { name: /build program/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/please provide both brand name and brief/i)).toBeInTheDocument()
    })
  })

  it('calls API with correct data', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      success: true,
      data: {
        generation_id: 'gen-1',
        program_json: { header: 'Test Program', key_identifiers: [], personas: [], generational_segments: [], category_anchors: [], multicultural_expressions: [], local_culture_segments: [], persona_insights: [], demos: {}, activation_plan: [] },
        program_text: 'Program text',
      },
    }
    mockGenerateProgram.mockResolvedValue(mockResponse)
    
    render(<GeneratorForm onGenerate={mockOnGenerate} />)
    
    await user.type(screen.getByLabelText(/brand name/i), 'Starbucks')
    await user.type(screen.getByLabelText(/campaign brief/i), 'Summer campaign')
    await user.click(screen.getByRole('button', { name: /build program/i }))
    
    await waitFor(() => {
      expect(mockGenerateProgram).toHaveBeenCalledWith({
        brand_name: 'Starbucks',
        brief: 'Summer campaign',
        document_ids: undefined,
      })
    })
  })

  it('shows loading state during generation', async () => {
    const user = userEvent.setup()
    mockGenerateProgram.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ success: true, data: {} }), 100)))
    
    render(<GeneratorForm onGenerate={mockOnGenerate} />)
    
    await user.type(screen.getByLabelText(/brand name/i), 'Starbucks')
    await user.type(screen.getByLabelText(/campaign brief/i), 'Summer campaign')
    await user.click(screen.getByRole('button', { name: /build program/i }))
    
    expect(screen.getByText(/building your persona program/i)).toBeInTheDocument()
  })

  it('calls onGenerate with result on success', async () => {
    const user = userEvent.setup()
    const mockResponse = {
      success: true,
      data: {
        generation_id: 'gen-1',
        program_json: { header: 'Test Program', key_identifiers: [], personas: [], generational_segments: [], category_anchors: [], multicultural_expressions: [], local_culture_segments: [], persona_insights: [], demos: {}, activation_plan: [] },
        program_text: 'Program text',
      },
    }
    mockGenerateProgram.mockResolvedValue(mockResponse)
    
    render(<GeneratorForm onGenerate={mockOnGenerate} />)
    
    await user.type(screen.getByLabelText(/brand name/i), 'Starbucks')
    await user.type(screen.getByLabelText(/campaign brief/i), 'Summer campaign')
    await user.click(screen.getByRole('button', { name: /build program/i }))
    
    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith(mockResponse.data)
    })
  })

  it('displays error message on API failure', async () => {
    const user = userEvent.setup()
    mockGenerateProgram.mockResolvedValue({
      success: false,
      error: "We couldn't build your program. Please try again.",
    })
    
    render(<GeneratorForm onGenerate={mockOnGenerate} />)
    
    await user.type(screen.getByLabelText(/brand name/i), 'Starbucks')
    await user.type(screen.getByLabelText(/campaign brief/i), 'Summer campaign')
    await user.click(screen.getByRole('button', { name: /build program/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/we couldn't build your program/i)).toBeInTheDocument()
    })
  })
})
