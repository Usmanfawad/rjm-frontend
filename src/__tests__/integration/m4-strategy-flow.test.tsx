/**
 * Integration Test: M4 Local & Multicultural Strategy Flow
 * Tests campaign type detection and strategy section display
 */
import { render, screen } from '@/__tests__/utils/test-utils'
import { ProgramResult } from '@/components/generator/ProgramResult'
import type { GenerateProgramResponse } from '@/types/api'

describe('M4 Strategy Flow Integration', () => {
  const createMockProgram = (campaignType: 'national' | 'local' | 'multicultural' | 'local_multicultural', hasLocal = false, hasMC = false): GenerateProgramResponse => ({
    generation_id: 'gen-1',
    program_json: {
      header: 'Test Campaign Persona Program',
      advertising_category: 'CPG',
      campaign_type: campaignType,
      key_identifiers: ['Identifier 1'],
      personas: [{ name: 'Persona 1', category: 'Category 1' }],
      generational_segments: [{ name: 'Gen Z', highlight: 'Digital natives' }],
      category_anchors: ['Anchor 1'],
      multicultural_expressions: [],
      local_culture_segments: [],
      persona_insights: ['Insight 1'],
      demos: { core: 'Core demo' },
      activation_plan: ['Step 1'],
      strategy_layers: {
        ...(hasLocal && {
          local_strategy: {
            dmas: ['Miami', 'Atlanta'],
            segments: ['Miami Cuban Culture', 'Atlanta Southern Hospitality'],
            insights: ['Local culture insights'],
            recommendations: ['Local activation recommendations'],
          },
        }),
        ...(hasMC && {
          multicultural_strategy: {
            lineages: ['Hispanic', 'African American'],
            expressions: ['Hispanic Expression 1', 'AA Expression 1'],
            insights: ['Multicultural insights'],
            recommendations: ['MC activation recommendations'],
          },
        }),
      },
    },
    program_text: 'Program text',
  })

  it('displays Local Strategy section for local campaigns', () => {
    const program = createMockProgram('local', true, false)
    render(<ProgramResult result={program} />)
    
    // Local Strategy section should be visible
    expect(screen.getByText(/📍 local strategy/i)).toBeInTheDocument()
    expect(screen.getByText(/target dmas/i)).toBeInTheDocument()
    expect(screen.getByText(/miami/i)).toBeInTheDocument()
    expect(screen.getByText(/atlanta/i)).toBeInTheDocument()
    
    // Multicultural Strategy should NOT be visible
    expect(screen.queryByText(/🌍 multicultural strategy/i)).not.toBeInTheDocument()
  })

  it('displays Multicultural Strategy section for multicultural campaigns', () => {
    const program = createMockProgram('multicultural', false, true)
    render(<ProgramResult result={program} />)
    
    // Multicultural Strategy section should be visible
    expect(screen.getByText(/🌍 multicultural strategy/i)).toBeInTheDocument()
    expect(screen.getByText(/multicultural lineages/i)).toBeInTheDocument()
    // Use getAllByText since there might be multiple matches
    const hispanicElements = screen.getAllByText(/hispanic/i)
    expect(hispanicElements.length).toBeGreaterThan(0)
    const aaElements = screen.getAllByText(/african american/i)
    expect(aaElements.length).toBeGreaterThan(0)
    
    // Local Strategy should NOT be visible
    expect(screen.queryByText(/📍 local strategy/i)).not.toBeInTheDocument()
  })

  it('displays both strategy sections for local_multicultural campaigns', () => {
    const program = createMockProgram('local_multicultural', true, true)
    render(<ProgramResult result={program} />)
    
    // Both sections should be visible
    expect(screen.getByText(/📍 local strategy/i)).toBeInTheDocument()
    expect(screen.getByText(/🌍 multicultural strategy/i)).toBeInTheDocument()
    
    // Verify local content - use getAllByText since "Miami" appears in both DMA and segment name
    const miamiElements = screen.getAllByText(/miami/i)
    expect(miamiElements.length).toBeGreaterThan(0)
    
    // Verify multicultural content
    const hispanicElements = screen.getAllByText(/hispanic/i)
    expect(hispanicElements.length).toBeGreaterThan(0)
  })

  it('hides strategy sections for national campaigns', () => {
    const program = createMockProgram('national', false, false)
    render(<ProgramResult result={program} />)
    
    // Strategy sections should NOT be visible
    expect(screen.queryByText(/📍 local strategy/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/🌍 multicultural strategy/i)).not.toBeInTheDocument()
  })

  it('displays local strategy insights and recommendations', () => {
    const program = createMockProgram('local', true, false)
    render(<ProgramResult result={program} />)
    
    // Expand local strategy section
    const localStrategyButton = screen.getByText(/📍 local strategy/i).closest('button')
    if (localStrategyButton) {
      localStrategyButton.click()
    }
    
    expect(screen.getByText(/local insights/i)).toBeInTheDocument()
    // Use getAllByText since "Recommendations" appears as both heading and in content
    const recommendationsElements = screen.getAllByText(/recommendations/i)
    expect(recommendationsElements.length).toBeGreaterThan(0)
  })

  it('displays multicultural strategy insights and recommendations', () => {
    const program = createMockProgram('multicultural', false, true)
    render(<ProgramResult result={program} />)
    
    // Expand multicultural strategy section
    const mcStrategyButton = screen.getByText(/🌍 multicultural strategy/i).closest('button')
    if (mcStrategyButton) {
      mcStrategyButton.click()
    }
    
    // Use getAllByText since "Multicultural Insights" appears as both heading and in content
    const insightsElements = screen.getAllByText(/multicultural insights/i)
    expect(insightsElements.length).toBeGreaterThan(0)
    const recommendationsElements = screen.getAllByText(/recommendations/i)
    expect(recommendationsElements.length).toBeGreaterThan(0)
  })
})
