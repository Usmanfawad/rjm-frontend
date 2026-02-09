/**
 * Application-wide constants
 * Centralized configuration for maintainability
 */

// API Configuration
export const API_CONFIG = {
  DEFAULT_LIMIT: 50,
  DEFAULT_OFFSET: 0,
  MAX_FILE_SIZE: 25 * 1024 * 1024, // 25MB
  POLLING_INTERVAL: 2000, // 2 seconds
  MAX_POLL_ATTEMPTS: 30, // 1 minute max
} as const;

// Document Configuration
export const DOCUMENT_CONFIG = {
  ALLOWED_TYPES: ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'],
  ALLOWED_EXTENSIONS: ['.pdf', '.docx', '.txt', '.md'],
  MAX_SIZE: API_CONFIG.MAX_FILE_SIZE,
} as const;

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  DASHBOARD: '/dashboard',
  GENERATOR: '/generator',
  PERSONAS: '/personas',
  CHAT: '/chat',
  DOCUMENTS: '/documents',
  DOCUMENTS_SEARCH: '/documents/search',
  ORGANIZATIONS: '/organizations',
  ORGANIZATIONS_NEW: '/organizations/new',
  GOVERNANCE: '/governance',
  GOVERNANCE_OBJECTS: '/governance/objects',
  CULTURAL: '/cultural',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;

// Local Storage Keys
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  REFRESH_TOKEN: 'refresh_token',
  LAST_ORG_ID: 'lastOrgId',
  THEME: 'theme',
} as const;

// Success Messages (RJM Voice)
export const SUCCESS_MESSAGES = {
  DOCUMENT_UPLOADED: 'Document uploaded and processing.',
  DOCUMENT_DELETED: 'Document removed from your library.',
  ORGANIZATION_CREATED: 'Organization created successfully.',
  MEMBER_INVITED: 'Team member added successfully.',
  PROGRAM_REGISTERED: 'Program registered for governance.',
  PROGRAM_GENERATED: 'Your persona program is ready for review.',
  PROGRAM_SAVED: 'Program saved to your library.',
  PROGRAM_APPROVED: 'Program approved and ready for activation.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  ACCOUNT_DELETED: 'Your account has been deleted.',
  RESET_EMAIL_SENT: 'If an account exists with that email, a reset link has been sent.',
  PASSWORD_RESET: 'Password has been reset. You can now log in.',
  SIGNED_OUT: 'You have been signed out.',
} as const;

// Loading States (RJM Voice)
export const LOADING_STATES = {
  GENERATING: 'Building your persona program...',
  ANALYZING: 'Analyzing your brief...',
  SELECTING: 'Selecting optimal personas...',
  PROCESSING: 'Processing your document...',
  SAVING: 'Saving to your library...',
  LOADING: 'Loading...',
} as const;

// Error Messages (RJM Voice)
export const ERROR_MESSAGES = {
  NETWORK: 'Unable to connect to the server. Please check your internet connection and try again.',
  UNAUTHORIZED: 'Please sign in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Something went wrong on our end. Please try again later.',
  UNKNOWN: 'An unexpected error occurred. Please try again.',
  BRIEF_TOO_SHORT: 'Please provide more detail in your brief for better results.',
  CATEGORY_NOT_FOUND: 'Unable to determine category. Please specify the industry.',
  GENERATION_FAILED: "We couldn't build your program. Please try again.",
  RATE_LIMIT: "You've reached your daily limit. Upgrade for more.",
  INVALID_EMAIL: 'Invalid email format.',
  WEAK_PASSWORD: 'Password must be at least 8 characters.',
  PASSWORDS_DONT_MATCH: 'Passwords do not match.',
  WRONG_PASSWORD: 'Current password is incorrect.',
  RESET_LINK_EXPIRED: 'Reset link has expired. Please request a new one.',
  ACCOUNT_DELETE_FAILED: 'Unable to delete account. Please try again.',
} as const;
