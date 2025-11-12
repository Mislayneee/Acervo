import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

/* ========= Tipos ========= */
export type User = {
  id: number;
  nome: string;
  email: string;

  // Perfil público (opcionais)
  role?: string | null;
  affiliation?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  lattes?: string | null;

  // Preferências de privacidade
  showName?: boolean;
  showAffiliation?: boolean;
  showContact?: boolean;
  contactPublic?: string | null;

  createdAt?: string;
  updatedAt?: string;
};

type RegisterOpts = {
  affiliation?: string;
  city?: string;
  state?: string;
  country?: string;
  lattes?: string;
  showName?: boolean;
  showAffiliation?: boolean;
  showContact?: boolean;
  contactPublic?: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (
    nome: string,
    email: string,
    senha: string,
    role: string,
    opts?: RegisterOpts
  ) => Promise<void>;
  logout: () => void;
  setAuth: (user: User | null, token: string | null) => void;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);
const LS_KEY = "acervo.auth";

/* ========= Provider ========= */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Base da API (com fallback)
  const base = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, ""),
    []
  );

  // Restaura sessão do localStorage
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
      // ignora
    } finally {
      setLoading(false);
    }
  }, []);

  const persist = (u: User | null, t: string | null) => {
    setUser(u);
    setToken(t);
    if (u && t) {
      localStorage.setItem(LS_KEY, JSON.stringify({ user: u, token: t }));
    } else {
      localStorage.removeItem(LS_KEY);
    }
  };

  const setAuth = (u: User | null, t: string | null) => persist(u, t);

  /* ======== Ações ======== */
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

  // Cadastro com campos públicos + flags
  const register = async (
    nome: string,
    email: string,
    senha: string,
    role: string,
    opts?: RegisterOpts
  ) => {
    const body = {
      nome,
      email,
      senha,
      role: role ?? null,
      affiliation: opts?.affiliation ?? null,
      city: opts?.city ?? null,
      state: opts?.state ?? null,
      country: opts?.country ?? null,
      lattes: opts?.lattes ?? null,
      showName: opts?.showName ?? true,
      showAffiliation: opts?.showAffiliation ?? true,
      showContact: opts?.showContact ?? false,
      contactPublic: opts?.showContact ? opts?.contactPublic ?? null : null,
    };

    const resp = await fetch(`${base}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
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

/* ========= Hook ========= */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
  return ctx;
};
