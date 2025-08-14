import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

type User = {
  id: number;
  nome: string;
  email: string;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (nome: string, email: string, senha: string) => Promise<void>;
  logout: () => void;
  setAuth: (user: User | null, token: string | null) => void; // utilitário opcional
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LS_KEY = 'acervo.auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // restaura sessão do localStorage
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
      // ignore
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

  const login = async (email: string, senha: string) => {
    const base = import.meta.env.VITE_API_URL;
    const resp = await fetch(`${base}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, senha }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data?.error || 'Falha no login.');
    }

    const data = await resp.json();
    persist(data.user, data.token);
  };

  const register = async (nome: string, email: string, senha: string) => {
    const base = import.meta.env.VITE_API_URL;
    const resp = await fetch(`${base}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nome, email, senha }),
    });

    if (!resp.ok) {
      const data = await resp.json().catch(() => ({}));
      throw new Error(data?.error || 'Falha no cadastro.');
    }

    const data = await resp.json();
    // sua API já retorna token + user no cadastro; mantém logado
    persist(data.user, data.token);
  };

  const logout = () => persist(null, null);

  const value = useMemo<AuthContextType>(() => ({
    user,
    token,
    loading,
    login,
    register,
    logout,
    setAuth,
  }), [user, token, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
};
