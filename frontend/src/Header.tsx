// src/Header.tsx
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';

function initialsFromName(name?: string) {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  const first = parts[0]?.[0] || '';
  const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
  return (first + last).toUpperCase();
}

export default function Header() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const hiddenRoutes = ['/login', '/cadastro'];
  if (hiddenRoutes.includes(location.pathname)) return null;

  const initials = initialsFromName(user?.nome);

  return (
    <header>
      <h1 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
        <img src="/icon.png" alt="" style={{ width: 22, height: 22 }} />
        <Link to="/" style={{ marginLeft: 0 }}>Acervo Fósseis</Link>
      </h1>

      <nav className="header-nav">
        <Link to="/">Home</Link>
        <Link to="/biblioteca">Biblioteca</Link>
        <Link to="/contribuir">Contribuir</Link>
        <Link to="/sobre">Sobre</Link>

        {user ? (
          <div
            title={user.nome}
            onClick={() => navigate('/perfil')}
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'var(--color-primary, #2f6b2f)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              cursor: 'pointer',
              userSelect: 'none',
            }}
          >
            {initials}
          </div>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
