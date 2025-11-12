import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";
import { useAuth } from "./AuthContext";
import { makeImgSrc } from "./lib/img"; // ✅ usa o mesmo helper da Biblioteca/Período

type Fossil = {
  id: number;
  especie: string;
  periodo: string;
  localizacao?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
};

type ApiResp = {
  items: Fossil[];
  total: number;
  page: number;
  limit: number;
};

const LIMIT = 12;

// ajuste aqui se sua rota de edição for diferente
const EDIT_ROUTE = (id: number) => `/editar/${id}`;

/* util: fecha menu ao clicar fora */
function useClickAway<T extends HTMLElement>(onAway: () => void) {
  const ref = useRef<T | null>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onAway();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onAway]);
  return ref;
}

/* ---------- CARD PESSOAL ---------- */
function CardPessoal({
  to,
  imageUrl,
  title,
  subtitle,
  onEdit,
  onDelete,
}: {
  to: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickAway<HTMLDivElement>(() => setMenuOpen(false));

  // (MUTÁVEL) tokens de layout/estilo
  const PAD = 12;          // padding interno do card
  const RADIUS = 12;       // raio do card
  const IMG_RADIUS = 10;   // raio da imagem
  const GAP = 8;           // gap vertical entre imagem e textos
  const BTN_W = 22;        // largura do botão ⋮
  const BTN_H = 24;        // altura do botão ⋮
  const BTN_PAD = 4;       // padding interno do botão ⋮

  // faixa de segurança para o texto não “passar por baixo” do ⋮
  const SAFE_RIGHT = BTN_W + BTN_PAD * 2 + 10; // ~36px

  const cardZ = menuOpen ? 1001 : 1;

  return (
    <div
      className="bib-card"
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start",
        padding: PAD,
        paddingBottom: PAD + 4,
        borderRadius: RADIUS,
        border: "1px solid var(--gray-200)",
        background: "#fff",
        boxSizing: "border-box",
        overflow: "visible",
        zIndex: cardZ,
        transition:
          "background-color .25s ease, box-shadow .25s ease, border-color .25s ease, transform .2s ease",
      }}
    >
      {/* Área clicável → Detalhes (com origem 'Biblioteca Pessoal') */}
      <Link
        to={to}
        state={{ from: { label: "Biblioteca Pessoal", path: "/perfil" } }} // ✅ breadcrumb dinâmico
        aria-label={`Ver detalhes de ${title}`}
        style={{ textDecoration: "none", color: "inherit", display: "block" }}
      >
        {/* Imagem 1:1 */}
        <div
          className="bib-thumb-wrap"
          style={{
            width: "100%",
            aspectRatio: "1 / 1",
            borderRadius: IMG_RADIUS,
            overflow: "hidden",
            background: "#f4f7f4",
            marginBottom: GAP,
          }}
        >
          <img
            src={imageUrl}
            alt={title}
            className="bib-thumb"
            loading="lazy"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = "/icon.png";
            }}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

        {/* textos com padding-right de segurança */}
        <div style={{ minWidth: 0, paddingRight: SAFE_RIGHT }}>
          <div
            className="bib-title"
            title={title}
            style={{
              fontSize: 15,
              lineHeight: 1.25,
              marginBottom: 4,
              minHeight: 34,
              wordBreak: "break-word",
              maxWidth: "100%",
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              className="muted"
              style={{
                fontSize: 13,
                lineHeight: 1.2,
                maxWidth: "100%",
                overflowWrap: "anywhere",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>
      </Link>

      {/* Botão ⋮ (vertical) */}
      <div
        ref={menuRef}
        style={{
          position: "absolute",
          right: PAD,
          bottom: PAD,
          zIndex: 1002,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          aria-label="Mais opções"
          title="Mais opções"
          onClick={() => setMenuOpen((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            cursor: "pointer",
            padding: BTN_PAD,
            width: BTN_W,
            height: BTN_H,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 3,
            borderRadius: 6,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "rgba(0,0,0,0.06)"; // hover cinza claro
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor =
              "transparent";
          }}
        >
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "rgba(0,0,0,0.75)",
                display: "block",
              }}
            />
          ))}
        </button>

        {menuOpen && (
          <div
            style={{
              position: "absolute",
              right: 0,
              bottom: "calc(100% + 6px)",
              background: "#fff",
              border: "1px solid var(--gray-200)",
              borderRadius: 10,
              boxShadow: "0 10px 24px rgba(0,0,0,0.12)",
              minWidth: 170,
              padding: "6px 0",
              zIndex: 1003,
            }}
          >
            <button
              onClick={() => {
                setMenuOpen(false);
                onEdit?.();
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Editar
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                onDelete?.();
              }}
              style={{
                width: "100%",
                textAlign: "left",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                fontSize: 14,
                color: "#a11",
                fontWeight: 700,
              }}
            >
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- PÁGINA ---------- */
export default function BibliotecaPessoal() {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [data, setData] = useState<ApiResp>({
    items: [],
    total: 0,
    page: 1,
    limit: LIMIT,
  });
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const apiBase = useMemo(
    () =>
      (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(
        /\/$/,
        ""
      ),
    []
  );

  const pages = Math.max(1, Math.ceil((data.total || 0) / LIMIT));

  useEffect(() => {
    setPage(1);
  }, [user?.id]);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!user?.id) return;
      try {
        setLoading(true);
        setErro(null);

        const url = new URL(`${apiBase}/fosseis`);
        url.searchParams.set("userId", String(user.id));
        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", String(LIMIT));
        url.searchParams.set("orderBy", "createdAt");
        url.searchParams.set("orderDir", "desc");

        const resp = await fetch(url.toString(), { credentials: "include" });
        const json: ApiResp | Fossil[] = await resp.json();

        if (!resp.ok)
          throw new Error(
            (json as any)?.error || "Erro ao carregar sua biblioteca."
          );

        const items = Array.isArray(json) ? json : json.items ?? [];
        const total = Array.isArray(json)
          ? items.length
          : json.total ?? items.length;

        if (alive) setData({ items, total, page, limit: LIMIT });
      } catch (e: any) {
        if (alive) {
          setErro(e?.message || "Falha ao carregar.");
          setData({ items: [], total: 0, page: 1, limit: LIMIT });
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [apiBase, user?.id, page]);

  // ---- handlers de edição e exclusão ----
  const onEdit = (id: number) => {
    navigate(EDIT_ROUTE(id));
  };

  const onDelete = async (id: number, especie: string) => {
    if (!token) {
      alert("Você precisa estar logado.");
      return;
    }
    if (!confirm(`Excluir "${especie}"? Essa ação não pode ser desfeita.`)) return;

    try {
      const resp = await fetch(`${apiBase}/fosseis/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) {
        const j = await resp.json().catch(() => ({}));
        throw new Error(j?.error || "Falha ao excluir.");
      }
      // remove do estado
      setData((prev) => ({
        ...prev,
        items: prev.items.filter((f) => f.id !== id),
        total: Math.max(0, prev.total - 1),
      }));
    } catch (e: any) {
      alert(e?.message || "Erro ao excluir.");
      console.error(e);
    }
  };

  return (
    <section className="perfil-page container" style={{ paddingBottom: 24 }}>
      <div style={{ marginTop: 8, marginBottom: 8 }}>
        {/* título menor e neutro */}
        <h3
          className="section-title"
          style={{ fontSize: 20, fontWeight: 600, color: "#2b2b2b", margin: "12px 0 4px" }}
        >
          Biblioteca Pessoal
        </h3>
        <span className="muted">
          {data.total} fóssil{data.total === 1 ? "" : "s"}
        </span>
      </div>

      {loading && <div className="skeleton">Carregando…</div>}
      {erro && !loading && <div className="erro">{erro}</div>}
      {!loading && !erro && data.items.length === 0 && (
        <div className="vazio">Você ainda não adicionou nenhuma imagem.</div>
      )}

      {!loading && !erro && data.items.length > 0 && (
        <div className="grid-cards">
          {data.items.map((f) => (
            <CardPessoal
              key={f.id}
              to={`/detalhes/${f.id}`}
              imageUrl={makeImgSrc(apiBase, f.imageUrl)} // ✅ helper unificado
              title={f.especie || "—"}
              subtitle={`${f.periodo}${f.localizacao ? ` · ${f.localizacao}` : ""}`}
              onEdit={() => onEdit(f.id)}
              onDelete={() => onDelete(f.id, f.especie)}
            />
          ))}
        </div>
      )}

      {pages > 1 && !loading && !erro && (
        <div className="paginacao">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            &laquo;
          </button>
          {Array.from({ length: pages }, (_, i) => i + 1).map((n) => (
            <button
              key={n}
              className={n === page ? "active" : ""}
              onClick={() => setPage(n)}
            >
              {n}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(pages, p + 1))}
            disabled={page === pages}
          >
            &raquo;
          </button>
        </div>
      )}
    </section>
  );
}
