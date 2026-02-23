import type {
  ApiResponse,
  // Auth types (M1)
  SignUpRequest,
  SignInRequest,
  RefreshTokenRequest,
  AuthResponse,
  User,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  DeleteAccountRequest,
  // Organization types (M1)
  Organization,
  CreateOrganizationRequest,
  UpdateOrganizationRequest,
  OrganizationMember,
  InviteMemberRequest,
  UpdateMemberRoleRequest,
  // Document types (M2)
  Document,
  DocumentListQuery,
  DocumentListResponse,
  DocumentStatusResponse,
  DocumentSearchRequest,
  DocumentSearchResponse,
  // RJM types
  GenerateProgramRequest,
  GenerateProgramResponse,
  MiraChatRequest,
  MiraChatResponse,
  TranscriptionResponse,
  PersonaGeneration,
  PersonaGenerationListResponse,
  ChatSessionListResponse,
  ChatSessionDetail,
  ChatSessionDetailResponse,
  ChatSessionDeleteResponse,
  // Usage tracking
  UsageStatsResponse,
  // Governance types (M3)
  GovernedObjectResponse,
  RegisterObjectRequest,
  TransitionStateRequest,
  TransitionResponse,
  ApproveObjectRequest,
  ApprovalRecordResponse,
  ApprovalsListResponse,
  OperationalEventResponse,
  EventHistoryResponse,
  TransferOwnershipRequest,
  OwnershipResponse,
  ValidationResponse,
  SupersedeResponse,
  DashboardResponse,
  DashboardStatsResponse,
  GovernanceListQuery,
} from '@/types/api';
import { createAppError, logError, ErrorType } from '@/lib/errors';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'; //|| 'https://rjm-backend.onrender.com';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorized = callback;
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('auth_token', token);
      } else {
        localStorage.removeItem('auth_token');
      }
    }
  }

  setRefreshToken(token: string | null) {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('refresh_token', token);
      } else {
        localStorage.removeItem('refresh_token');
      }
    }
  }

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
  }

  private handleUnauthorized() {
    this.setToken(null);
    if (this.onUnauthorized) {
      this.onUnauthorized();
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        // For auth endpoints (login/register), preserve the backend's error message
        const isAuthEndpoint = endpoint.includes('/auth/login') || endpoint.includes('/auth/register') || endpoint.includes('/auth/signup');
        
        if (isAuthEndpoint) {
          // Read the response to get the actual error message
          const data = await response.json().catch(() => ({}));
          return {
            success: false,
            error: data.detail || data.error || 'Invalid email or password',
            detail: data.detail || data.error || 'Invalid email or password. Please check your credentials and try again.',
          };
        }
        
        // For authenticated requests, treat as session expiration
        if (token) {
          this.handleUnauthorized();
          return {
            success: false,
            error: 'Unauthorized',
            detail: 'Your session has expired. Please login again.',
          };
        }
        
        // For unauthenticated requests to protected endpoints, return generic error
        const data = await response.json().catch(() => ({}));
        return {
          success: false,
          error: data.detail || data.error || 'Unauthorized',
          detail: data.detail || data.error || 'You are not authorized to perform this action.',
        };
      }

      // Handle 429 Rate Limit - too many requests
      if (response.status === 429) {
        const data = await response.json().catch(() => ({}));
        return {
          success: false,
          error: 'Rate limit exceeded',
          detail: data.detail || data.error || 'Too many requests. Please wait a moment and try again.',
        };
      }

      const data = await response.json();

      if (!response.ok) {
        // For 404 errors with user-friendly messages, preserve them directly
        if (response.status === 404 && data.detail) {
          const detail = data.detail.toLowerCase();
          const isUserFriendly = 
            (detail.includes('user') && detail.includes('email')) ||
            detail.includes('must create an account') ||
            detail.includes('create an account first');
          
          if (isUserFriendly) {
            return {
              success: false,
              error: data.detail, // Preserve the exact backend message
              detail: data.detail,
            };
          }
        }
        
        // Create sanitized error for other cases
        const appError = createAppError(
          {
            detail: data.detail || data.error || response.statusText,
            status: response.status,
            error: data.error,
          },
          `API Request: ${endpoint}`
        );
        logError(appError, `API Request: ${endpoint}`);

        return {
          success: false,
          error: data.message || appError.userMessage, // Prefer backend's user-friendly message
          detail: appError.message, // Sanitized detail for logging
        };
      }

      return data;
    } catch (error) {
      // Handle network errors
      const appError = createAppError(error, `API Request: ${endpoint}`);
      logError(appError, `API Request: ${endpoint}`);
      
      return {
        success: false,
        error: appError.userMessage,
        detail: appError.message,
      };
    }
  }

  // ============================================
  // AUTH ENDPOINTS (M1)
  // ============================================

  /**
   * Sign up a new user
   */
  async signUp(data: SignUpRequest): Promise<ApiResponse<AuthResponse>> {
    // Try /v1/auth/register first (most common), fallback to /v1/auth/signup
    return this.request<AuthResponse>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Sign in an existing user
   */
  async signIn(credentials: SignInRequest): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  /**
   * Refresh access token
   */
  async refreshToken(
    data: RefreshTokenRequest
  ): Promise<ApiResponse<AuthResponse>> {
    return this.request<AuthResponse>('/v1/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * Sign out (invalidate current session)
   */
  async signOut(): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/signout', {
      method: 'POST',
    });
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/v1/auth/me');
  }

  // Legacy methods for backward compatibility
  async login(credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    const result = await this.signIn(credentials);
    if (result.success && result.data && result.data.user) {
      // Convert AuthResponse to TokenResponse format
      return {
        success: true,
        data: {
          access_token: result.data.access_token,
          token_type: 'Bearer',
          expires_in: result.data.expires_in,
          user_id: result.data.user.id,
          email: result.data.user.email,
        },
        message: result.message,
      };
    }
    return result as unknown as ApiResponse<TokenResponse>;
  }

  async register(data: RegisterRequest): Promise<ApiResponse<TokenResponse>> {
    const result = await this.signUp(data);
    if (result.success && result.data) {
      // Convert AuthResponse to TokenResponse format
      return {
        success: true,
        data: {
          access_token: result.data.access_token,
          token_type: 'Bearer',
          expires_in: result.data.expires_in,
          user_id: result.data.user.id,
          email: result.data.user.email,
        },
        message: result.message,
      };
    }
    return result as unknown as ApiResponse<TokenResponse>;
  }

  // ============================================
  // AUTH MANAGEMENT ENDPOINTS
  // ============================================

  async changePassword(data: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email } as ForgotPasswordRequest),
    });
  }

  async resetPassword(data: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProfile(data: UpdateProfileRequest): Promise<ApiResponse<User>> {
    return this.request<User>('/v1/auth/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async deleteAccount(password: string): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/account', {
      method: 'DELETE',
      body: JSON.stringify({ password } as DeleteAccountRequest),
    });
  }

  // Email confirmation - not yet implemented on backend
  async confirmEmail(_token: string, _email: string): Promise<ApiResponse<void>> {
    return { success: false, error: 'Email confirmation is not yet available.' };
  }

  async resendConfirmation(_email: string): Promise<ApiResponse<void>> {
    return { success: false, error: 'Email confirmation is not yet available.' };
  }

  // ============================================
  // ORGANIZATION ENDPOINTS (M1)
  // ============================================

  /**
   * Create a new organization
   */
  async createOrganization(
    data: CreateOrganizationRequest
  ): Promise<ApiResponse<Organization>> {
    return this.request<Organization>('/v1/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * List user's organizations
   */
  async listOrganizations(): Promise<ApiResponse<Organization[]>> {
    const response = await this.request<{ organizations: Organization[]; total: number }>('/v1/organizations');
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.organizations,
        message: response.message,
        metadata: response.metadata,
      };
    }
    return {
      success: false,
      error: response.error || 'Failed to fetch organizations',
      detail: response.detail,
    };
  }

  /**
   * Get organization by ID
   */
  async getOrganization(orgId: string): Promise<ApiResponse<Organization>> {
    return this.request<Organization>(`/v1/organizations/${orgId}`);
  }

  /**
   * Update organization
   */
  async updateOrganization(
    orgId: string,
    data: UpdateOrganizationRequest
  ): Promise<ApiResponse<Organization>> {
    return this.request<Organization>(`/v1/organizations/${orgId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Invite a member to an organization
   */
  async inviteMember(
    orgId: string,
    data: InviteMemberRequest
  ): Promise<ApiResponse<OrganizationMember>> {
    return this.request<OrganizationMember>(
      `/v1/organizations/${orgId}/members`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * List organization members
   */
  async listMembers(
    orgId: string
  ): Promise<ApiResponse<OrganizationMember[]>> {
    const response = await this.request<{ members: OrganizationMember[]; total: number }>(
      `/v1/organizations/${orgId}/members`
    );
    if (response.success && response.data) {
      return {
        success: true,
        data: response.data.members,
        message: response.message,
        metadata: response.metadata,
      };
    }
    return {
      success: false,
      error: response.error || 'Failed to fetch members',
      detail: response.detail,
    };
  }

  /**
   * Update member role
   */
  async updateMemberRole(
    orgId: string,
    userId: string,
    data: UpdateMemberRoleRequest
  ): Promise<ApiResponse<OrganizationMember>> {
    return this.request<OrganizationMember>(
      `/v1/organizations/${orgId}/members/${userId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Remove member from organization
   */
  async removeMember(
    orgId: string,
    userId: string
  ): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/organizations/${orgId}/members/${userId}`, {
      method: 'DELETE',
    });
  }

  // ============================================
  // DOCUMENT ENDPOINTS (M2)
  // ============================================

  /**
   * Upload a document
   */
  async uploadDocument(
    file: File,
    title?: string,
    description?: string,
    orgId?: string,
    tags?: string[]
  ): Promise<ApiResponse<Document>> {
    const url = `${this.baseUrl}/v1/documents/upload`;
    const token = this.getToken();

    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);
    if (description) formData.append('description', description);
    if (orgId) formData.append('org_id', orgId);
    if (tags && tags.length > 0) {
      formData.append('tags', tags.join(','));
    }

    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (response.status === 401) {
        this.handleUnauthorized();
        return {
          success: false,
          error: 'Unauthorized',
          detail: 'Your session has expired. Please login again.',
        };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Upload failed',
          detail: data.detail || response.statusText,
        };
      }

      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        detail: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * List documents with optional filters
   */
  async listDocuments(
    query?: DocumentListQuery
  ): Promise<ApiResponse<DocumentListResponse>> {
    const params = new URLSearchParams();
    if (query?.org_id) params.append('org_id', query.org_id);
    if (query?.status) params.append('status', query.status);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/v1/documents?${queryString}`
      : '/v1/documents';

    return this.request<DocumentListResponse>(endpoint);
  }

  /**
   * Get a single document
   */
  async getDocument(docId: string): Promise<ApiResponse<Document>> {
    return this.request<Document>(`/v1/documents/${docId}`);
  }

  /**
   * Get document processing status
   */
  async getDocumentStatus(
    docId: string
  ): Promise<ApiResponse<DocumentStatusResponse>> {
    return this.request<DocumentStatusResponse>(
      `/v1/documents/${docId}/status`
    );
  }

  /**
   * Delete a document
   */
  async deleteDocument(docId: string): Promise<ApiResponse<void>> {
    return this.request<void>(`/v1/documents/${docId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Search documents semantically
   */
  async searchDocuments(
    data: DocumentSearchRequest
  ): Promise<ApiResponse<DocumentSearchResponse>> {
    return this.request<DocumentSearchResponse>('/v1/documents/search', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // RJM endpoints
  async generateProgram(
    data: GenerateProgramRequest
  ): Promise<ApiResponse<GenerateProgramResponse>> {
    return this.request<GenerateProgramResponse>('/v1/rjm/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async syncDocuments(): Promise<ApiResponse<{ summary: string }>> {
    return this.request<{ summary: string }>('/v1/rjm/sync', {
      method: 'POST',
    });
  }

  async chat(data: MiraChatRequest): Promise<ApiResponse<MiraChatResponse>> {
    return this.request<MiraChatResponse>('/v1/rjm/chat', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Chat Session endpoints
  async getChatSessions(): Promise<ApiResponse<ChatSessionListResponse>> {
    return this.request<ChatSessionListResponse>('/v1/rjm/sessions');
  }

  async getChatSession(sessionId: string): Promise<ApiResponse<ChatSessionDetail>> {
    return this.request<ChatSessionDetail>(`/v1/rjm/sessions/${sessionId}`);
  }

  async resumeChatSession(
    sessionId: string
  ): Promise<ApiResponse<ChatSessionDetailResponse>> {
    return this.request<ChatSessionDetailResponse>(
      `/v1/rjm/sessions/${sessionId}/resume`,
      {
        method: 'POST',
      }
    );
  }

  async deleteChatSession(sessionId: string): Promise<ApiResponse<ChatSessionDeleteResponse>> {
    return this.request<ChatSessionDeleteResponse>(`/v1/rjm/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  // Transcription endpoint
  async transcribeAudio(
    audioBlob: Blob,
    language?: string,
    prompt?: string
  ): Promise<ApiResponse<TranscriptionResponse>> {
    const url = `${this.baseUrl}/v1/rjm/transcribe`;
    const token = this.getToken();

    // Clean up MIME type - remove codec suffix (e.g., "audio/webm;codecs=opus" -> "audio/webm")
    const originalType = audioBlob.type;
    const cleanType = originalType.split(';')[0] || 'audio/webm';
    
    // Determine file extension from clean MIME type
    const extensionMap: Record<string, string> = {
      'audio/webm': 'webm',
      'audio/mp4': 'm4a',
      'audio/mpeg': 'mp3',
      'audio/wav': 'wav',
      'audio/ogg': 'ogg',
    };
    const extension = extensionMap[cleanType] || 'webm';
    
    // Create a new blob with clean MIME type
    const cleanBlob = new Blob([audioBlob], { type: cleanType });

    const formData = new FormData();
    formData.append('file', cleanBlob, `recording.${extension}`);
    if (language) {
      formData.append('language', language);
    }
    if (prompt) {
      formData.append('prompt', prompt);
    }

    try {
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      // Handle 401 Unauthorized - token is invalid or expired
      if (response.status === 401) {
        this.handleUnauthorized();
        return {
          success: false,
          error: 'Unauthorized',
          detail: 'Your session has expired. Please login again.',
        };
      }

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Transcription failed',
          detail: data.detail || response.statusText,
        };
      }

      // Backend returns wrapped response { success, data, message }
      return data;
    } catch (error) {
      return {
        success: false,
        error: 'Network error',
        detail: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Persona Generation endpoints
  async getPersonaGenerations(
    limit: number = 50,
    offset: number = 0
  ): Promise<ApiResponse<PersonaGenerationListResponse>> {
    return this.request<PersonaGenerationListResponse>(
      `/v1/rjm/generations?limit=${limit}&offset=${offset}`
    );
  }

  async getPersonaGeneration(
    generationId: string
  ): Promise<ApiResponse<PersonaGeneration>> {
    return this.request<PersonaGeneration>(`/v1/rjm/generations/${generationId}`);
  }

  async updatePersonaGeneration(
    generationId: string,
    updates: import('@/types/api').UpdateGenerationRequest
  ): Promise<ApiResponse<PersonaGeneration>> {
    return this.request<PersonaGeneration>(`/v1/rjm/generations/${generationId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async searchPersonaCanon(
    query?: string,
    category?: string,
    limit: number = 50
  ): Promise<ApiResponse<import('@/types/api').PersonaCanonSearchResponse>> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    params.set('limit', String(limit));
    return this.request<import('@/types/api').PersonaCanonSearchResponse>(
      `/v1/rjm/personas?${params.toString()}`
    );
  }

  // Health endpoints
  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health/db');
  }

  async getStatus(): Promise<ApiResponse<{ build_number: string; environment: string }>> {
    return this.request<{ build_number: string; environment: string }>('/status');
  }

  // Logout - clears tokens and calls server signout
  logout() {
    // Fire-and-forget server-side signout (don't block on it)
    if (this.getToken()) {
      this.signOut().catch(() => {});
    }
    this.setToken(null);
    this.setRefreshToken(null);
  }

  // ============================================
  // USAGE TRACKING ENDPOINTS
  // ============================================

  /**
   * Get usage statistics for the current user
   */
  async getUsageStats(
    period: string = 'today'
  ): Promise<ApiResponse<UsageStatsResponse>> {
    return this.request<UsageStatsResponse>(
      `/v1/organizations/usage/stats?period=${period}`
    );
  }

  // ============================================
  // GOVERNANCE ENDPOINTS (M3)
  // ============================================

  /**
   * Register an object for governance
   */
  async registerObject(
    data: RegisterObjectRequest
  ): Promise<ApiResponse<GovernedObjectResponse>> {
    return this.request<GovernedObjectResponse>('/v1/governance/objects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  /**
   * List governed objects with optional filters
   */
  async listGovernedObjects(
    query?: GovernanceListQuery
  ): Promise<ApiResponse<{ objects: GovernedObjectResponse[]; total: number }>> {
    const params = new URLSearchParams();
    if (query?.state) params.append('state', query.state);
    if (query?.object_type) params.append('object_type', query.object_type);
    if (query?.org_id) params.append('org_id', query.org_id);
    if (query?.limit) params.append('limit', query.limit.toString());
    if (query?.offset) params.append('offset', query.offset.toString());

    const queryString = params.toString();
    const endpoint = queryString
      ? `/v1/governance/objects?${queryString}`
      : '/v1/governance/objects';

    return this.request<{ objects: GovernedObjectResponse[]; total: number }>(endpoint);
  }

  /**
   * Update a governed object (draft only)
   */
  async updateGovernedObject(
    objectId: string,
    data: { title?: string; description?: string; metadata?: Record<string, any> }
  ): Promise<ApiResponse<GovernedObjectResponse>> {
    return this.request<GovernedObjectResponse>(`/v1/governance/objects/${objectId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  /**
   * Get a single governed object by ID
   */
  async getGovernedObject(
    objectId: string
  ): Promise<ApiResponse<GovernedObjectResponse>> {
    return this.request<GovernedObjectResponse>(`/v1/governance/objects/${objectId}`);
  }

  /**
   * Transition a governed object to a new state
   */
  async transitionState(
    objectId: string,
    data: TransitionStateRequest
  ): Promise<ApiResponse<TransitionResponse>> {
    return this.request<TransitionResponse>(
      `/v1/governance/objects/${objectId}/transition`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Approve a governed object
   */
  async approveObject(
    objectId: string,
    data: ApproveObjectRequest
  ): Promise<ApiResponse<GovernedObjectResponse>> {
    return this.request<GovernedObjectResponse>(
      `/v1/governance/objects/${objectId}/approve`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Get approval records for a governed object
   */
  async getApprovals(
    objectId: string
  ): Promise<ApiResponse<ApprovalsListResponse>> {
    return this.request<ApprovalsListResponse>(
      `/v1/governance/objects/${objectId}/approvals`
    );
  }

  /**
   * Get event history for a governed object
   */
  async getEventHistory(
    objectId: string,
    limit: number = 50
  ): Promise<ApiResponse<EventHistoryResponse>> {
    return this.request<EventHistoryResponse>(
      `/v1/governance/objects/${objectId}/events?limit=${limit}`
    );
  }

  /**
   * Validate a governed object
   */
  async validateObject(
    objectId: string
  ): Promise<ApiResponse<ValidationResponse>> {
    return this.request<ValidationResponse>(
      `/v1/governance/objects/${objectId}/validate`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Transfer responsibility of a governed object
   */
  async transferOwnership(
    objectId: string,
    data: TransferOwnershipRequest
  ): Promise<ApiResponse<GovernedObjectResponse>> {
    return this.request<GovernedObjectResponse>(
      `/v1/governance/objects/${objectId}/transfer`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  /**
   * Get ownership history for a governed object
   */
  async getOwnershipHistory(
    objectId: string
  ): Promise<ApiResponse<OwnershipResponse>> {
    return this.request<OwnershipResponse>(
      `/v1/governance/objects/${objectId}/ownership`
    );
  }

  /**
   * Supersede a governed object (create new version)
   */
  async supersedeObject(
    objectId: string
  ): Promise<ApiResponse<SupersedeResponse>> {
    return this.request<SupersedeResponse>(
      `/v1/governance/objects/${objectId}/supersede`,
      {
        method: 'POST',
      }
    );
  }

  /**
   * Get governance dashboard data
   */
  async getDashboard(
    orgId?: string
  ): Promise<ApiResponse<DashboardResponse>> {
    const endpoint = orgId
      ? `/v1/governance/dashboard?org_id=${orgId}`
      : '/v1/governance/dashboard';
    return this.request<DashboardResponse>(endpoint);
  }

  /**
   * Get dashboard stats only
   */
  async getDashboardStats(
    orgId?: string
  ): Promise<ApiResponse<DashboardStatsResponse>> {
    const endpoint = orgId
      ? `/v1/governance/dashboard/stats?org_id=${orgId}`
      : '/v1/governance/dashboard/stats';
    return this.request<DashboardStatsResponse>(endpoint);
  }
  // ============================================
  // CULTURAL ACTIVATION ENDPOINTS (M4)
  // ============================================

  async getCulturalConfig(): Promise<ApiResponse<any>> {
    return this.request<any>('/v1/cultural/config');
  }

  async updateCulturalConfig(data: any): Promise<ApiResponse<any>> {
    return this.request<any>('/v1/cultural/config', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getLineages(): Promise<ApiResponse<any>> {
    return this.request<any>('/v1/cultural/lineages');
  }

  async getLineage(name: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/v1/cultural/lineages/${encodeURIComponent(name)}`);
  }

  async getDmas(): Promise<ApiResponse<any>> {
    return this.request<any>('/v1/cultural/dmas');
  }

  async analyzeBrief(data: { brand_name: string; brief: string }): Promise<ApiResponse<any>> {
    return this.request<any>('/v1/cultural/analyze', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCulturalStats(): Promise<ApiResponse<any>> {
    return this.request<any>('/v1/cultural/stats');
  }

  async getCulturalPreview(params: { brief: string; lineages?: string; dmas?: string }): Promise<ApiResponse<any>> {
    const searchParams = new URLSearchParams();
    searchParams.append('brief', params.brief);
    if (params.lineages) searchParams.append('lineages', params.lineages);
    if (params.dmas) searchParams.append('dmas', params.dmas);
    return this.request<any>(`/v1/cultural/preview?${searchParams.toString()}`);
  }
}

export const api = new ApiClient(API_BASE_URL);
