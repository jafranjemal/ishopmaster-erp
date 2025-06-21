import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useAuth from "../../context/useAuth";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoadingSession } = useAuth();
  const location = useLocation();

  // Show a loading screen while the session is being validated
  if (isLoadingSession) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
        <p>Loading session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
