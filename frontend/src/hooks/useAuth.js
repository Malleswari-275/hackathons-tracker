import { useSelector } from "react-redux";

export function useAuth() {
  const { user, token, isAuthenticated, forcePasswordChange } = useSelector(
    (state) => state.auth
  );

  return {
    user,
    token,
    isAuthenticated,
    forcePasswordChange,
    role: user?.role || null,
    isSuperAdmin: user?.role === "SUPER_ADMIN",
    isAdmin: user?.role === "ADMIN",
    isStudent: user?.role === "STUDENT",
  };
}
