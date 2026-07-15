import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, AuthTokens } from "../types";
import { authService } from "../services/authService";

export interface RegisterPayload {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On app load — restore session
  useEffect(() => {
    const restore = async () => {
      const access = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");

      if (!access && !refresh) {
        setIsLoading(false);
        return;
      }

      try {
        // Try with current access token
        const u = await authService.getMe();
        setUser(u);
      } catch {
        // Access token failed — try refreshing
        if (refresh) {
          try {
            const res = await fetch(`${API_URL}/auth/refresh/`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ refresh }),
            });
            if (res.ok) {
              const tokens = await res.json();
              localStorage.setItem("access_token", tokens.access);
              if (tokens.refresh) {
                localStorage.setItem("refresh_token", tokens.refresh);
              }
              const u = await authService.getMe();
              setUser(u);
            } else {
              // Refresh failed — clear session
              localStorage.clear();
              setUser(null);
            }
          } catch {
            localStorage.clear();
            setUser(null);
          }
        } else {
          localStorage.clear();
          setUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, []);

  const saveTokens = (tokens: AuthTokens) => {
    localStorage.setItem("access_token", tokens.access);
    localStorage.setItem("refresh_token", tokens.refresh);
  };

  const login = useCallback(async (email: string, password: string) => {
    const data = await authService.login(email, password);
    saveTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
  }, []);

  const register = useCallback(async (formData: RegisterPayload) => {
    const data = await authService.register(formData);
    saveTokens({ access: data.access, refresh: data.refresh });
    setUser(data.user);
  }, []);

  const logout = useCallback(async () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
