import { useAuth } from '../../../firebase/AuthProvider';
import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { protectedRouteLists, protectedRouteLoggedin } from '@constants/protectedRoutes';

export const ProtectRoute: FC = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const { asPath } = useRouter();

  const checkRoute = (route: string | RegExp) => {
    if (typeof route === 'string') {
      return asPath === route;
    } else {
      return route.test(asPath);
    }
  };

  const isProtectedRoute = protectedRouteLists.find(checkRoute);
  const isProtectedRouteForAuthUser = protectedRouteLoggedin.find(checkRoute);

  const authUserToProtectedRoute = isAuthenticated && isProtectedRouteForAuthUser;
  const unauthUserToProtectedRoute = !isAuthenticated && isProtectedRoute;

  useEffect(() => {
    if (!loading) {
      if (unauthUserToProtectedRoute) {
        window.location.href = '/login';
      }
      if (authUserToProtectedRoute) {
        window.location.href = '/';
      }
    }
  }, [loading]);

  if (loading || unauthUserToProtectedRoute || authUserToProtectedRoute) {
    return <div>Loading..... </div>;
  }

  return <>{children}</>;
};
