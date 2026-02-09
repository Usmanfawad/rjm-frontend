import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { ROUTES } from '@/constants';

/**
 * Hook to protect routes that require authentication
 * Redirects to login if not authenticated
 */
export function useAuthGuard(redirectTo: string = ROUTES.LOGIN) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthenticated, router, redirectTo]);

  return {
    isAuthenticated,
    isLoading,
    isReady: !isLoading && isAuthenticated,
  };
}
