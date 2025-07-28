import './index.css';
import { useNavigate } from 'react-router-dom';
import Header from './Header';

function App() {
  const navigate = useNavigate();

  return (
    <div>
      <Header />

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
