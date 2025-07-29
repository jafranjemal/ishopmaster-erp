import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import useAuth from '../../context/useAuth';

/**
 * @desc The definitive ProtectedRoute. It checks for an active session
 * and renders the nested routes via <Outlet /> if authenticated.
 */
const ProtectedRoute = () => {
  const { isAuthenticated, isLoadingSession } = useAuth();
  const location = useLocation();

  // If the session is still being validated, show a loading spinner.
  if (isLoadingSession) {
    return (
      <div className='flex h-screen w-screen items-center justify-center bg-slate-900'>
        <Loader2 className='h-8 w-8 animate-spin text-white' />
      </div>
    );
  }

  // If the session is loaded and the user is authenticated, render the child routes.
  // The <Outlet /> is the placeholder for all the nested routes inside this protector.
  if (isAuthenticated) {
    return <Outlet />;
  }

  // If not authenticated, redirect to the login page.
  // We pass the original location so we can redirect back after login.
  return <Navigate to='/login' state={{ from: location }} replace />;
};

export default ProtectedRoute;
