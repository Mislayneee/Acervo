import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

export type User = {
  id: number;
  nome: string;
  email: string;

  // --- Campos públicos vindos do backend ---
  role?: string | null; // Atuação
  affiliation?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  lattes?: string | null;

  // --- Preferências de privacidade ---
  showName?: boolean;
  showAffiliation?: boolean;
  showContact?: boolean;
  contactPublic?: string | null;

  // --- Timestamps (opcionais) ---
  createdAt?: string;
  updatedAt?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string, role: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User | null, token: string | null) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LS_KEY = "acervo.auth";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Restaura sessão
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed?.user && parsed?.token) {
          setUser(parsed.user);
          setToken(parsed.token);
        }
      }
    } catch {
      // ignora erros
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (u: User | null, t: string | null) => {
    setUser(u);
    setToken(t);
    if (u && t) localStorage.setItem(LS_KEY, JSON.stringify({ user: u, token: t }));
    else localStorage.removeItem(LS_KEY);
  };

  const setAuth = (u: User | null, t: string | null) => persist(u, t);

  const base = import.meta.env.VITE_API_URL;

  const login = async (email: string, senha: string) => {
    const resp = await fetch(`${base}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data?.error || "Falha no login.");
    persist(data.user, data.token);
  };

  const register = async (nome: string, email: string, senha: string, role: string) => {
    const resp = await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha, role }),
    });
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) throw new Error(data?.error || "Falha no cadastro.");
    persist(data.user, data.token);
  };

  const logout = () => persist(null, null);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      loading,
      login,
      register,
      logout,
      setAuth,
      setUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
};
