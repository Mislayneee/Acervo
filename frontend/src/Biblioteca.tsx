import './index.css';
import Header from './Header';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

interface Fossil {
  id: number;
  especie: string;
  periodo: string;
  imageUrl: string;
}

function Biblioteca() {
  const [fosseis, setFosseis] = useState<Fossil[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/fosseis`)
      .then(res => res.json())
      .then(data => setFosseis(data))
      .catch(err => console.error('Erro ao buscar fósseis:', err));
  }, []);

  const agrupados = fosseis.reduce((acc: Record<string, Fossil[]>, item) => {
    const periodo = item.periodo?.toLowerCase() || 'indefinido';
    acc[periodo] = acc[periodo] || [];
    acc[periodo].push(item);
    return acc;
  }, {});

  return (
    <>
      <Header />

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
                        src={`${import.meta.env.VITE_API_URL}/uploads/${fossil.imageUrl}`}
                        alt={fossil.especie}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/icon.png';
                        }}
                      />
                    </div>

                    <span
                      style={{
                        fontSize: '14px',
                        wordWrap: 'break-word',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
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
