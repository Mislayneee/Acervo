import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Esconder o header nessas rotas
  const hiddenRoutes = ['/login', '/cadastro'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  return (
    <header>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
        {/* ✅ troque o arquivo em /public/icon.png se quiser outra folha */}
        <img src="/icon.png" alt="" style={{ width: 22, height: 22 }} />
        <Link to="/" style={{ marginLeft: 0 }}>Acervo Fósseis</Link>
      </h1>

      <nav className="header-nav">
        <Link to="/biblioteca">Biblioteca</Link>
        <Link to="/contribuir">Contribuir</Link>
        <Link to="/sobre">Sobre</Link>

        {user ? (
          <img
            src="/perfil.png"
            alt="Perfil"
            title={user.nome}
            style={{ width: 32, height: 32, borderRadius: '50%', cursor: 'pointer' }}
            onClick={() => navigate('/perfil')}
          />
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
