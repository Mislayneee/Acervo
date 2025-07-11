import './index.css';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

function App() {
  const navigate = useNavigate();

  return (
    <div>
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

      <div className="banner">
        <img src="/folha.jpg" alt="Fóssil" />
        <h2>Acervo Digital de Fósseis Vegetais</h2>
      </div>

      <div
        className="search-box"
        style={{ cursor: "pointer" }}
        onClick={() => navigate("/pesquisa")}
      >
        <span style={{ marginRight: "10px" }}>🔍</span>
        <input
          type="text"
          placeholder="Pesquisar..."
          style={{ pointerEvents: "none", backgroundColor: "transparent" }}
          readOnly
        />
      </div>
    </div>
  );
}

export default App;
