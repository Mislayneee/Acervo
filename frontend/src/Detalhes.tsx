// src/Detalhes.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";

type Fossil = {
  id: number;
  especie: string;
  familia?: string | null;
  descricao?: string | null;
  localizacao?: string | null;
  periodo?: string | null;
  imageUrl?: string | null; // pode vir relativo ("uploads/xxx.jpg") ou absoluto (http…)
};

type FromState = {
  from?: {
    label: string; // ex.: "Biblioteca", "Devoniano", "Biblioteca Pessoal"
    path: string;  // ex.: "/biblioteca", "/periodo/Devoniano", "/perfil"
  };
};

// (MUTÁVEL) – se quiser trocar o placeholder, mude aqui:
const FALLBACK_IMG = "/icon.png";

function buildImageSrc(apiBase: string, raw?: string | null) {
  const v = (raw ?? "").trim();
  if (!v) return FALLBACK_IMG;

  // absoluto? (http/https/data:) – usa como está
  if (/^(https?:)?\/\//i.test(v) || /^data:image\//i.test(v)) return v;

  // relativo – remove barra inicial e prega no apiBase
  const path = v.replace(/^\/+/, "");
  return `${apiBase}/${path}`;
}

export default function Detalhes() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation() as unknown as { state?: FromState };
  const [fossil, setFossil] = useState<Fossil | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, ""),
    []
  );

  // breadcrumb dinâmico
  const from = location.state?.from ?? {
    label: "Biblioteca",
    path: "/biblioteca",
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErro(null);

        const resp = await fetch(`${apiBase}/fosseis/${id}`, { credentials: "include" });
        const json: Fossil = await resp.json();
        if (!resp.ok) throw new Error((json as any)?.error || "Erro ao carregar fóssil.");

        if (alive) setFossil(json);
      } catch (e: any) {
        if (alive) setErro(e?.message || "Falha ao carregar fóssil.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [apiBase, id]);

  if (loading) {
    return (
      <main className="container" style={{ padding: "40px 0" }}>
        <nav className="muted" style={{ marginBottom: 8 }}>
          <Link to={from.path}>{from.label}</Link> / <span>Detalhes</span>
        </nav>
        <h1 className="h1" style={{ color: "var(--color-primary)" }}>Detalhes</h1>
        <div className="skeleton">Carregando…</div>
      </main>
    );
  }

  if (erro || !fossil) {
    return (
      <main className="container" style={{ padding: "40px 0" }}>
        <nav className="muted" style={{ marginBottom: 8 }}>
          <Link to={from.path}>{from.label}</Link> / <span>Detalhes</span>
        </nav>
        <h1 className="h1" style={{ color: "var(--color-primary)" }}>Detalhes</h1>
        <div className="erro">{erro || "Fóssil não encontrado."}</div>
        <div style={{ marginTop: 12 }}>
          <Link to={from.path} style={{ color: "var(--color-primary)", fontWeight: 600 }}>
            ← Voltar para {from.label}
          </Link>
        </div>
      </main>
    );
  }

  const imgSrc = buildImageSrc(apiBase, fossil.imageUrl);

  return (
    <main className="container" style={{ padding: "40px 0" }}>
      {/* Breadcrumb dinâmico */}
      <nav className="muted" style={{ marginBottom: 8 }}>
        <Link to={from.path}>{from.label}</Link> / <span>Detalhes</span>
      </nav>

      <h1 className="h1" style={{ color: "var(--color-primary)", marginBottom: 6 }}>
        {fossil.especie}
      </h1>
      {fossil.familia && (
        <div className="muted" style={{ marginBottom: 20 }}>
          Família: {fossil.familia}
        </div>
      )}

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div
          style={{
            width: 420,               // (MUTÁVEL) largura da imagem
            maxWidth: "100%",
            aspectRatio: "4 / 3",     // (MUTÁVEL) proporção; use "1 / 1" se quiser quadrado
            borderRadius: 12,
            overflow: "hidden",
            background: "#f4f7f4",
            border: "1px solid var(--gray-200)",
          }}
        >
          <img
            src={imgSrc}
            alt={fossil.especie}
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = FALLBACK_IMG;
            }}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>

        <div style={{ flex: "1 1 300px", minWidth: 280 }}>
          <h3 style={{ marginTop: 0, marginBottom: 12 }}>Informações</h3>

          {fossil.periodo && (
            <p className="muted" style={{ marginTop: 0 }}>
              Período: {fossil.periodo}
            </p>
          )}

          {fossil.localizacao && (
            <p className="muted" style={{ marginTop: 0 }}>
              Localização: {fossil.localizacao}
            </p>
          )}

          {fossil.descricao && (
            <div style={{ marginTop: 16 }}>
              <strong>Descrição</strong>
              <p style={{ marginTop: 6 }}>{fossil.descricao}</p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
