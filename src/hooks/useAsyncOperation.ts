import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';

interface AsyncOperationState<T> {
  data: T | null;
  loading: boolean;
  error: unknown;
}

/**
 * Custom hook for handling async operations with loading and error states
 */
export function useAsyncOperation<T>() {
  const [state, setState] = useState<AsyncOperationState<T>>({
    data: null,
    loading: false,
    error: null,
  });
  const { handleError, clearError } = useErrorHandler();

  const execute = useCallback(
    async (operation: () => Promise<T>, context?: string) => {
      setState({ data: null, loading: true, error: null });
      clearError();

      try {
        const result = await operation();
        setState({ data: result, loading: false, error: null });
        return result;
      } catch (err) {
        const appError = handleError(err, context);
        setState({ data: null, loading: false, error: appError });
        throw appError;
      }
    },
    [handleError, clearError]
  );

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
    clearError();
  }, [clearError]);

  return {
    ...state,
    execute,
    reset,
  };
}
