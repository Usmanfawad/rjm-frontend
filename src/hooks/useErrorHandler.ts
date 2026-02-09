import { useState, useCallback } from 'react';
import { createAppError, logError, getUserFriendlyMessage, type AppError } from '@/lib/errors';

/**
 * Custom hook for consistent error handling across components
 */
export function useErrorHandler() {
  const [error, setError] = useState<AppError | null>(null);

  const handleError = useCallback((err: unknown, context?: string) => {
    const appError = createAppError(err, context);
    logError(appError, context);
    setError(appError);
    return appError;
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const getUserMessage = useCallback(() => {
    return error ? getUserFriendlyMessage(error) : null;
  }, [error]);

  return {
    error,
    handleError,
    clearError,
    getUserMessage,
    hasError: error !== null,
  };
}
