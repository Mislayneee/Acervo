import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams, useNavigate } from "react-router-dom";
import "./index.css";

type Author = {
  id?: number;
  nome?: string | null;
  email?: string | null;
  role?: string | null;
  affiliation?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  showName?: boolean;
  showAffiliation?: boolean;
  showContact?: boolean;
  contactPublic?: string | null;
};

type Fossil = {
  id: number;
  especie: string;
  familia?: string | null;
  periodo: string;
  localizacao?: string | null;
  descricao?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  userId?: number;
  author?: Author | null;
};

type FromState =
  | { label: string; path: string }               // p.ex. {label:"Biblioteca / Jurássico", path:"/periodo/Jurássico"}
  | "search"                                      // legado
  | undefined;

export default function Detalhes() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, ""),
    []
  );

  const [data, setData] = useState<Fossil | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [showLightbox, setShowLightbox] = useState(false);

  // ---- util: guarda/recupera origem pra fallback ----
  const rawFrom: FromState = (location.state as any)?.from;
  useEffect(() => {
    try {
      if (rawFrom === "search") {
        sessionStorage.setItem("detalhes:lastFrom", JSON.stringify({ label: "Pesquisa", path: "/pesquisa" }));
      } else if (rawFrom && typeof rawFrom === "object" && "label" in rawFrom && "path" in rawFrom) {
        sessionStorage.setItem("detalhes:lastFrom", JSON.stringify(rawFrom));
      }
    } catch {}
  }, [rawFrom]);

  function readLastFrom(): { label: string; path: string } | null {
    try {
      const s = sessionStorage.getItem("detalhes:lastFrom");
      if (!s) return null;
      const o = JSON.parse(s);
      if (o && typeof o === "object" && "label" in o && "path" in o) return o as { label: string; path: string };
    } catch {}
    return null;
  }

  // ---- carrega fóssil ----
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErro(null);
        const resp = await fetch(`${apiBase}/fosseis/${id}`);
        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error || "Erro ao carregar fóssil.");
        if (alive) setData(json);
      } catch (e: any) {
        if (alive) setErro(e?.message || "Falha ao carregar.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [apiBase, id]);

  // ---- ESC fecha lightbox e trava scroll quando aberto ----
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowLightbox(false); };
    document.addEventListener("keydown", onKey);
    if (showLightbox) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
        document.removeEventListener("keydown", onKey);
      };
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [showLightbox]);

  // ---- helpers ----
  const imgSrc = data?.imageUrl
    ? `${apiBase}/${data.imageUrl.replace(/^\/+/, "")}`
    : "/placeholder-4x3.png";

  function normalizeCrumbs(from: FromState): { label: string; path?: string }[] {
    // 1) veio da Pesquisa (legado)
    if (from === "search") return [{ label: "Pesquisa", path: "/pesquisa" }];

    // 2) veio com {label, path}
    if (from && typeof from === "object" && "label" in from && "path" in from) {
      const label = String(from.label || "").trim();
      const parts = label.split("/").map(s => s.trim()).filter(Boolean);
      const crumbs: { label: string; path?: string }[] = [];

      // Se tiver mais de um nível no label, o padrão é:
      //  - primeiro nível conhecido com caminho padrão
      //  - último nível aponta para from.path
      parts.forEach((part, idx) => {
        const isLast = idx === parts.length - 1;
        if (isLast) {
          crumbs.push({ label: part, path: from.path });
        } else {
          // caminhos padrão para primeiros níveis
          if (/^biblioteca pessoal$/i.test(part)) {
            crumbs.push({ label: part, path: "/perfil" });
          } else if (/^biblioteca$/i.test(part)) {
            crumbs.push({ label: part, path: "/biblioteca" });
          } else if (/^home$/i.test(part)) {
            crumbs.push({ label: part, path: "/" });
          } else if (/^pesquisa$/i.test(part)) {
            crumbs.push({ label: part, path: "/pesquisa" });
          } else {
            // nível desconhecido intermediário (mantém sem link)
            crumbs.push({ label: part });
          }
        }
      });

      // se não havia '/', usa direto
      if (crumbs.length === 0) {
        crumbs.push({ label: label || "Origem", path: from.path });
      }
      return crumbs;
    }

    // 3) fallback (sessionStorage) ou Biblioteca
    const last = readLastFrom();
    if (last) {
      return normalizeCrumbs(last as any);
    }
    return [{ label: "Biblioteca", path: "/biblioteca" }];
  }

  const crumbs = normalizeCrumbs(rawFrom);

  if (loading) {
    return (
      <main className="container" style={{ padding: "24px 0" }}>
        <div className="skeleton">Carregando…</div>
      </main>
    );
  }
  if (erro || !data) {
    return (
      <main className="container" style={{ padding: "24px 0" }}>
        <div className="erro">{erro ?? "Não foi possível carregar."}</div>
        <div style={{ marginTop: 12 }}>
          {crumbs.length > 0 && (
            <Link
              to={crumbs[crumbs.length - 1].path || "/biblioteca"}
              style={{ color: "var(--color-primary)", fontWeight: 600, textDecoration: "none" }}
            >
              ← Voltar
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="container detail-page">
      {/* BREADCRUMB */}
      <nav className="muted" aria-label="Breadcrumb" style={{ margin: "8px 0 12px" }}>
        {crumbs.map((c, i) => {
          const isLast = i === crumbs.length - 1;
          return (
            <span key={i}>
              {c.path ? (
                <Link to={c.path} className="detail-crumb-link">{c.label}</Link>
              ) : (
                <span className="detail-crumb-current">{c.label}</span>
              )}
              {!isLast && <span className="detail-crumb-sep"> / </span>}
            </span>
          );
        })}
        <span className="detail-crumb-sep"> / </span>
        <span className="detail-crumb-current">Detalhes</span>
      </nav>

      {/* Título + família */}
      <h1 className="detail-title">{data.especie}</h1>
      {data.familia && (
        <div className="detail-family">
          Família: <strong>{data.familia}</strong>
        </div>
      )}

      {/* Grid principal */}
      <section className="detail-grid">
        <figure className="detail-figure">
          <button
            className="zoom-btn"
            onClick={() => setShowLightbox(true)}
            title="Ver em tela cheia"
            aria-label="Ver imagem em tela cheia"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>

          <img
            src={imgSrc}
            alt={data.especie}
            className="detail-image"
            onClick={() => setShowLightbox(true)}
            style={{ cursor: "zoom-in" }}
            onError={(e) => ((e.currentTarget as HTMLImageElement).src = "/placeholder-4x3.png")}
          />
        </figure>

        <div className="detail-info">
          <h2 className="h2" style={{ marginTop: 0 }}>Informações</h2>
          <dl className="detail-dl">
            <div className="detail-row"><dt>Período</dt><dd>{data.periodo || "—"}</dd></div>
            <div className="detail-row"><dt>Localização</dt><dd>{data.localizacao || "—"}</dd></div>
            <div className="detail-row"><dt>Descrição</dt><dd>{data.descricao || "—"}</dd></div>
          </dl>

          <hr className="detail-divider" />
          <ContributorBlock author={data.author} />
        </div>
      </section>

      {/* LIGHTBOX */}
      {showLightbox && (
        <div className="lightbox" role="dialog" aria-modal="true">
          <div className="lightbox-backdrop" onClick={() => setShowLightbox(false)} />
          <div className="lightbox-content">
            <button className="lightbox-close" onClick={() => setShowLightbox(false)} aria-label="Fechar imagem" title="Fechar">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <img src={imgSrc} alt={data.especie} className="lightbox-img" />
          </div>
        </div>
      )}
    </main>
  );
}

/** Helper: limpa null/undefined/"null" e espaços */
function cleanStr(v?: string | null): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  if (!s) return null;
  const low = s.toLowerCase();
  if (low === "null" || low === "undefined") return null;
  return s;
}

function ContributorBlock({ author }: { author?: Author | null }) {
  const [copied, setCopied] = useState(false);

  if (!author) {
    return (
      <div className="contrib">
        <h2 className="h2" style={{ marginTop: 0 }}>Contribuição</h2>
        <div className="contrib-line contrib-muted">Contribuidor anônimo</div>
      </div>
    );
  }

  const showName = !!author.showName;
  const showAff = !!author.showAffiliation;
  const showCont = !!author.showContact;

  const name = showName ? cleanStr(author.nome) : null;
  const affiliation = showAff ? cleanStr(author.affiliation) : null;

  const locParts = [cleanStr(author.city), cleanStr(author.state), cleanStr(author.country)].filter(Boolean) as string[];
  const location = locParts.length ? locParts.join(", ") : null;

  const contact = showCont ? cleanStr(author.contactPublic) || cleanStr(author.email) : null;
  const nothing = !name && !affiliation && !location && !contact;

  const handleCopy = async () => {
    if (!contact) return;
    try {
      await navigator.clipboard.writeText(contact);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div className="contrib" aria-label="Informações do contribuidor">
      <h2 className="h2" style={{ marginTop: 0 }}>Contribuição</h2>

      {nothing ? (
        <div className="contrib-line contrib-muted">Contribuidor anônimo</div>
      ) : (
        <>
          {name && <div className="contrib-line">{name}</div>}
          {affiliation && <div className="contrib-line contrib-muted">{affiliation}</div>}
          {location && <div className="contrib-line contrib-muted">{location}</div>}
          {contact && (
            <div className="contrib-line contrib-email">
              <span>{contact}</span>
              <button className="copy-btn" onClick={handleCopy} title="Copiar e-mail" aria-label="Copiar e-mail">
                {copied ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1a4d2e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6a6f6a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                )}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
