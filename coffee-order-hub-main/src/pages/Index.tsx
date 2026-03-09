import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/authStore";

const Index = () => {
  const { isAuthenticated, role, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role === "manager") return <Navigate to="/manager/dashboard" replace />;
  return <Navigate to="/menu" replace />;
};

export default Index;
