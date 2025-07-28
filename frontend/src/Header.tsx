// src/Header.tsx
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function Header() {
  const { user } = useAuth();

  return (
    <header>
      <h1>
        <img src="/icon.png" alt="Logo" style={{ height: '26px', marginRight: '8px' }} />
        Coleção de Fósseis
      </h1>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/biblioteca">Biblioteca</Link>
        <Link to="/sobre">Sobre</Link>
        <Link to="/contribuir">Contribuir</Link>
        {user ? (
          <Link to="/perfil">Perfil</Link>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </nav>
    </header>
  );
}
