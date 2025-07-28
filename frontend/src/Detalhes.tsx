import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from './Header';

interface Fossil {
  id: number;
  especie: string;
  familia: string;
  descricao: string;
  localizacao: string;
  imageUrl: string;
}

function Detalhes() {
  const { id } = useParams();
  const [fossil, setFossil] = useState<Fossil | null>(null);

  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/fosseis/${id}`)
      .then(res => res.json())
      .then(data => setFossil(data))
      .catch(err => console.error('Erro ao buscar fóssil:', err));
  }, [id]);

  if (!fossil) return <p>Carregando...</p>;

  return (
    <>
      <Header />
      <main style={{ maxWidth: "1000px", margin: "0 auto", padding: "40px 20px" }}>
        <div style={{ marginBottom: "16px", fontSize: "14px" }}>
          <Link to="/biblioteca" style={{ color: "#666", textDecoration: "none" }}>
            Biblioteca
          </Link>{" "}
          / <span style={{ color: "#333" }}>Detalhes</span>
        </div>

        <h2 style={{ fontSize: "24px", marginBottom: "8px" }}>
          Espécie: {fossil.especie}
        </h2>
        <p style={{ color: "#666", marginBottom: "24px" }}>Família: {fossil.familia}</p>

        <div style={{ display: "flex", gap: "32px", flexWrap: "wrap" }}>
          <img
            src={`${import.meta.env.VITE_API_URL}${fossil.imageUrl}`}
            alt={fossil.especie}
            style={{ width: "400px", height: "300px", objectFit: "cover", borderRadius: "4px" }}
          />

          <div style={{ flex: "1 1 300px" }}>
            <h4 style={{ marginBottom: "16px" }}>Informações</h4>
            <div style={{ marginBottom: "16px" }}>
              <strong>Descrição</strong>
              <p>{fossil.descricao}</p>
            </div>
            <div>
              <strong>Localização</strong>
              <p>{fossil.localizacao}</p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}

export default Detalhes;
