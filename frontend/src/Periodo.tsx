import './index.css';
import Header from './Header';
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

interface Fossil {
  id: number;
  especie: string;
  periodo: string;
  imageUrl: string;
  local?: string;
}

function Periodo() {
  const { nome } = useParams();
  const [fosseis, setFosseis] = useState<Fossil[]>([]);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/fosseis?periodo=${nome}`)
      .then(res => res.json())
      .then(data => setFosseis(data))
      .catch(err => console.error('Erro ao buscar fósseis:', err));
  }, [nome]);

  return (
    <>
      <Header />

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '30px', textTransform: 'capitalize' }}>
          Fósseis do período {nome}
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '20px',
          }}
        >
          {fosseis.map((fossil) => (
            <Link
              to={`/detalhes/${fossil.id}`}
              key={fossil.id}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #ccc',
                  borderRadius: '10px',
                  padding: '10px',
                  height: '120px',
                  transition: 'background-color 0.3s, color 0.3s',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#1a4d2e';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = 'inherit';
                }}
              >
                <img
                  src={`${import.meta.env.VITE_API_URL}/uploads/${fossil.imageUrl}`}
                  alt={fossil.especie}
                  style={{
                    width: '100px',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '8px',
                    flexShrink: 0,
                    marginRight: '10px',
                  }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/icon.png';
                  }}
                />

                <div style={{ flex: 1 }}>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: '16px',
                      marginBottom: '6px',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {fossil.especie}
                  </h4>
                  <p style={{ margin: 0, fontSize: '14px', opacity: 0.8 }}>
                    {fossil.local || 'Local desconhecido'}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}

export default Periodo;
