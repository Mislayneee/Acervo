import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import axios from "axios";

type Fossil = {
  id: number;
  especie: string;
  familia: string;
  periodo: string;
  localizacao: string;
  descricao: string;
  imageUrl?: string;
};

type ApiResp = {
  items: Fossil[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 10;

function sortItems(items: Fossil[], order: string) {
  const [field, dir = "asc"] = order.split(":");
  const asc = dir.toLowerCase() !== "desc";
  const byText = (a?: string, b?: string) =>
    (a ?? "").localeCompare(b ?? "", "pt-BR", { sensitivity: "base" });

  const clone = [...items];

  switch (field) {
    case "especie":
      clone.sort((a, b) => (asc ? byText(a.especie, b.especie) : byText(b.especie, a.especie)));
      break;
    case "familia":
      clone.sort((a, b) => (asc ? byText(a.familia, b.familia) : byText(b.familia, a.familia)));
      break;
    case "periodo":
      clone.sort((a, b) => (asc ? byText(a.periodo, b.periodo) : byText(b.periodo, a.periodo)));
      break;
    case "localizacao":
      clone.sort((a, b) => (asc ? byText(a.localizacao, b.localizacao) : byText(b.localizacao, a.localizacao)));
      break;
    case "createdAt":
    default:
      break;
  }
  return clone;
}

export default function Pesquisa() {
  const styles = {
    page: { maxWidth: 1100, margin: "24px auto", padding: "0 24px" },
    layout: { display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 as const, textAlign: "left" as const },
    sidebar: { background: "#f7f9f7", borderRadius: 12, padding: 16, border: "1px solid #e7ece7" },
    filtro: { display: "flex", flexDirection: "column" as const, gap: 6, marginBottom: 12 },
    select: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d0d5d0" },
    input: { padding: "10px 12px", borderRadius: 10, border: "1px solid #d0d5d0" },
    content: {},
    topbar: { display: "grid", gridTemplateColumns: "minmax(0,1fr) max-content", alignItems: "center", gap: 14, marginBottom: 12 },
    searchbar: { display: "flex", alignItems: "center", gap: 8, minHeight: 40, background: "#fff", border: "1px solid #ccd0cb", borderRadius: 999, padding: "8px 14px" },
    searchInput: { flex: 1, border: "none", outline: "none", background: "transparent" },
    ordenar: { display: "flex", flexDirection: "row" as const, alignItems: "center", gap: 8 },
    ordenarLabel: { margin: 0, fontSize: ".9rem", whiteSpace: "nowrap" as const },
    ordenarSelect: { padding: "8px 10px", borderRadius: 10, border: "1px solid #d0d5d0", background: "#fff" },
    results: { marginTop: 14, listStyle: "none", padding: 0, display: "grid", gridTemplateColumns: "repeat(2, minmax(380px, 1fr))", gap: 18 },
    card: { background: "#fff", border: "1px solid #e3e6e3", borderRadius: 12, padding: 12, transition: "transform .18s, box-shadow .18s, border-color .18s, background-color .18s" },
    linkRow: { display: "flex", alignItems: "center", gap: 14, color: "inherit", textDecoration: "none" },
    thumb: { width: 120, height: 120, borderRadius: 10, objectFit: "cover" as const, flexShrink: 0 as const, transition: "transform .25s" },
    fallback: { width: 120, height: 120, borderRadius: 10, background: "#dfe7df", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, color: "#3b6e3b", flexShrink: 0 as const, transition: "background-color .18s, color .18s" },
    metaTitle: { fontWeight: 700 as const, fontSize: "1.05rem", transition: "color .18s" },
    metaLine: { fontSize: ".93rem", color: "#555", transition: "color .18s" },
    paginacao: { marginTop: 18, display: "flex", justifyContent: "center", gap: 8 },
    pagBtn: { background: "#fff", border: "1px solid #cfd4cf", borderRadius: 6, padding: "5px 10px", cursor: "pointer" },
    pagBtnActive: { background: "#3b6e3b", color: "#fff", border: "1px solid #3b6e3b", borderRadius: 6, padding: "5px 10px", cursor: "pointer" },
    skeleton: { padding: 12, textAlign: "center" as const, color: "#6a6f6a" },
    empty: { padding: 12, textAlign: "center" as const, color: "#6a6f6a" },
    error: { padding: 12, textAlign: "center" as const, color: "#a11" },
  };

  const loc = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, ""),
    []
  );

  const [q, setQ] = useState(params.get("q") ?? "");
  const [periodo, setPeriodo] = useState(params.get("periodo") ?? "");
  const [familia, setFamilia] = useState(params.get("familia") ?? "");
  const [localizacao, setLocalizacao] = useState(params.get("localizacao") ?? "");
  const [order, setOrder] = useState(params.get("order") ?? "createdAt:desc");
  const [page, setPage] = useState<number>(Number(params.get("page") ?? "1") || 1);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResp>({ items: [], total: 0, page: 1, pageSize: PAGE_SIZE });
  const [error, setError] = useState<string | null>(null);

  // novo: controla qual card está em hover
  const [hoveredId, setHoveredId] = useState<number | null>(null);

  const updateURL = (next: Partial<Record<string, string | number | undefined>>) => {
    const p = new URLSearchParams(loc.search);
    const fields: [string, string | number | undefined][] = [
      ["q", next.q ?? q],
      ["periodo", next.periodo ?? periodo],
      ["familia", next.familia ?? familia],
      ["localizacao", next.localizacao ?? localizacao],
      ["order", next.order ?? order],
      ["page", String(next.page ?? page)],
      ["pageSize", String(PAGE_SIZE)],
    ];
    fields.forEach(([k, v]) => {
      if (v && String(v).trim() !== "") p.set(k, String(v));
      else p.delete(k);
    });
    navigate(`/pesquisa?${p.toString()}`, { replace: true });
  };

  useEffect(() => {
    setQ(params.get("q") ?? "");
    setPeriodo(params.get("periodo") ?? "");
    setFamilia(params.get("familia") ?? "");
    setLocalizacao(params.get("localizacao") ?? "");
    setOrder(params.get("order") ?? "createdAt:desc");
    setPage(Number(params.get("page") ?? "1") || 1);
  }, [params]);

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        const qs = new URLSearchParams();
        if (q) qs.set("q", q);
        if (periodo) qs.set("periodo", periodo);
        if (familia) qs.set("familia", familia);
        if (localizacao) qs.set("localizacao", localizacao);
        if (order) qs.set("order", order);
        qs.set("page", String(page));
        qs.set("pageSize", String(PAGE_SIZE));

        const url = `${apiBase}/fosseis?${qs.toString()}`;
        const resp = await axios.get<ApiResp>(url, { signal: controller.signal });

        const sorted = sortItems(resp.data.items, order);
        setData({ ...resp.data, items: sorted });
      } catch (e: any) {
        if (e.name !== "CanceledError" && e.name !== "AbortError") setError("Erro ao carregar resultados.");
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => { controller.abort(); clearTimeout(t); };
  }, [q, periodo, familia, localizacao, order, page, apiBase]);

  const onSubmitSearch = (evt: React.FormEvent) => {
    evt.preventDefault();
    setPage(1);
    updateURL({ page: 1 });
  };
  const clearQ = () => {
    setQ("");
    setPage(1);
    updateURL({ q: "", page: 1 });
  };

  const periodos = ["Cambriano","Ordoviciano","Siluriano","Devoniano","Carbonífero","Permiano","Triássico","Jurássico","Cretáceo","Paleógeno","Neógeno","Quaternário"];

  const ordens = [
    { value: "createdAt:desc", label: "Mais recentes" },
    { value: "especie:asc", label: "Espécie (A–Z)" },
    { value: "familia:asc", label: "Família (A–Z)" },
    { value: "periodo:asc", label: "Período (A–Z)" },
    { value: "localizacao:asc", label: "Localização (A–Z)" },
  ];

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const goTo = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    updateURL({ page: next });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const primary = "var(--color-primary, #0b4e2f)";

  return (
    <div style={styles.page as React.CSSProperties}>
      <div style={styles.layout as React.CSSProperties}>
        {/* Sidebar */}
        <aside style={styles.sidebar as React.CSSProperties}>
          <h3 style={{ marginTop: 0 }}>Filtros</h3>

          <div style={styles.filtro}>
            <label>Período Geológico</label>
            <select
              value={periodo || ""}
              onChange={(e) => { setPeriodo(e.target.value); setPage(1); updateURL({ periodo: e.target.value, page: 1 }); }}
              style={styles.select as React.CSSProperties}
            >
              <option value="">Todos</option>
              {periodos.map((p) => (<option key={p} value={p}>{p}</option>))}
            </select>
          </div>

          <div style={styles.filtro}>
            <label>Família Botânica</label>
            <input
              type="text"
              placeholder="Ex.: Lepidodendraceae"
              value={familia}
              onChange={(e) => { setFamilia(e.target.value); setPage(1); updateURL({ familia: e.target.value, page: 1 }); }}
              style={styles.input as React.CSSProperties}
            />
          </div>

          <div style={styles.filtro}>
            <label>Localização Geográfica</label>
            <input
              type="text"
              placeholder="Ex.: Piauí"
              value={localizacao}
              onChange={(e) => { setLocalizacao(e.target.value); setPage(1); updateURL({ localizacao: e.target.value, page: 1 }); }}
              style={styles.input as React.CSSProperties}
            />
          </div>
        </aside>

        {/* Conteúdo */}
        <main style={styles.content as React.CSSProperties}>
          <div style={styles.topbar as React.CSSProperties}>
            <form onSubmit={onSubmitSearch} style={styles.searchbar as React.CSSProperties}>
              <span aria-hidden>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Pesquisar fósseis..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                aria-label="Pesquisar fósseis"
                style={styles.searchInput as React.CSSProperties}
              />
              {q && (
                <button type="button" onClick={clearQ} aria-label="Limpar"
                  style={{ border: "none", background: "transparent", fontSize: "1.1rem", color: "#666", cursor: "pointer" }}>
                  ×
                </button>
              )}
            </form>

            <div style={styles.ordenar as React.CSSProperties}>
              <label htmlFor="orderSelect" style={styles.ordenarLabel as React.CSSProperties}>Ordenar por:</label>
              <select
                id="orderSelect"
                value={order}
                onChange={(e) => { setOrder(e.target.value); setPage(1); updateURL({ order: e.target.value, page: 1 }); }}
                style={styles.ordenarSelect as React.CSSProperties}
              >
                {ordens.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
              </select>
            </div>
          </div>

          {loading && <div style={styles.skeleton}>Carregando...</div>}
          {error && <div style={styles.error}>{error}</div>}
          {!loading && !error && data.items.length === 0 && (<div style={styles.empty}>Nenhum fóssil encontrado.</div>)}

          <ul style={styles.results as React.CSSProperties}>
            {data.items.map((f) => {
              const path = (f.imageUrl ?? "").replace(/^\/?/, "");
              const src = f.imageUrl ? `${apiBase}/${path}` : "";
              const fromLabel = "Pesquisa";
              const fromPath = `/pesquisa${location.search || ""}`;

              const isHover = hoveredId === f.id;

              return (
                <li
                  key={f.id}
                  style={{
                    ...(styles.card as React.CSSProperties),
                    background: isHover ? primary : "#fff",
                    border: isHover ? `1px solid ${primary}` : "1px solid #e3e6e3",
                    transform: isHover ? "translateY(-3px)" : "translateY(0)",
                    boxShadow: isHover ? "0 6px 18px rgba(0,0,0,.14)" : "none",
                  }}
                  onMouseEnter={() => setHoveredId(f.id)}
                  onMouseLeave={() => setHoveredId(null)}
                >
                  <Link
                    to={{ pathname: `/detalhes/${f.id}` }}
                    state={{ from: { label: fromLabel, path: fromPath } }}
                    style={{
                      ...(styles.linkRow as React.CSSProperties),
                      color: isHover ? "#fff" : "inherit",
                    }}
                    aria-label={`Abrir detalhes de ${f.especie || "fóssil"}`}
                  >
                    {src ? (
                      <img
                        src={src}
                        alt={`Imagem de ${f.especie || "fóssil"}`}
                        style={{
                          ...(styles.thumb as React.CSSProperties),
                          transform: isHover ? "scale(1.03)" : "scale(1)",
                        }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display = "none";
                          const fallback = e.currentTarget.nextElementSibling as HTMLDivElement | null;
                          if (fallback) fallback.style.display = "flex";
                        }}
                      />
                    ) : null}

                    <div
                      className="thumb-fallback"
                      style={{
                        ...(styles.fallback as React.CSSProperties),
                        display: src ? "none" : "flex",
                        background: isHover ? "rgba(255,255,255,.12)" : "#dfe7df",
                        color: isHover ? "#fff" : "#3b6e3b",
                      }}
                    >
                      🦴
                    </div>

                    <div>
                      <div
                        style={{
                          ...(styles.metaTitle as React.CSSProperties),
                          color: isHover ? "#fff" : "inherit",
                        }}
                      >
                        Espécie: {f.especie || "—"}
                      </div>
                      <div
                        style={{
                          ...(styles.metaLine as React.CSSProperties),
                          color: isHover ? "#fff" : "#555",
                        }}
                      >
                        Localizado: {f.localizacao || "—"}
                      </div>
                      <div
                        style={{
                          ...(styles.metaLine as React.CSSProperties),
                          color: isHover ? "#fff" : "#555",
                        }}
                      >
                        Período: {f.periodo || "—"}
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>

          {totalPages > 1 && (
            <div style={styles.paginacao as React.CSSProperties}>
              <button onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Anterior" style={styles.pagBtn as React.CSSProperties}>‹</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let num = i + 1;
                if (totalPages > 7) {
                  const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                  num = start + i;
                }
                return (
                  <button key={num} onClick={() => goTo(num)}
                    style={num === page ? (styles.pagBtnActive as React.CSSProperties) : (styles.pagBtn as React.CSSProperties)}>
                    {num}
                  </button>
                );
              })}
              <button onClick={() => goTo(page + 1)} disabled={page >= totalPages} aria-label="Próxima" style={styles.pagBtn as React.CSSProperties}>›</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
