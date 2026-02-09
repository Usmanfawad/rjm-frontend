import { useState, useEffect, useCallback, useRef } from 'react';
import { useErrorHandler } from './useErrorHandler';
import type { ApiResponse } from '@/types/api';

interface UseApiQueryOptions<T> {
  enabled?: boolean;
  onSuccess?: (data: T) => void;
  onError?: (error: unknown) => void;
  refetchInterval?: number; // Optional polling interval in ms
}

// Request cache to prevent duplicate requests
const requestCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5000; // 5 seconds cache
const activeRequests = new Map<string, Promise<ApiResponse<any>>>();

/**
 * Clear cache for a specific query function
 */
export function clearQueryCache(queryFn: () => Promise<ApiResponse<any>>): void {
  const cacheKey = queryFn.toString();
  requestCache.delete(cacheKey);
}

/**
 * Clear all query caches
 */
export function clearAllQueryCaches(): void {
  requestCache.clear();
}

/**
 * Hook for fetching data from API
 * Provides loading, error, and data states with request deduplication
 */
export function useApiQuery<T>(
  queryFn: () => Promise<ApiResponse<T>>,
  options: UseApiQueryOptions<T> = {}
) {
  const { enabled = true, onSuccess, onError, refetchInterval } = options;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const { error, handleError, clearError } = useErrorHandler();
  const queryFnRef = useRef(queryFn);
  const enabledRef = useRef(enabled);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update refs when props change
  useEffect(() => {
    queryFnRef.current = queryFn;
    enabledRef.current = enabled;
  }, [queryFn, enabled]);

  const refetch = useCallback(async () => {
    if (!enabledRef.current) {
      setLoading(false);
      return;
    }

    // Create a cache key from the function (simple hash)
    const cacheKey = queryFnRef.current.toString();
    const cached = requestCache.get(cacheKey);
    const now = Date.now();

    // Return cached data if still valid
    if (cached && (now - cached.timestamp) < CACHE_TTL) {
      setData(cached.data);
      setLoading(false);
      return;
    }

    // Check if there's already an active request for this query
    const activeRequest = activeRequests.get(cacheKey);
    if (activeRequest) {
      try {
        const response = await activeRequest;
        if (response.success && response.data) {
          setData(response.data);
          requestCache.set(cacheKey, { data: response.data, timestamp: now });
        }
      } catch (err) {
        // Error handled below
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    clearError();

    // Create and store the request promise
    const requestPromise = queryFnRef.current();
    activeRequests.set(cacheKey, requestPromise);

    try {
      const response = await requestPromise;
      if (response.success && response.data) {
        setData(response.data);
        requestCache.set(cacheKey, { data: response.data, timestamp: now });
        onSuccess?.(response.data);
      } else {
        const err = response.error || response.detail || 'Request failed';
        handleError(err, 'useApiQuery');
        onError?.(err);
      }
    } catch (err) {
      handleError(err, 'useApiQuery');
      onError?.(err);
    } finally {
      setLoading(false);
      activeRequests.delete(cacheKey);
    }
  }, [handleError, clearError, onSuccess, onError]);

  // Initial fetch
  useEffect(() => {
    if (enabled) {
      refetch();
    } else {
      setLoading(false);
    }
  }, [enabled]); // Only depend on enabled, not refetch

  // Set up polling if refetchInterval is provided
  useEffect(() => {
    if (refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        refetch();
      }, refetchInterval);
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [refetchInterval, enabled, refetch]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}
