import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';

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

export default function Pesquisa() {
  const loc = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => new URLSearchParams(loc.search), [loc.search]);

  const [q, setQ] = useState(params.get('q') ?? '');
  const [periodo, setPeriodo] = useState(params.get('periodo') ?? '');
  const [familia, setFamilia] = useState(params.get('familia') ?? '');
  const [localizacao, setLocalizacao] = useState(params.get('localizacao') ?? '');
  const [order, setOrder] = useState(params.get('order') ?? 'createdAt:desc');
  const [page, setPage] = useState<number>(Number(params.get('page') ?? '1') || 1);

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<ApiResp>({ items: [], total: 0, page: 1, pageSize: PAGE_SIZE });
  const [error, setError] = useState<string | null>(null);

  const updateURL = (next: Partial<Record<string, string | number | undefined>>) => {
    const p = new URLSearchParams(loc.search);
    const entries: [string, string | number | undefined][] = [
      ['q', next.q ?? q],
      ['periodo', next.periodo ?? periodo],
      ['familia', next.familia ?? familia],
      ['localizacao', next.localizacao ?? localizacao],
      ['order', next.order ?? order],
      ['page', String(next.page ?? page)],
      ['pageSize', String(PAGE_SIZE)],
    ];
    entries.forEach(([k, v]) => {
      if (v && String(v).trim() !== '') p.set(k, String(v));
      else p.delete(k);
    });
    navigate(`/pesquisa?${p.toString()}`, { replace: true });
  };

  useEffect(() => {
    setQ(params.get('q') ?? '');
    setPeriodo(params.get('periodo') ?? '');
    setFamilia(params.get('familia') ?? '');
    setLocalizacao(params.get('localizacao') ?? '');
    setOrder(params.get('order') ?? 'createdAt:desc');
    setPage(Number(params.get('page') ?? '1') || 1);
  }, [params]);

  useEffect(() => {
    const controller = new AbortController();
    const t = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);
        const base = import.meta.env.VITE_API_URL;
        const qs = new URLSearchParams();
        if (q) qs.set('q', q);
        if (periodo) qs.set('periodo', periodo);
        if (familia) qs.set('familia', familia);
        if (localizacao) qs.set('localizacao', localizacao);
        if (order) qs.set('order', order);
        qs.set('page', String(page));
        qs.set('pageSize', String(PAGE_SIZE));

        const url = `${base}/fosseis?${qs.toString()}`;
        const resp = await axios.get<ApiResp>(url, { signal: controller.signal });
        setData(resp.data);
      } catch (e: any) {
        if (e.name !== 'CanceledError' && e.name !== 'AbortError') {
          setError('Erro ao carregar resultados.');
        }
      } finally {
        setLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(t);
    };
  }, [q, periodo, familia, localizacao, order, page]);

  const onSubmitSearch = (evt: React.FormEvent) => {
    evt.preventDefault();
    setPage(1);
    updateURL({ page: 1 });
  };
  const clearQ = () => {
    setQ('');
    setPage(1);
    updateURL({ q: '', page: 1 });
  };

  const periodos = ['Cambriano', 'Ordoviciano', 'Siluriano', 'Devoniano', 'Carbonífero', 'Permiano', 'Triássico', 'Jurássico', 'Cretáceo', 'Paleógeno', 'Neógeno', 'Quaternário'];
  const ordens = [
    { value: 'createdAt:desc', label: 'Mais recentes' },
    { value: 'especie:asc', label: 'Espécie (A–Z)' },
    { value: 'familia:asc', label: 'Família (A–Z)' },
    { value: 'periodo:asc', label: 'Período (A–Z)' },
    { value: 'localizacao:asc', label: 'Localização (A–Z)' },
  ];

  const totalPages = Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  const goTo = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages);
    setPage(next);
    updateURL({ page: next });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="pesquisa-page">
      <div className="layout">
        <aside className="sidebar">
          <div className="filtro">
            <label>Período Geológico</label>
            <select
              value={periodo}
              onChange={(e) => { setPeriodo(e.target.value); setPage(1); updateURL({ periodo: e.target.value, page: 1 }); }}
            >
              <option value="">Todos</option>
              {periodos.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          <div className="filtro">
            <label>Família Botânica</label>
            <input
              type="text"
              placeholder="Ex.: Lepidodendraceae"
              value={familia}
              onChange={(e) => { setFamilia(e.target.value); setPage(1); updateURL({ familia: e.target.value, page: 1 }); }}
            />
          </div>

          <div className="filtro">
            <label>Localização Geográfica</label>
            <input
              type="text"
              placeholder="Ex.: Piauí"
              value={localizacao}
              onChange={(e) => { setLocalizacao(e.target.value); setPage(1); updateURL({ localizacao: e.target.value, page: 1 }); }}
            />
          </div>
        </aside>

        <main className="content">
          <div className="topbar">
            <form onSubmit={onSubmitSearch} className="searchbar">
              <button type="submit" aria-label="Pesquisar">🔍</button>
              <input
                type="text"
                placeholder="Pesquisar Fóssil..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              {q && <button type="button" onClick={clearQ} aria-label="Limpar">✕</button>}
            </form>

            <div className="ordenar">
              <label>Ordenar por</label>
              <select
                value={order}
                onChange={(e) => { setOrder(e.target.value); setPage(1); updateURL({ order: e.target.value, page: 1 }); }}
              >
                {ordens.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </div>

          {loading && <div className="skeleton">Carregando...</div>}
          {error && <div className="erro">{error}</div>}
          {!loading && !error && data.items.length === 0 && <div className="vazio">Nenhum fóssil encontrado.</div>}

          <ul className="results">
            {data.items.map((f) => {
              const base = import.meta.env.VITE_API_URL?.replace(/\/$/, '');
              // se imageUrl já vier como "/uploads/arquivo.jpg" ou "uploads/arquivo.jpg", tratamos:
              const path = (f.imageUrl ?? '').replace(/^\/?/, ''); // remove / inicial se houver
              const src = f.imageUrl ? `${base}/${path}` : '';

              return (
                <li key={f.id} className="card">
                  {/* Thumb com fallback */}
                  {src ? (
                    <img
                      className="thumb-img"
                      src={src}
                      alt={`Imagem de ${f.especie || 'fóssil'}`}
                      onError={(e) => {
                        // se a imagem falhar, vira o placeholder verde
                        (e.currentTarget as HTMLImageElement).style.display = 'none';
                        const sibling = e.currentTarget.nextElementSibling as HTMLDivElement | null;
                        if (sibling && sibling.classList.contains('thumb-fallback')) {
                          sibling.style.display = 'block';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="thumb-fallback"
                    style={{ display: src ? 'none' : 'block' }}
                    aria-hidden={!!src}
                  />

                  {/* Meta + link para detalhes */}
                  <div className="meta">
                    <a href={`/detalhes/${f.id}`} className="title-link">
                      <div className="title">Espécie: {f.especie || '—'}</div>
                    </a>
                    <div className="line">Localizado: {f.localizacao || '—'}</div>
                    <div className="line">Período: {f.periodo || '—'}</div>
                  </div>
                </li>
              );
            })}
          </ul>


          {totalPages > 1 && (
            <div className="paginacao">
              <button onClick={() => goTo(page - 1)} disabled={page <= 1} aria-label="Anterior">‹</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let num = i + 1;
                if (totalPages > 7) {
                  const start = Math.max(1, Math.min(page - 3, totalPages - 6));
                  num = start + i;
                }
                return (
                  <button
                    key={num}
                    onClick={() => goTo(num)}
                    className={num === page ? 'active' : ''}
                  >
                    {num}
                  </button>
                );
              })}
              <button onClick={() => goTo(page + 1)} disabled={page >= totalPages} aria-label="Próxima">›</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
