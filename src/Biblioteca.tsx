import './index.css';
import { Link } from 'react-router-dom';

const periodos = [
  "Devoniano", "Carbonífero", "Permiano", "Triássico", "Jurássico", "Cretáceo"
];

function Biblioteca() {
  return (
    <>
      <header>
        <h1>
          <img src="/icon.png" alt="Logo" style={{ height: '26px', marginRight: '8px' }} />
          Coleção de Fósseis
        </h1>
        <nav>
          <Link to="/">Home</Link>
          <Link to="/biblioteca">Biblioteca</Link>
          <a href="#">Sobre</a>
          <a href="#">Contribuir</a>
          <a href="#">Login</a>
        </nav>
      </header>

      <main style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {periodos.map((periodo, index) => (
          <section key={index} style={{ marginBottom: '40px' }}>
            <h3 style={{ fontSize: "16px", marginBottom: "10px", fontWeight: "600" }}>{periodo}</h3>
            <div style={{
              display: "flex",
              overflowX: "auto",
              gap: "16px",
              paddingBottom: "8px"
            }}>
              {[...Array(8)].map((_, i) => (
                <div key={i} style={{
                  minWidth: "160px",
                  height: "160px",
                  backgroundColor: "#d5edc4",
                  borderRadius: "6px",
                  flexShrink: 0,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontWeight: "500"
                }}>
                  Espécie {i + 1}
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </>
  );
}

export default Biblioteca;
