// Mock API responses for testing
export const mockApi = {
  // Auth
  login: jest.fn(),
  register: jest.fn(),
  refreshToken: jest.fn(),
  
  // Persona Generation
  generateProgram: jest.fn(),
  getPersonaGenerations: jest.fn(),
  
  // Documents
  uploadDocument: jest.fn(),
  listDocuments: jest.fn(),
  getDocument: jest.fn(),
  getDocumentStatus: jest.fn(),
  deleteDocument: jest.fn(),
  searchDocuments: jest.fn(),
  
  // Organizations
  listOrganizations: jest.fn(),
  getOrganization: jest.fn(),
  createOrganization: jest.fn(),
  updateOrganization: jest.fn(),
  deleteOrganization: jest.fn(),
  inviteMember: jest.fn(),
  listMembers: jest.fn(),
  updateMemberRole: jest.fn(),
  removeMember: jest.fn(),
  
  // Governance
  registerObject: jest.fn(),
  getDashboard: jest.fn(),
  getDashboardStats: jest.fn(),
  listGovernedObjects: jest.fn(),
  getGovernedObject: jest.fn(),
  transitionState: jest.fn(),
  approveObject: jest.fn(),
  
  // Chat
  sendChatMessage: jest.fn(),
  getChatSessions: jest.fn(),
  getChatSession: jest.fn(),
  deleteChatSession: jest.fn(),
}

// Default mock implementations
mockApi.login.mockResolvedValue({
  success: true,
  data: {
    user: { id: '1', email: 'test@example.com', full_name: 'Test User' },
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
  },
})

mockApi.register.mockResolvedValue({
  success: true,
  data: {
    user: { id: '1', email: 'test@example.com', full_name: 'Test User' },
    access_token: 'mock-token',
    refresh_token: 'mock-refresh',
    expires_in: 3600,
  },
})

mockApi.generateProgram.mockResolvedValue({
  success: true,
  data: {
    generation_id: 'gen-1',
    program_json: {
      header: 'Test Brand Persona Program',
      advertising_category: 'CPG',
      key_identifiers: ['identifier1', 'identifier2'],
      personas: [
        { name: 'Persona 1', category: 'Category 1' },
        { name: 'Persona 2', category: 'Category 2' },
      ],
      generational_segments: [
        { name: 'Gen Z', highlight: 'Digital natives' },
      ],
      category_anchors: ['Anchor 1'],
      multicultural_expressions: [],
      local_culture_segments: [],
      persona_insights: ['Insight 1'],
      demos: { core: 'Core demo' },
      activation_plan: ['Step 1', 'Step 2'],
    },
    program_text: 'Full program text',
  },
})

mockApi.listDocuments.mockResolvedValue({
  success: true,
  data: {
    documents: [],
    total: 0,
  },
})

mockApi.listOrganizations.mockResolvedValue({
  success: true,
  data: [],
})

mockApi.getDashboard.mockResolvedValue({
  success: true,
  data: {
    stats: {
      draft_count: 0,
      approved_count: 0,
      requested_count: 0,
      in_progress_count: 0,
      live_count: 0,
      archived_count: 0,
      total_count: 0,
    },
    recent_objects: [],
    pending_approvals: [],
    my_objects: [],
  },
})

export default mockApi
