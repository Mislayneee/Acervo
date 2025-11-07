// src/Periodo.tsx
import "./index.css";
import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import Card from "./components/Card";
import { makeImgSrc } from "./lib/img"; // 🧩 helper de imagem

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

export default function Periodo() {
  const { nome } = useParams<{ nome: string }>();
  const location = useLocation();
  const from = (location.state as any)?.from ?? {
    label: "Biblioteca",
    path: "/biblioteca",
  };

  const [items, setItems] = useState<Fossil[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const apiBase = useMemo(
    () =>
      (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(
        /\/$/,
        ""
      ),
    []
  );

  // Volta pra página 1 ao trocar de período
  useEffect(() => {
    setPage(1);
  }, [nome]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErro(null);

        const url = new URL(`${apiBase}/fosseis`);
        if (nome) url.searchParams.set("periodo", nome);
        url.searchParams.set("page", String(page));
        url.searchParams.set("limit", String(LIMIT));
        url.searchParams.set("orderBy", "createdAt");
        url.searchParams.set("orderDir", "desc");

        const resp = await fetch(url.toString(), { credentials: "include" });
        const json: ApiResp | Fossil[] = await resp.json();
        if (!resp.ok)
          throw new Error((json as any)?.error || "Erro ao buscar fósseis.");

        const list = Array.isArray(json) ? json : json.items ?? [];
        const tot = Array.isArray(json)
          ? list.length
          : json.total ?? list.length;

        if (alive) {
          setItems(list);
          setTotal(tot);
        }
      } catch (e: any) {
        if (alive) {
          setErro(e?.message || "Falha ao carregar.");
          setItems([]);
          setTotal(0);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [apiBase, nome, page]);

  const pages = Math.max(1, Math.ceil(total / LIMIT));

  const tituloPeriodo =
    (nome && nome[0]?.toUpperCase() + nome.slice(1)) || "Período";

  // ⏳ Estado de carregamento
  if (loading) {
    return (
      <main className="container" style={{ padding: "40px 0" }}>
        <nav className="muted" style={{ marginBottom: 8 }}>
          <Link to={from.path}>{from.label}</Link> /{" "}
          <span>{tituloPeriodo}</span>
        </nav>
        <h1 className="h1" style={{ color: "var(--color-primary)" }}>
          {tituloPeriodo}
        </h1>
        <div className="skeleton">Carregando…</div>
      </main>
    );
  }

  // ⚠️ Erro
  if (erro) {
    return (
      <main className="container" style={{ padding: "40px 0" }}>
        <nav className="muted" style={{ marginBottom: 8 }}>
          <Link to={from.path}>{from.label}</Link> /{" "}
          <span>{tituloPeriodo}</span>
        </nav>
        <h1 className="h1" style={{ color: "var(--color-primary)" }}>
          {tituloPeriodo}
        </h1>
        <div className="erro">{erro}</div>
        <div style={{ marginTop: 12 }}>
          <Link
            to={from.path}
            style={{
              color: "var(--color-primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            ← Voltar à {from.label.toLowerCase()}
          </Link>
        </div>
      </main>
    );
  }

  // ✅ Conteúdo principal
  return (
    <main className="container" style={{ paddingBottom: 24 }}>
      {/* Breadcrumb dinâmico */}
      <nav className="muted" style={{ marginTop: 16, marginBottom: 8 }}>
        <Link to={from.path}>{from.label}</Link> / <span>{tituloPeriodo}</span>
      </nav>

      <div
        className="topbar"
        style={{ justifyContent: "space-between", marginBottom: 12 }}
      >
        <h1 className="h1" style={{ color: "var(--color-primary)", margin: 0 }}>
          {tituloPeriodo}
        </h1>
        <span className="muted">
          {total} resultado{total === 1 ? "" : "s"}
        </span>
      </div>

      {items.length === 0 ? (
        <div className="vazio">Nenhum fóssil encontrado para este período.</div>
      ) : (
        <div className="grid-cards">
          {items.map((f) => (
            <Card
              key={f.id}
              to={`/detalhes/${f.id}`}
              state={{
                from: {
                  label: `Biblioteca / ${tituloPeriodo}`,
                  path: `/periodo/${encodeURIComponent(nome ?? "")}`,
                },
              }}
              imageUrl={makeImgSrc(apiBase, f.imageUrl)}
              title={f.especie}
              subtitle={`${f.periodo}${
                f.localizacao ? ` · ${f.localizacao}` : ""
              }`}
            />
          ))}
        </div>
      )}

      {/* Paginação */}
      {pages > 1 && (
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
    </main>
  );
}
