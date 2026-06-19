import { Navigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useAuth } from "@/hooks/useAuth";
import { clearAuth } from "@/store/authSlice";
import { isRoleAllowedHere, PORTAL_LABEL } from "@/config/appTarget";

export function ProtectedRoute({ children }) {
  const { isAuthenticated, forcePasswordChange, role } = useAuth();
  const dispatch = useDispatch();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Wrong-audience session (e.g. an admin opening the student site)
  if (!isRoleAllowedHere(role)) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 text-center">
        <div className="max-w-sm space-y-4">
          <h1 className="text-xl font-bold">Wrong portal</h1>
          <p className="text-sm text-[var(--muted-foreground)]">
            This site is for {PORTAL_LABEL}. Your account doesn't have access here.
          </p>
          <button
            onClick={() => dispatch(clearAuth())}
            className="text-sm text-[var(--primary)] hover:underline cursor-pointer"
          >
            Sign out
          </button>
        </div>
      </div>
    );
  }

  if (forcePasswordChange && location.pathname !== "/change-password") {
    return <Navigate to="/change-password" replace />;
  }

  return children;
}
