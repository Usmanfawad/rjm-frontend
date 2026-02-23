// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  detail?: string;
  metadata?: {
    app_name: string;
    app_version: string;
    timestamp: string;
  };
}

// ============================================
// AUTH TYPES (M1)
// ============================================

export interface User {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  is_active?: boolean;
  is_verified?: boolean;
  created_at: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface SignUpRequest {
  email: string;
  password: string;
  full_name?: string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refresh_token: string;
}

// Legacy types for backward compatibility
export interface LoginRequest extends SignInRequest {}
export interface RegisterRequest extends SignUpRequest {}
export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
}

// Auth management request types
export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  new_password: string;
}

export interface UpdateProfileRequest {
  full_name?: string;
  username?: string;
}

export interface DeleteAccountRequest {
  password: string;
}

// ============================================
// ORGANIZATION TYPES (M1)
// ============================================

export type MemberRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  tier?: string;
  is_active?: boolean;
  settings?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface CreateOrganizationRequest {
  name: string;
  slug?: string;
  settings?: Record<string, any>;
}

export interface UpdateOrganizationRequest {
  name?: string;
  slug?: string;
  settings?: Record<string, any>;
}

export interface OrganizationMember {
  id: string;
  user_id: string;
  role: MemberRole;
  email: string;
  username?: string;
  full_name?: string;
  is_active: boolean;
  invited_at?: string;
  accepted_at?: string;
  created_at: string;
}

export interface InviteMemberRequest {
  email: string;
  role: MemberRole;
}

export interface UpdateMemberRoleRequest {
  role: MemberRole;
}

// ============================================
// DOCUMENT TYPES (M2)
// ============================================

