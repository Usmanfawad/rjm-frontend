import { useState, useCallback } from 'react';
import { useErrorHandler } from './useErrorHandler';
import type { ApiResponse } from '@/types/api';

interface UseApiMutationOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
}

/**
 * Hook for API mutations (POST, PUT, DELETE, etc.)
 * Provides loading, error states and mutate function
 */
export function useApiMutation<T, V = void>(
  mutationFn: (variables: V) => Promise<ApiResponse<T>>,
  options: UseApiMutationOptions<T> = {}
) {
  const { onSuccess, onError } = options;
  const [loading, setLoading] = useState(false);
  const { error, handleError, clearError } = useErrorHandler();

  const mutate = useCallback(
    async (variables: V) => {
      setLoading(true);
      clearError();

      try {
        const response = await mutationFn(variables);
        if (response.success && response.data) {
          onSuccess?.(response.data);
          return response.data;
        } else {
          const err = response.error || response.detail || 'Request failed';
          handleError(err, 'useApiMutation');
          onError?.(err);
          throw err;
        }
      } catch (err) {
        handleError(err, 'useApiMutation');
        onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [mutationFn, handleError, clearError, onSuccess, onError]
  );

  return {
    mutate,
    loading,
    error,
  };
}
