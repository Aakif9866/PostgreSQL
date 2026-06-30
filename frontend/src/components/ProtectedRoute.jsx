import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

function ProtectedRoute({ children }) {
  const { user, checkingAuth } = useAuthStore();

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}

export default ProtectedRoute;