export type DocumentStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface Document {
  id: string;
  title: string;
  filename: string;
  original_filename?: string;
  file_type: string;
  file_size: number;
  mime_type?: string;
  status: DocumentStatus;
  processing_error?: string;
  word_count?: number;
  page_count?: number;
  chunk_count: number;
  is_vectorized?: boolean;
  org_id?: string;
  tags?: string[];
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentListQuery {
  org_id?: string;
  status?: DocumentStatus;
  limit?: number;
  offset?: number;
}

export interface DocumentListResponse {
  documents: Document[];
  total: number;
}

export interface DocumentStatusResponse {
  document_id: string;
  status: DocumentStatus;
  processing_error?: string;
  progress?: Record<string, unknown>;
}

export interface DocumentSearchRequest {
  query: string;
  org_id?: string;
  limit?: number;
  min_score?: number;
}

export interface DocumentSearchResult {
  document_id: string;
  document_title: string;
  chunk_text: string;
  score: number;
}

export interface DocumentSearchResponse {
  results: DocumentSearchResult[];
}

// ============================================
// ENUMS
// ============================================

export type OperationalState =
  | 'draft'
  | 'approved'
  | 'requested_for_activation'
  | 'in_progress'
  | 'live'
  | 'archived';

export type GovernedObjectType =
  | 'persona_program'
  | 'custom_persona'
  | 'activation_plan'
  | 'campaign_package'
  | 'document'
  | 'external_execution_request';

export type OperationalEventType =
  | 'state_transition'
  | 'approval'
  | 'activation_request'
  | 'archival';

export type ApprovalType = 'strategic' | 'operational';

// ============================================
// RJM Types
// ============================================

export interface Persona {
  name: string;
  category?: string;
  phylum?: string;
  highlight?: string;
}

export interface GenerationalSegment {
  name: string;
  highlight?: string;
}

export interface LocalStrategy {
  dmas?: string[];
  segments?: string[];
  insights?: string[];
  recommendations?: string[];
}

export interface MulticulturalStrategy {
  lineages?: string[];
  expressions?: string[];
  insights?: string[];
  recommendations?: string[];
}

export interface ProgramJSON {
  header: string;
  advertising_category?: string;
  campaign_type?: 'national' | 'local' | 'multicultural' | 'local_multicultural';
  key_identifiers: string[];
  personas: Persona[];
  generational_segments: GenerationalSegment[];
  category_anchors: string[];
  multicultural_expressions: string[];
  multicultural_lineages?: string[];
  local_culture_segments: string[];
  cultural_activation_summary?: string;
  persona_insights: string[];
  demos: {
    core?: string;
    secondary?: string;
    broad_demo?: string;
  };
  activation_plan: string[];
  // M4 Strategy Layers
  strategy_layers?: {
    local_strategy?: LocalStrategy;
    multicultural_strategy?: MulticulturalStrategy;
  };
  // Document context metadata (injected by backend at save time)
  _document_context?: DocumentContextEntry[];
}

export interface DocumentContextEntry {
  id: string;
  title: string | null;
  status: 'applied' | 'not_available' | 'error';
}

export interface GenerateProgramRequest {
  brand_name: string;
  brief: string;
  document_ids?: string[];
  multicultural_lineages?: string[];
  local_dmas?: string[];
}

export interface GenerateProgramResponse {
  generation_id?: string;  // Present when user is authenticated and saved to DB
  program_json: ProgramJSON;
  program_text: string;
}

// ============================================
// MIRA Chat Types
// ============================================

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MiraChatRequest {
  messages: ChatMessage[];
  state?: string;
  session_id?: string;
  brand_name?: string;
  brief?: string;
  document_ids?: string[];
}

export interface MiraChatResponse {
  reply: string;
  state: string;
  session_id?: string;
  debug_state_was?: string;
  generation_data?: {
    brand_name: string;
    brief: string;
    program_text: string;
    program_json: string;
    advertising_category?: string;
  };
}

// Query Types
export interface QueryRequest {
  query: string;
  top_k?: number;
  include_metadata?: boolean;
  filters?: Record<string, unknown>;
}

export interface QueryResult {
  id: string;
  score: number;
  content: string;
  metadata?: Record<string, unknown>;
}

export interface QueryResponse {
  results: QueryResult[];
  query: string;
  total_results: number;
  processing_time_ms: number;
}

// Transcription Types
export interface TranscriptionResponse {
  text: string;
  duration_seconds?: number;
}

// Persona Generation Types
export interface PersonaGeneration {
  id: string;
  brand_name: string;
  brief: string;
  program_text: string;
  program_json?: ProgramJSON;
  advertising_category?: string;
  source: 'generator' | 'chat';
  created_at: string;
}

export interface PersonaGenerationListResponse {
  generations: PersonaGeneration[];
  total: number;
}

export interface PersonaCanonEntry {
  name: string;
  category: string;
}

export interface PersonaCanonSearchResponse {
  personas: PersonaCanonEntry[];
  total: number;
}

export interface UpdateGenerationRequest {
  program_json?: ProgramJSON;
  program_text?: string;
  brand_name?: string;
}

// Chat Session Types
export interface ChatSession {
  id: string;
  title: string | null;
  brand_name: string | null;
  brief: string | null;
  category: string | null;
  current_state: string;
  message_count: number;
  created_at: string;
  updated_at: string;
}

export interface ChatSessionMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  state_before: string | null;
  state_after: string | null;
  created_at: string;
}

export interface ChatSessionDetail extends ChatSession {
  messages: ChatSessionMessage[];
}

export interface ChatSessionListResponse {
  sessions: ChatSession[];
  total: number;
}

export interface ChatSessionDeleteResponse {
  deleted: boolean;
  session_id: string;
}

// Chat Session Summary (for list view)
export interface ChatSessionSummary {
  id: string;
  title?: string;
  brand_name?: string;
  category?: string;
  message_count: number;
  current_state: string;
  created_at: string;
  updated_at: string;
}

// Chat Message Response (for session detail)
export interface ChatMessageResponse {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  state_before?: string;
  state_after?: string;
  created_at: string;
}

// Chat Session Detail Response
export interface ChatSessionDetailResponse {
  id: string;
  title?: string;
  brand_name?: string;
  brief?: string;
  category?: string;
  current_state: string;
  messages: ChatMessageResponse[];
  created_at: string;
  updated_at: string;
}

// ============================================
// GOVERNANCE TYPES (M3)
// ============================================

export interface GovernedObjectResponse {
  id: string;
  object_type: GovernedObjectType;
  reference_id: string;
  reference_table: string;
  current_state: OperationalState;
  version: number;
  supersedes?: string;
  superseded_by?: string;
  org_id?: string;
  creator_id: string;
  approver_id?: string;
  requestor_id?: string;
  current_responsible_id: string;
  escalation_authority_id?: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
  is_valid: boolean;
  validation_errors: string[];
  created_at: string;
  updated_at: string;
  approved_at?: string;
  activated_at?: string;
  archived_at?: string;
}

