import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import LoadingOverlay from './LoadingOverlay';

export function withAuth(WrappedComponent, { requireAdmin = false } = {}) {
  return function WithAuthComponent(props) {
    const { user, isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading) {
        if (!isAuthenticated) {
          router.replace({
            pathname: '/auth/login',
            query: { returnUrl: router.asPath },
          });
        } else if (requireAdmin && user?.role !== 'admin') {
          router.replace('/');
        }
      }
    }, [isLoading, isAuthenticated, user, router, requireAdmin]);

    if (isLoading) {
      return <LoadingOverlay />;
    }

    if (!isAuthenticated || (requireAdmin && user?.role !== 'admin')) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export function withPublicOnly(WrappedComponent) {
  return function WithPublicOnlyComponent(props) {
    const { isLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        router.replace('/');
      }
    }, [isLoading, isAuthenticated, router]);

    if (isLoading || isAuthenticated) {
      return <LoadingOverlay />;
    }

    return <WrappedComponent {...props} />;
  };
}