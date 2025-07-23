import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../context/useAuth';

const ProtectedRoute = ({ children }) => {
  const auth = useAuth();
  const { isAuthenticated, isLoadingSession } = useAuth();
  const location = useLocation();
  const [defaultUrl, setDefaultUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // useEffect(() => {
  //   if (auth.isAuthenticated) {
  //     tenantAuthService
  //       .getDefaultDashboard()
  //       .then((res) => setDefaultUrl(res.data.data.defaultUrl))
  //       .catch(() => setDefaultUrl('/dashboard')) // Fallback
  //       .finally(() => setIsLoading(false));
  //   } else {
  //     setIsLoading(false);
  //   }
  // }, [auth.isAuthenticated]);

  // if (!auth.isAuthenticated) {
  //   return <Navigate to='/login' state={{ from: location }} replace />;
  // }

  // Show a loading screen while the session is being validated
  if (isLoadingSession) {
    return (
      <div className='flex items-center justify-center h-screen bg-slate-900 text-white'>
        <p>Loading session...</p>
      </div>
    );
  }

  // --- Definitive Fix #1: Intelligent Redirect for root path ---
  // If the user is already logged in and tries to go to the root, send them to their dashboard.
  // if (location.pathname === '/') {
  //   if (isLoading) {
  //     return (
  //       <div className='flex h-screen items-center justify-center'>
  //         <LoaderCircle className='h-8 w-8 animate-spin' />
  //       </div>
  //     );
  //   }
  //   if (defaultUrl) {
  //     return <Navigate to={defaultUrl} replace />;
  //   }
  // }

  if (!isAuthenticated) {
    return <Navigate to='/login' state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
