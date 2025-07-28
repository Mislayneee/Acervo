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

  // Agrupar fósseis por período
  const agrupados = fosseis.reduce((acc: Record<string, Fossil[]>, item) => {
    acc[item.periodo] = acc[item.periodo] || [];
    acc[item.periodo].push(item);
    return acc;
  }, {});

  return (
    <>
      <Header />

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {Object.entries(agrupados).map(([periodo, grupo]) => (
          <section key={periodo} style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: "16px", marginBottom: "10px", fontWeight: "600" }}>{periodo}</h3>
            <div style={{
              display: "flex",
              overflowX: "auto",
              gap: "16px",
              paddingBottom: "8px"
            }}>
              {grupo.map((fossil) => (
                <Link
                  key={fossil.id}
                  to={`/detalhes/${fossil.id}`}
                  style={{
                    minWidth: "160px",
                    height: "160px",
                    borderRadius: "6px",
                    flexShrink: 0,
                    overflow: "hidden",
                    backgroundColor: "#f4f4f4",
                    textDecoration: "none",
                    color: "black",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center"
                  }}
                >
                  <img
                    src={`${import.meta.env.VITE_API_URL}${fossil.imageUrl}`}
                    alt={fossil.especie}
                    style={{ width: "100%", height: "120px", objectFit: "cover" }}
                  />
                  <div style={{ padding: "6px", fontSize: "14px", fontWeight: "500", textAlign: "center" }}>
                    {fossil.especie}
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
