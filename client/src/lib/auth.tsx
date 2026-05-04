import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest, queryClient, setAuthToken, getAuthToken } from "./queryClient";
import type { PublicUser } from "@shared/schema";

interface AuthCtx {
  user: PublicUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (u: PublicUser | null) => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const API_BASE = "__PORT_5000__".startsWith("__") ? "" : "__PORT_5000__";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers,
        credentials: "include",
      });
      if (res.ok) setUser(await res.json());
      else setUser(null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await apiRequest("POST", "/api/auth/login", { email, password });
    const data = await res.json();
    // Store token in memory for Bearer auth (cookie won't work in iframe)
    if (data._token) {
      setAuthToken(data._token);
    }
    // Strip internal field before storing user
    const { _token, ...userdata } = data;
    setUser(userdata as PublicUser);
  };

  const logout = async () => {
    try { await apiRequest("POST", "/api/auth/logout"); } catch {}
    setAuthToken(null);
    setUser(null);
    queryClient.clear();
  };

  return (
    <Ctx.Provider value={{ user, loading, login, logout, refresh, setUser }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth outside provider");
  return ctx;
}