export interface RegisterObjectRequest {
  object_type: GovernedObjectType;
  reference_id: string;
  reference_table: string;
  title?: string;
  description?: string;
  org_id?: string;
  metadata?: Record<string, any>;
}

export interface TransitionStateRequest {
  to_state: OperationalState;
  reason?: string;
}

export interface TransitionResponse {
  object: GovernedObjectResponse;
  event: OperationalEventResponse;
  message: string;
}

export interface ApproveObjectRequest {
  approval_type: ApprovalType;
  notes?: string;
}

export interface ApprovalRecordResponse {
  id: string;
  object_id: string;
  approval_type: ApprovalType;
  approved_by: string;
  approved_at: string;
  notes?: string;
}

export interface OperationalEventResponse {
  id: string;
  object_id: string;
  event_type: OperationalEventType;
  from_state?: OperationalState;
  to_state: OperationalState;
  triggered_by: string;
  occurred_at: string;
  reason?: string;
}

export interface ApprovalsListResponse {
  object_id: string;
  approvals: ApprovalRecordResponse[];
  total: number;
}

export interface EventHistoryResponse {
  object_id: string;
  events: OperationalEventResponse[];
  total: number;
}

export interface TransferOwnershipRequest {
  to_user_id: string;
  reason?: string;
}

export interface OwnershipChange {
  id: string;
  object_id: string;
  from_user_id?: string;
  to_user_id: string;
  changed_by: string;
  reason?: string;
  occurred_at: string;
}

export interface OwnershipResponse {
  object_id: string;
  current: {
    creator_id: string;
    approver_id?: string;
    requestor_id?: string;
    current_responsible_id: string;
    escalation_authority_id?: string;
  };
  history: OwnershipChange[];
}

export interface ValidationResponse {
  object_id: string;
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface SupersedeResponse {
  original: GovernedObjectResponse;
  new_version: GovernedObjectResponse;
  message: string;
}

export interface DashboardStatsResponse {
  draft_count: number;
  approved_count: number;
  requested_count: number;
  in_progress_count: number;
  live_count: number;
  archived_count: number;
  total_count: number;
}

export interface DashboardObjectSummary {
  id: string;
  object_type: GovernedObjectType;
  current_state: OperationalState;
  title?: string;
  version: number;
  created_at: string;
  updated_at: string;
  creator_email?: string;
  responsible_email?: string;
  org_name?: string;
}

export interface DashboardResponse {
  stats: DashboardStatsResponse;
  recent_objects: DashboardObjectSummary[];
  pending_approvals: DashboardObjectSummary[];
  my_objects: DashboardObjectSummary[];
}

// Governance List Query Parameters
export interface GovernanceListQuery {
  state?: OperationalState;
  object_type?: GovernedObjectType;
  org_id?: string;
  limit?: number;
  offset?: number;
}

// ============================================
// CAMPAIGN TYPES (Phase 2 — Lifecycle View)
// ============================================

export type CampaignLifecycleState =
  | 'ideation'
  | 'draft'
  | 'review'
  | 'finalized'
  | 'activated'
  | 'archived';

/**
 * Unified campaign view merging PersonaGeneration + optional GovernedObjectResponse.
 * This is a frontend-only view model — no backend changes required.
 */
export interface CampaignView {
  id: string;
  brand_name: string;
  brief: string;
  program_text: string;
  program_json?: ProgramJSON;
  advertising_category?: string;
  source: 'generator' | 'chat';
  created_at: string;

  // Lifecycle state (derived from governance or default to ideation)
  lifecycle_state: CampaignLifecycleState;

  // Governance fields (optional — only present if governed)
  governance_id?: string;
  governance_version?: number;
  governance_title?: string;
  approved_at?: string;
  activated_at?: string;
  archived_at?: string;
}

// ============================================
// USAGE TRACKING TYPES
// ============================================

export interface RateLimitInfo {
  tier: string;
  requests_per_minute: number;
  requests_per_hour: number;
  requests_per_day: number;
  max_tokens_per_request: number;
  max_generations_per_day: number;
  max_chat_messages_per_day: number;
}

export interface UsageStatsResponse {
  user_id: string;
  period: string;
  total_requests: number;
  total_generations: number;
  total_chat_messages: number;
  total_tokens_used: number;
  rate_limit: RateLimitInfo;
  requests_remaining_today: number;
  generations_remaining_today: number;
}
