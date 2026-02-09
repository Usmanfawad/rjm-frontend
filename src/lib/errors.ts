/**
 * Centralized error handling utilities
 * Prevents exposing internal backend/database errors to users
 */

export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  NOT_FOUND = 'NOT_FOUND',
  SERVER = 'SERVER',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: unknown;
  userMessage: string;
  code?: string | number;
}

/**
 * Extracts error type from HTTP status code
 */
export function getErrorTypeFromStatus(status: number): ErrorType {
  if (status >= 400 && status < 500) {
    if (status === 401) return ErrorType.AUTHENTICATION;
    if (status === 403) return ErrorType.AUTHORIZATION;
    if (status === 404) return ErrorType.NOT_FOUND;
    if (status === 422) return ErrorType.VALIDATION;
    return ErrorType.VALIDATION;
  }
  if (status >= 500) return ErrorType.SERVER;
  return ErrorType.UNKNOWN;
}

/**
 * Creates user-friendly error messages
 * Never exposes internal backend/database details
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    
    case ErrorType.AUTHENTICATION:
      return 'Your session has expired. Please sign in again.';
    
    case ErrorType.AUTHORIZATION:
      return 'You do not have permission to perform this action.';
    
    case ErrorType.NOT_FOUND:
      // Preserve specific messages for user not found cases
      if (error.message && error.message.toLowerCase().includes('user') && error.message.toLowerCase().includes('email')) {
        return error.message;
      }
      return 'The requested resource was not found.';
    
    case ErrorType.VALIDATION:
      return error.userMessage || 'Please check your input and try again.';
    
    case ErrorType.SERVER:
      return 'Something went wrong on our end. Please try again later.';
    
    case ErrorType.UNKNOWN:
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Sanitizes error messages to prevent exposing internal details
 */
function sanitizeErrorMessage(message: string): string {
  // Remove database-specific error patterns
  const dbPatterns = [
    /database/i,
    /sql/i,
    /constraint/i,
    /foreign key/i,
    /primary key/i,
    /violation/i,
    /pg_/i,
    /postgres/i,
    /connection pool/i,
    /internal server error/i,
  ];

  // Remove stack traces
  if (message.includes('at ') && message.includes('(')) {
    return message.split('at ')[0].trim();
  }

  // Check for database errors
  for (const pattern of dbPatterns) {
    if (pattern.test(message)) {
      return 'A database error occurred. Please try again.';
    }
  }

  // Remove file paths and internal details
  return message
    .replace(/\/[^\s]+\.(ts|js|py):\d+/g, '')
    .replace(/file:\/\/\/[^\s]+/g, '')
    .replace(/Error:\s*/i, '')
    .trim();
}

/**
 * Creates an AppError from various error sources
 */
export function createAppError(
  error: unknown,
  context?: string
): AppError {
  // Handle AppError instances - return as-is
  if (error && typeof error === 'object' && 'type' in error && 'userMessage' in error) {
    return error as AppError;
  }
  
  // Handle null/undefined
  if (!error) {
    return {
      type: ErrorType.UNKNOWN,
      message: 'An unknown error occurred',
      originalError: error,
      userMessage: 'An unexpected error occurred. Please try again.',
    };
  }

  // Handle API response errors
  if (error && typeof error === 'object' && 'detail' in error) {
    const apiError = error as { detail?: string; status?: number; error?: string };
    const status = apiError.status || 500;
    const detail = apiError.detail || apiError.error || 'An error occurred';
    
    return {
      type: getErrorTypeFromStatus(status),
      message: sanitizeErrorMessage(detail),
      originalError: error,
      userMessage: getUserFriendlyMessage({
        type: getErrorTypeFromStatus(status),
        message: detail,
        userMessage: '',
      }),
      code: status,
    };
  }

  // Handle Error instances
  if (error instanceof Error) {
    const isNetworkError = 
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch');

    return {
      type: isNetworkError ? ErrorType.NETWORK : ErrorType.UNKNOWN,
      message: sanitizeErrorMessage(error.message),
      originalError: error,
      userMessage: isNetworkError
        ? getUserFriendlyMessage({ type: ErrorType.NETWORK, message: '', userMessage: '' })
        : getUserFriendlyMessage({ type: ErrorType.UNKNOWN, message: '', userMessage: '' }),
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    // Check if it's a user-friendly message that should be preserved
    const lowerError = error.toLowerCase();
    const isUserFriendly = 
      (lowerError.includes('user') && lowerError.includes('email')) ||
      lowerError.includes('must create an account') ||
      lowerError.includes('create an account first') ||
      (lowerError.includes('not found') && (lowerError.includes('account') || lowerError.includes('email')));
    
    if (isUserFriendly) {
      return {
        type: ErrorType.NOT_FOUND,
        message: error,
        originalError: error,
        userMessage: error, // Preserve the user-friendly message
      };
    }
    
    // For other strings, check if they look like user-friendly messages
    // (not technical errors, contain helpful guidance)
    const looksUserFriendly = 
      error.length > 20 && // Not too short
      !error.includes('Error:') &&
      !error.includes('at ') &&
      !error.includes('TypeError') &&
      !error.includes('ReferenceError');
    
    if (looksUserFriendly) {
      return {
        type: ErrorType.UNKNOWN,
        message: error,
        originalError: error,
        userMessage: error, // Preserve the message
      };
    }
    
    return {
      type: ErrorType.UNKNOWN,
      message: sanitizeErrorMessage(error),
      originalError: error,
      userMessage: getUserFriendlyMessage({ type: ErrorType.UNKNOWN, message: '', userMessage: '' }),
    };
  }

  // Fallback for unknown error types
  return {
    type: ErrorType.UNKNOWN,
    message: 'An unknown error occurred',
    originalError: error,
    userMessage: getUserFriendlyMessage({ type: ErrorType.UNKNOWN, message: '', userMessage: '' }),
  };
}

/**
 * Logs errors for debugging (server-side or dev only)
 * Never logs in production to user's console
 */
export function logError(error: AppError, context?: string): void {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${context || 'Error'}]`, {
      type: error.type,
      message: error.message,
      code: error.code,
      originalError: error.originalError,
    });
  }
  
  // In production, send to error tracking service (e.g., Sentry)
  // if (process.env.NODE_ENV === 'production') {
  //   errorTrackingService.captureException(error.originalError, { context });
  // }
}
