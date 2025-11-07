import "./index.css";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Card from "./components/Card";
import { makeImgSrc } from "./lib/img";

type Fossil = {
  id: number;
  especie: string;
  familia?: string | null;
  periodo: string;
  localizacao?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
};

function Biblioteca() {
  const [fosseis, setFosseis] = useState<Fossil[]>([]);
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

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErro(null);

        const url = new URL(`${apiBase}/fosseis`);
        url.searchParams.set("page", "1");
        url.searchParams.set("limit", "50");
        url.searchParams.set("orderBy", "createdAt");
        url.searchParams.set("orderDir", "desc");

        const resp = await fetch(url.toString(), { credentials: "include" });
        const json = await resp.json();

        if (!resp.ok) throw new Error(json?.error || "Erro ao buscar fósseis.");

        const list: Fossil[] = Array.isArray(json)
          ? json
          : json.items ?? [];
        if (alive) setFosseis(list);
      } catch (e: any) {
        if (alive) {
          setErro(e?.message || "Falha ao carregar a biblioteca.");
          setFosseis([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [apiBase]);

  const agrupados: Record<string, Fossil[]> = fosseis.reduce((acc, item) => {
    const key = item.periodo || "Indefinido";
    (acc[key] ||= []).push(item);
    return acc;
  }, {} as Record<string, Fossil[]>);

  if (loading) {
    return (
      <main className="container" style={{ padding: "40px 0" }}>
        <h1 className="h1" style={{ color: "var(--color-primary)" }}>
          Coleção de Fósseis
        </h1>
        <div className="skeleton">Carregando…</div>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="container" style={{ padding: "40px 0" }}>
        <h1 className="h1" style={{ color: "var(--color-primary)" }}>
          Coleção de Fósseis
        </h1>
        <div className="erro">{erro}</div>
      </main>
    );
  }

  const periodos = Object.keys(agrupados);

  return (
    <main className="container" style={{ paddingBottom: 24 }}>
      <h1 className="h1" style={{ color: "var(--color-primary)" }}>
        Coleção de Fósseis
      </h1>

      {periodos.map((periodo) => {
        const grupo = agrupados[periodo] ?? [];

        return (
          <section key={periodo} style={{ marginBottom: 40 }}>
            {/* Cabeçalho */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 12,
                marginBottom: 12,
              }}
            >
              <h2
                className="h2"
                style={{ color: "var(--color-primary)", margin: 0 }}
              >
                {periodo}
              </h2>

              {grupo.length > 8 && (
                <Link
                  to={`/periodo/${encodeURIComponent(periodo)}`}
                  state={{ from: { label: "Biblioteca", path: "/biblioteca" } }}
                  style={{
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    textDecoration: "none",
                  }}
                  aria-label={`Ver todos os fósseis do período ${periodo}`}
                >
                  Ver mais →
                </Link>
              )}
            </div>

            {/* Carrossel */}
            <div
              style={{
                display: "flex",
                gap: 16,
                overflowX: "auto",
                paddingBottom: 10,
              }}
            >
              {grupo.slice(0, 8).map((f) => (
                <Card
                  key={f.id}
                  to={`/detalhes/${f.id}`}
                  state={{ from: { label: "Biblioteca", path: "/biblioteca" } }}
                  imageUrl={makeImgSrc(apiBase, f.imageUrl)}
                  title={f.especie}
                  subtitle={`${f.periodo}${
                    f.localizacao ? ` · ${f.localizacao}` : ""
                  }`}
                  style={{ width: 220, flex: "0 0 auto" }}
                />
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}

export default Biblioteca;
