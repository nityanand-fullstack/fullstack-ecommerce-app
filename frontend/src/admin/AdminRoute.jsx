import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import Loader from "../components/Loader.jsx";

export default function AdminRoute({ children }) {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loader fullscreen label="Authenticating..." />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (user?.role !== "admin") {
    return (
      <div className="grid place-items-center py-24 text-center px-4">
        <div className="max-w-md">
          <p className="text-7xl font-bold text-red-500">403</p>
          <h1 className="mt-4 text-2xl font-semibold text-slate-900">
            Forbidden
          </h1>
          <p className="mt-2 text-slate-500">
            You don't have permission to access the admin area.
          </p>
        </div>
      </div>
    );
  }
  return children;
}
