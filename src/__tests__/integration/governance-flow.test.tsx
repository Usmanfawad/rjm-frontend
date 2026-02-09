/**
 * Integration Test: Governance/Operationalization Flow
 * Tests governed object lifecycle: Draft → Approved → Live → Archived
 */
import { render, screen, waitFor } from '@/__tests__/utils/test-utils'
import { ProgramResult } from '@/components/generator/ProgramResult'
import userEvent from '@testing-library/user-event'
import { api } from '@/lib/api'
import type { GenerateProgramResponse } from '@/types/api'

jest.mock('@/lib/api')

const mockRegisterObject = api.registerObject as jest.Mock
const mockTransitionState = api.transitionState as jest.Mock
const mockApproveObject = api.approveObject as jest.Mock
const mockGetDashboard = api.getDashboard as jest.Mock

describe('Governance Flow Integration', () => {
  beforeEach(() => {
    mockRegisterObject.mockClear()
    mockTransitionState.mockClear()
    mockApproveObject.mockClear()
    mockGetDashboard.mockClear()
  })

  const mockProgram: GenerateProgramResponse = {
    generation_id: 'gen-1',
    program_json: {
      header: 'Test Program',
      advertising_category: 'CPG',
      key_identifiers: ['ID1'],
      personas: [{ name: 'Persona 1', category: 'Cat1' }],
      generational_segments: [{ name: 'Gen Z' }],
      category_anchors: ['Anchor 1'],
      multicultural_expressions: [],
      local_culture_segments: [],
      persona_insights: ['Insight 1'],
      demos: { core: 'Core' },
      activation_plan: ['Step 1'],
    },
    program_text: 'Program text',
  }

  it('registers program for governance', async () => {
    const user = userEvent.setup()
    
    const mockGovernedObject = {
      id: 'gov-1',
      object_type: 'persona_program' as const,
      reference_id: 'gen-1',
      reference_table: 'persona_generations',
      current_state: 'draft' as const,
      version: 1,
      creator_id: 'user-1',
      current_responsible_id: 'user-1',
      is_valid: true,
      validation_errors: [],
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    }

    mockRegisterObject.mockResolvedValue({
      success: true,
      data: mockGovernedObject,
    })

    render(<ProgramResult result={mockProgram} />)

    // User clicks "Register for Governance"
    const registerButton = screen.getByRole('button', { name: /register for governance/i })
    await user.click(registerButton)

    await waitFor(() => {
      expect(mockRegisterObject).toHaveBeenCalledWith({
        object_type: 'persona_program',
        reference_id: 'gen-1',
        reference_table: 'persona_generations',
        title: expect.stringContaining('Test Program'),
        description: expect.stringContaining('Persona program for'),
      })
    })
  })

  it('transitions state from draft to approved', async () => {
    mockTransitionState.mockResolvedValue({
      success: true,
      data: {
        object: {
          id: 'gov-1',
          current_state: 'approved',
        },
        event: {
          id: 'event-1',
          event_type: 'state_transition',
          from_state: 'draft',
          to_state: 'approved',
        },
        message: 'State transitioned successfully',
      },
    })

    const result = await mockTransitionState('gov-1', {
      to_state: 'approved',
      reason: 'Ready for activation',
    })

    expect(result.success).toBe(true)
    expect(result.data.object.current_state).toBe('approved')
  })

  it('approves object with strategic approval', async () => {
    mockApproveObject.mockResolvedValue({
      success: true,
      data: {
        id: 'approval-1',
        object_id: 'gov-1',
        approval_type: 'strategic',
        approved_by: 'user-1',
        approved_at: '2024-01-01T00:00:00Z',
      },
    })

    const result = await mockApproveObject('gov-1', {
      approval_type: 'strategic',
      notes: 'Approved for Q1 campaign',
    })

    expect(result.success).toBe(true)
    expect(mockApproveObject).toHaveBeenCalledWith('gov-1', {
      approval_type: 'strategic',
      notes: 'Approved for Q1 campaign',
    })
  })

  it('displays governance dashboard stats', async () => {
    const mockDashboard = {
      stats: {
        draft_count: 5,
        approved_count: 3,
        requested_count: 2,
        in_progress_count: 1,
        live_count: 10,
        archived_count: 2,
        total_count: 23,
      },
      recent_objects: [],
      pending_approvals: [],
      my_objects: [],
    }

    mockGetDashboard.mockResolvedValue({
      success: true,
      data: mockDashboard,
    })

    const result = await mockGetDashboard()

    expect(result.success).toBe(true)
    expect(result.data.stats.live_count).toBe(10)
    expect(result.data.stats.total_count).toBe(23)
  })

  it('prevents invalid state transitions', async () => {
    mockTransitionState.mockResolvedValue({
      success: false,
      error: 'Invalid state transition from archived',
    })

    const result = await mockTransitionState('gov-1', {
      to_state: 'approved',
    })

    expect(result.success).toBe(false)
    expect(result.error).toContain('Invalid state transition')
  })
})
