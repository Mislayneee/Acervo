import './index.css';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

interface Fossil {
  id: number;
  especie: string;
  periodo: string;
  imageUrl?: string | null;
  createdAt?: string;
}

function Biblioteca() {
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
        const resp = await fetch(`${apiBase}/fosseis`);
        const json = await resp.json();

        if (!resp.ok) {
          throw new Error(json?.error || 'Erro ao buscar fósseis.');
        }

        // Compatível com array puro OU objeto paginado { items, total... }
        const list: Fossil[] = Array.isArray(json) ? json : (json.items ?? []);
        if (alive) setFosseis(list);
      } catch (e: any) {
        if (alive) {
          setErro(e?.message || 'Falha ao carregar a biblioteca.');
          setFosseis([]);
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [apiBase]);

  const agrupados = fosseis.reduce((acc: Record<string, Fossil[]>, item) => {
    const periodo = (item.periodo || 'Indefinido').toLowerCase();
    acc[periodo] = acc[periodo] || [];
    acc[periodo].push(item);
    return acc;
  }, {});

  const formatSrc = (f: Fossil) => {
    // imageUrl costuma vir como "uploads/arquivo.jpg"
    const path = (f.imageUrl ?? '').replace(/^\/?/, ''); // remove barra inicial se houver
    return path ? `${apiBase}/${path}` : '/icon.png';
  };

  if (loading) {
    return (
      <main style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, marginBottom: 30 }}>Coleção de Fósseis</h2>
        <div className="skeleton">Carregando...</div>
      </main>
    );
  }

  if (erro) {
    return (
      <main style={{ padding: '40px 20px', maxWidth: 1200, margin: '0 auto' }}>
        <h2 style={{ fontSize: 28, marginBottom: 30 }}>Coleção de Fósseis</h2>
        <div className="erro">{erro}</div>
      </main>
    );
  }

  return (
    <>
      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '30px' }}>Coleção de Fósseis</h2>

        {Object.entries(agrupados).map(([periodo, grupo]) => (
          <section key={periodo} style={{ marginBottom: '60px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px'
            }}>
              <h3 style={{ fontSize: '20px', textTransform: 'capitalize' }}>{periodo}</h3>
              {grupo.length > 8 && (
                <Link to={`/periodo/${periodo}`} style={{ fontSize: '14px', color: '#1a4d2e' }}>
                  Ver todos →
                </Link>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                overflowX: 'auto',
                paddingBottom: '10px',
                gap: '16px'
              }}
            >
              {grupo.slice(0, 8).map(fossil => (
                <Link to={`/detalhes/${fossil.id}`} key={fossil.id} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      width: '160px',
                      height: '190px',
                      flex: '0 0 auto',
                      borderRadius: '10px',
                      padding: '10px',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'flex-start',
                      alignItems: 'center',
                      border: '1px solid #ccc',
                      backgroundColor: 'transparent',
                      transition: 'all 0.3s ease',
                      cursor: 'pointer',
                      overflow: 'hidden',
                      color: '#000'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = '#1a4d2e';
                      e.currentTarget.style.color = 'white';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = '#000';
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: '160px',
                        overflow: 'hidden',
                        borderRadius: '6px',
                        marginBottom: '8px'
                      }}
                    >
                      <img
                        src={formatSrc(fossil)}
                        alt={fossil.especie}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = '/icon.png';
                        }}
                      />
                    </div>

                    <span
                      style={{
                        fontSize: '14px',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        maxWidth: '100%'
                      }}
                      title={fossil.especie}
                    >
                      {fossil.especie}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}

export default Biblioteca;
