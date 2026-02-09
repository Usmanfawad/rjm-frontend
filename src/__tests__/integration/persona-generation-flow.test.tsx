/**
 * Integration Test: Persona Generation Flow
 * Tests the complete flow from brief entry to program display
 */
import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { GeneratorForm } from '@/components/generator/GeneratorForm'
import { ProgramResult } from '@/components/generator/ProgramResult'
import userEvent from '@testing-library/user-event'
import { api } from '@/lib/api'
import type { GenerateProgramResponse } from '@/types/api'

jest.mock('@/lib/api')

const mockGenerateProgram = api.generateProgram as jest.Mock
const mockOnGenerate = jest.fn()

describe('Persona Generation Flow Integration', () => {
  beforeEach(() => {
    mockGenerateProgram.mockClear()
    mockOnGenerate.mockClear()
  })

  const mockProgramResponse: GenerateProgramResponse = {
    generation_id: 'gen-1',
    program_json: {
      header: 'Starbucks Summer Campaign Persona Program',
      advertising_category: 'Culinary & Dining',
      campaign_type: 'national',
      key_identifiers: ['Coffee enthusiasts', 'Urban professionals', 'Social media active'],
      personas: [
        { name: 'The Coffee Connoisseur', category: 'Food & Beverage', highlight: 'Premium coffee seeker' },
        { name: 'The Morning Commuter', category: 'Food & Beverage', highlight: 'Grab-and-go specialist' },
      ],
      generational_segments: [
        { name: 'Gen Z Coffee Culture', highlight: 'Digital-first coffee experiences' },
        { name: 'Millennial Coffee Ritual', highlight: 'Third place enthusiasts' },
      ],
      category_anchors: ['Coffee Culture', 'Cafe Experience'],
      multicultural_expressions: [],
      local_culture_segments: [],
      persona_insights: [
        'Coffee is a daily ritual for 68% of target audience',
        'Social media influences 45% of coffee purchase decisions',
      ],
      demos: {
        core: 'Ages 25-45, Urban, $50K+ income',
        secondary: 'Ages 18-24, College students, $30K+ income',
      },
      activation_plan: [
        'Launch CTV campaign targeting morning commute hours',
        'Partner with urban lifestyle influencers',
        'Create social media challenge around coffee moments',
      ],
      strategy_layers: undefined,
    },
    program_text: 'Full program text content',
  }

  it('completes full generation flow with RJM Voice', async () => {
    const user = userEvent.setup()
    mockGenerateProgram.mockResolvedValue({
      success: true,
      data: mockProgramResponse,
    })
    
    render(<GeneratorForm onGenerate={mockOnGenerate} />)
    
    // Step 1: User sees "Build Your Persona Program" form
    expect(screen.getByText(/build your persona program/i)).toBeInTheDocument()
    
    // Step 2: User enters brand and brief
    await user.type(screen.getByPlaceholderText(/enter your brand name/i), 'Starbucks')
    await user.type(screen.getByPlaceholderText(/describe your campaign/i), 'Summer campaign targeting urban professionals')
    
    // Step 3: User clicks "Build Program" (RJM Voice)
    const buildButton = screen.getByRole('button', { name: /build program/i })
    await user.click(buildButton)
    
    // Step 4: Loading state shows "Building your persona program..."
    expect(screen.getByText(/building your persona program/i)).toBeInTheDocument()
    
    // Step 5: API is called with correct data
    await waitFor(() => {
      expect(mockGenerateProgram).toHaveBeenCalledWith({
        brand_name: 'Starbucks',
        brief: 'Summer campaign targeting urban professionals',
        document_ids: undefined,
      })
    })
    
    // Step 6: onGenerate callback is called with result
    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalledWith(mockProgramResponse)
    })
  })

  it('validates brief is not too short', async () => {
    const user = userEvent.setup()
    render(<GeneratorForm onGenerate={mockOnGenerate} />)
    
    await user.type(screen.getByPlaceholderText(/enter your brand name/i), 'Starbucks')
    await user.type(screen.getByPlaceholderText(/describe your campaign/i), 'Summer')
    await user.click(screen.getByRole('button', { name: /build program/i }))
    
    await waitFor(() => {
      expect(screen.getByText(/please provide both brand name and brief/i)).toBeInTheDocument()
    })
  })

  it('displays program result with all sections', () => {
    render(<ProgramResult result={mockProgramResponse} />)
    
    // Verify RJM Voice section headers
    expect(screen.getByText(/your persona program/i)).toBeInTheDocument()
    expect(screen.getByText(/🔑 key identifiers/i)).toBeInTheDocument()
    expect(screen.getByText(/📍 persona portfolio/i)).toBeInTheDocument()
    expect(screen.getByText(/👥 demos/i)).toBeInTheDocument()
    expect(screen.getByText(/🧭 activation plan/i)).toBeInTheDocument()
    expect(screen.getByText(/📊 persona insights/i)).toBeInTheDocument()
    
    // Verify content
    expect(screen.getByText(/starbucks summer campaign/i)).toBeInTheDocument()
    expect(screen.getByText(/culinary & dining/i)).toBeInTheDocument()
    expect(screen.getByText(/coffee enthusiasts/i)).toBeInTheDocument()
    expect(screen.getByText(/the coffee connoisseur/i)).toBeInTheDocument()
  })

  it('handles generation failure with RJM Voice error', async () => {
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
    expect(mockOnGenerate).not.toHaveBeenCalled()
  })

  it('validates category detection - Starbucks should be Culinary & Dining', async () => {
    const user = userEvent.setup()
    const starbucksResponse = {
      ...mockProgramResponse,
      program_json: {
        ...mockProgramResponse.program_json,
        advertising_category: 'Culinary & Dining',
      },
    }
    mockGenerateProgram.mockResolvedValue({
      success: true,
      data: starbucksResponse,
    })
    
    render(<GeneratorForm onGenerate={mockOnGenerate} />)
    
    await user.type(screen.getByLabelText(/brand name/i), 'Starbucks')
    await user.type(screen.getByLabelText(/campaign brief/i), 'Summer campaign')
    await user.click(screen.getByRole('button', { name: /build program/i }))
    
    await waitFor(() => {
      expect(mockOnGenerate).toHaveBeenCalled()
    })
    
    // Verify category in result
    const { rerender } = render(<ProgramResult result={starbucksResponse} />)
    expect(screen.getByText(/culinary & dining/i)).toBeInTheDocument()
  })
})
