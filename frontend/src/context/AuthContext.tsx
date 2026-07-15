import React, {
  createContext, useContext, useEffect,
  useState, useCallback, useRef,
} from "react";
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
  intendedPath: string | null;
  setIntendedPath: (path: string | null) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [intendedPath, setIntendedPath] = useState<string | null>(null);
  const logoutRef = useRef<() => void>();

  const doLogout = useCallback(() => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
  }, []);

  // Keep ref updated so event listener always has latest
  logoutRef.current = doLogout;

  // Listen for axios interceptor logout signal
  useEffect(() => {
    const handler = () => logoutRef.current?.();
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, []);

  // Restore session on app load
  useEffect(() => {
    const restore = async () => {
      const access = localStorage.getItem("access_token");
      const refresh = localStorage.getItem("refresh_token");

      if (!access && !refresh) {
        setIsLoading(false);
        return;
      }

      try {
        // Try current access token
        const u = await authService.getMe();
        setUser(u);
      } catch {
        // Try refreshing
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
              doLogout();
            }
          } catch {
            doLogout();
          }
        } else {
          doLogout();
        }
      } finally {
        setIsLoading(false);
      }
    };

    restore();
  }, [doLogout]);

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
    doLogout();
  }, [doLogout]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        intendedPath,
        setIntendedPath,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
