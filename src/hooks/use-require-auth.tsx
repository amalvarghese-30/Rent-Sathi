import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./use-auth";

export function useRequireAuth(role?: string) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth/login", { state: { from: location }, replace: true });
    }
    if (!loading && role && user?.role !== role) {
      navigate("/", { replace: true });
    }
  }, [user, loading, role, navigate, location]);

  return { user, loading };
}
