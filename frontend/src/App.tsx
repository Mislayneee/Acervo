import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";

type Fossil = {
  id: number;
  especie: string;
  periodo: string;
  localizacao?: string | null;
  imageUrl?: string | null;
};

export default function App() {
  const navigate = useNavigate();
  const [term, setTerm] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, ""),
    []
  );

  const [featured, setFeatured] = useState<Fossil[]>([]);
  const [loadingFeat, setLoadingFeat] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingFeat(true);
        const url = new URL(`${apiBase}/fosseis`);
        url.searchParams.set("page", "1");
        url.searchParams.set("limit", "4");
        url.searchParams.set("orderBy", "createdAt");
        url.searchParams.set("orderDir", "desc");

        const resp = await fetch(url.toString(), { credentials: "include" });
        const json = await resp.json();

        let items: Fossil[] = [];
        if (Array.isArray(json)) items = json.slice(0, 4);
        else items = (json?.items ?? []).slice(0, 4);

        if (alive) setFeatured(items);
      } catch {
        if (alive) setFeatured([]);
      } finally {
        if (alive) setLoadingFeat(false);
      }
    })();
    return () => { alive = false; };
  }, [apiBase]);

  const go = () => {
    const q = term.trim();
    navigate(q ? `/pesquisa?q=${encodeURIComponent(q)}` : "/pesquisa");
  };

  const onSubmit = (e: React.FormEvent) => { e.preventDefault(); go(); };

  const clear = () => {
    setTerm("");
    inputRef.current?.focus();
  };

  const makeImgSrc = (rel?: string | null) => {
    if (!rel) return "/placeholder-4x3.png";
    const path = rel.replace(/^\/+/, "");
    return `${apiBase}/${path}`;
  };

  return (
    <main className="home-page">
      {/* HERO */}
      <section className="hero">
        <div className="hero-inner">
          <h1 className="hero-title">Acervo Digital de Fósseis Vegetais</h1>
          <p className="hero-sub">Preservando a história das plantas para o futuro da ciência</p>

          {/* Busca */}
          <form className="search-wrap" onSubmit={onSubmit} role="search" aria-label="Buscar fósseis">
            <span className="search-icon" aria-hidden>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </span>

            <input
              ref={inputRef}
              className="search-input"
              type="text"
              placeholder="Pesquisar fóssil, período, família ou local..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              aria-label="Campo de pesquisa"
            />

            {term && (
              <button type="button" className="search-clear" onClick={clear} title="Limpar busca" aria-label="Limpar busca">
                ✕
              </button>
            )}

            <button type="submit" className="search-btn" aria-label="Pesquisar">
              Pesquisar
            </button>
          </form>
        </div>
      </section>

      {/* DESTAQUES */}
      <section className="section">
        <h2 className="section-title">Descubra Diversos Fósseis Vegetais</h2>

        {loadingFeat ? (
          <div className="fossil-grid">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="fossil-card skeleton" />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="muted" style={{ textAlign: "center" }}>
            Nenhum fóssil encontrado para exibição.
          </div>
        ) : (
          <div className="fossil-grid">
            {featured.map((f) => (
              <Link
                key={f.id}
                to={`/detalhes/${f.id}`}
                state={{ from: { label: "Home", path: "/" } }}
                className="fossil-card"
                aria-label={`Ver detalhes de ${f.especie}`}
              >
                <img
                  className="fossil-thumb"
                  loading="lazy"
                  src={makeImgSrc(f.imageUrl)}
                  alt={f.especie}
                  onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder-4x3.png")}
                />
                <div className="fossil-body">
                  <div className="fossil-title">{f.especie || "—"}</div>
                  <div className="fossil-sub">
                    {f.periodo}
                    {f.localizacao ? ` · ${f.localizacao}` : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="cta-center">
          <Link to="/biblioteca" className="cta-outline">
            Explorar Biblioteca Completa
          </Link>
        </div>
      </section>
    </main>
  );
}
