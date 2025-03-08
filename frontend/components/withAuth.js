import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../hooks/useAuth';
import LoadingOverlay from './LoadingOverlay';

export function withAuth(WrappedComponent, { requireAdmin = false } = {}) {
  return function WithAuthComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace({
            pathname: '/auth/login',
            query: { returnUrl: router.asPath },
          });
        } else if (requireAdmin && user.role !== 'admin') {
          router.replace('/');
        }
      }
    }, [loading, user, router, requireAdmin]);

    if (loading) {
      return <LoadingOverlay />;
    }

    if (!user || (requireAdmin && user.role !== 'admin')) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
}

export function withPublicOnly(WrappedComponent) {
  return function WithPublicOnlyComponent(props) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && user) {
        if (user.role === 'admin') {
          router.replace('/admin');
        } else {
          router.replace('/');
        }
      }
    }, [loading, user, router]);

    if (loading || user) {
      return <LoadingOverlay />;
    }

    return <WrappedComponent {...props} />;
  };
}
