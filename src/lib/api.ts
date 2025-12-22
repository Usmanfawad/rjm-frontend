import type {
  ApiResponse,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
  GenerateProgramRequest,
  GenerateProgramResponse,
  MiraChatRequest,
  MiraChatResponse,
  TranscriptionResponse,
  PersonaGeneration,
  PersonaGenerationListResponse,
} from '@/types/api';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
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

  getToken(): string | null {
    if (this.token) return this.token;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
    return this.token;
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

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Request failed',
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

  // Auth endpoints
  async login(credentials: LoginRequest): Promise<ApiResponse<TokenResponse>> {
    return this.request<TokenResponse>('/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  }

  async register(data: RegisterRequest): Promise<ApiResponse<TokenResponse>> {
    return this.request<TokenResponse>('/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    return this.request<User>('/v1/auth/me');
  }

  async confirmEmail(token: string, email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/confirm-email', {
      method: 'POST',
      body: JSON.stringify({ token, email, type: 'signup' }),
    });
  }

  async resendConfirmation(email: string): Promise<ApiResponse<void>> {
    return this.request<void>('/v1/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email }),
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

  // Health endpoints
  async checkHealth(): Promise<ApiResponse<{ status: string }>> {
    return this.request<{ status: string }>('/health/db');
  }

  async getStatus(): Promise<ApiResponse<{ build_number: string; environment: string }>> {
    return this.request<{ build_number: string; environment: string }>('/status');
  }

  // Logout
  logout() {
    this.setToken(null);
  }
}

export const api = new ApiClient(API_BASE_URL);
