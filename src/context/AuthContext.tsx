import { createContext, useState, useEffect, useCallback, type ReactNode } from "react";
import api, { fetchCsrfToken } from "@/lib/api";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  role: "renter" | "broker" | "admin";
  is_verified: boolean;
  verification_badge: string | null;
  created_at: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ needsVerification?: boolean; user?: User }>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
}

interface RegisterData {
  email: string;
  password: string;
  full_name: string;
  phone: string;
  role?: string;
}

export const AuthContext = createContext<AuthState>({
  user: null,
  loading: true,
  login: async () => ({}),
  register: async () => {},
  logout: async () => {},
  verifyEmail: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const { data } = await api.get("/auth/me");
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/auth/login", { email, password });
      setUser(data.user);
      return { user: data.user };
    } catch (err: any) {
      if (err.response?.status === 403) {
        return { needsVerification: true };
      }
      throw err;
    }
  };

  const register = async (registerData: RegisterData) => {
    const { data } = await api.post("/auth/register", registerData);
    setUser(data);
  };

  const verifyEmail = async (token: string) => {
    await api.post(`/auth/verify-email/${token}`);
    await fetchUser();
  };

  const logout = async () => {
    await api.post("/auth/logout");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  );
}
