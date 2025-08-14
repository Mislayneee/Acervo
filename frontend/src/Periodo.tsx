// src/Periodo.tsx
import './index.css';
import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Fossil {
  id: number;
  especie: string;
  periodo: string;
  imageUrl?: string | null;
  localizacao?: string | null;
  createdAt?: string;
}

type ApiResp = {
  items: Fossil[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 24;

function Periodo() {
  const { nome } = useParams(); // ex.: "jurássico" (minúsculas do agrupamento)
  const [fosseis, setFosseis] = useState<Fossil[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''),
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErro(null);

        const qs = new URLSearchParams();
        if (nome) qs.set('periodo', nome); // backend faz case-insensitive
        qs.set('order', 'createdAt:desc');
        qs.set('page', '1');
        qs.set('pageSize', String(PAGE_SIZE));

        const resp = await fetch(`${apiBase}/fosseis?${qs.toString()}`);
        const json = await resp.json();
        if (!resp.ok) throw new Error(json?.error || 'Erro ao buscar fósseis.');

        // aceita tanto array quanto objeto paginado
        const list: Fossil[] = Array.isArray(json) ? json : (json.items ?? []);
        if (alive) setFosseis(list);
      } catch (e: any) {
        if (alive) {
          setErro(e?.message || 'Falha ao carregar.');
          setFosseis([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [nome, apiBase]);

  const formatSrc = (f: Fossil) => {
    const path = (f.imageUrl ?? '').replace(/^\/?/, ''); // remove "/" inicial
    return path ? `${apiBase}/${path}` : '/icon.png';
  };

  const tituloPeriodo = (nome || '').charAt(0).toUpperCase() + (nome || '').slice(1);

  if (loading) {
    return (
      <main style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, marginBottom: 30 }}>Fósseis do período {tituloPeriodo}</h2>
        <div className="skeleton">Carregando...</div>
      </main>
    );
  }

  if (erro) {
    return (
      <main style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, marginBottom: 30 }}>Fósseis do período {tituloPeriodo}</h2>
        <div className="erro">{erro}</div>
        <div style={{ marginTop: 12 }}>
          <Link to="/biblioteca" style={{ color: '#1a4d2e', fontWeight: 600 }}>← Voltar à biblioteca</Link>
        </div>
      </main>
    );
  }

  return (
    <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ fontSize: '28px', marginBottom: '30px', textTransform: 'capitalize' }}>
        Fósseis do período {tituloPeriodo}
      </h2>

      {fosseis.length === 0 && (
        <div className="vazio">Nenhum fóssil encontrado para este período.</div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {fosseis.map((fossil) => (
          <Link
            to={`/detalhes/${fossil.id}`}
            key={fossil.id}
            className="bib-card"
            style={{ textDecoration: 'none', color: 'inherit' }}
          >
            <div className="bib-thumb-wrap">
              <img
                src={formatSrc(fossil)}
                alt={fossil.especie}
                className="bib-thumb"
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/icon.png'; }}
              />
            </div>

            <div style={{ padding: '10px 12px' }}>
              <div className="bib-title">{fossil.especie || '—'}</div>
              <div className="bib-date">{fossil.localizacao || 'Local desconhecido'}</div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}

export default Periodo;
