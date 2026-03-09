import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

interface Props {
  children: React.ReactNode;
  allowedRoles: ("customer" | "manager")[];
}

export function RoleProtectedRoute({ children, allowedRoles }: Props) {
  const { isAuthenticated, role } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
  return <>{children}</>;
}
