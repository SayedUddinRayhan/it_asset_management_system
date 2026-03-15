import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/context/AuthContext";
import { usePermissions } from "../hooks/usePermissions";
import { FaSpinner } from "react-icons/fa";

const ProtectedRoute = ({ children, permission, requiredAll, requiredAny }) => {
  const { user, isAuthLoading } = useAuth();
  const { can, canAll, canAny, isLoading: isPermLoading } = usePermissions();

  if (isAuthLoading || isPermLoading) {
    return (
      <div className="flex items-center justify-center h-screen gap-3 text-gray-500">
        <FaSpinner className="animate-spin text-blue-500" /> Loading...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  // If no permission prop is passed, just check auth (existing behaviour)
  if (permission && !can(permission)) return <Navigate to="/403" replace />;
  if (requiredAll && !canAll(...requiredAll)) return <Navigate to="/403" replace />;
  if (requiredAny && !canAny(...requiredAny)) return <Navigate to="/403" replace />;

  return children;
};

export default ProtectedRoute;