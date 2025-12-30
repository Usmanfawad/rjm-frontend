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

// Auth Types
export interface User {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  is_active: boolean;
  is_verified: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username?: string;
  full_name?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  user_id: string;
  email: string;
}

// RJM Types
export interface Persona {
  name: string;
  category: string;
  phylum: string;
  highlight: string;
}

export interface GenerationalSegment {
  name: string;
  highlight: string;
}

export interface ProgramJSON {
  header: string;
  advertising_category: string;
  key_identifiers: string[];
  personas: Persona[];
  generational_segments: GenerationalSegment[];
  persona_insights: string[];
  demos: {
    core: string;
    secondary: string;
    broad: string;
  };
  activation_plan: string[];
}

export interface GenerateProgramRequest {
  brief: string;
  brand_name: string;
}

export interface GenerateProgramResponse {
  program_json: ProgramJSON;
  program_text: string;
}

// MIRA Chat Types
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
}

export interface MiraChatResponse {
  reply: string;
  state: string;
  session_id: string;
  debug_state_was?: string;
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
