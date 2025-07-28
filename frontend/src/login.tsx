import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './Header';

function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, senha }) // ✅ campo correto
      });

      const data = await response.json();

      if (response.ok) {
        login({
          id: data.user.id,
          nome: data.user.nome,
          email: data.user.email,
          token: data.token
        });

        navigate('/perfil');
      } else {
        alert(data.error || 'Credenciais inválidas');
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor');
      console.error(err);
    }
  };

  return (
    <>
      <Header />
      <div className="form-container">
        <h2>Entrar</h2>
        <form onSubmit={handleSubmit}>
          <label>Email:</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label>Senha:</label>
          <input
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          <button type="submit">Entrar</button>
        </form>
        <div className="troca-pagina">
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </div>
      </div>
    </>
  );
}

export default Login;
