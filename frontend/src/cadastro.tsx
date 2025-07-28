import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Header from './Header';

function Cadastro() {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, senha })
      });

      const data = await response.json(); // 👈 parse do JSON sempre

      if (response.ok) {
        login({
          id: data.user.id,
          nome: data.user.nome,
          email: data.user.email,
          token: data.token
        });
        navigate('/perfil');
      } else {
        alert(data.error || 'Erro ao cadastrar'); // 👈 erro retornado pela API
      }
    } catch (err) {
      alert('Erro ao conectar com o servidor'); // 👈 só erro de rede real
      console.error('Erro no cadastro:', err);
    }
  };

  return (
    <>
      <Header />
      <div className="form-container">
        <h2>Criar Conta</h2>
        <form onSubmit={handleSubmit}>
          <label>Nome:</label>
          <input
            type="text"
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
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
          <button type="submit">Cadastrar</button>
        </form>
        <div className="troca-pagina">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </div>
      </div>
    </>
  );
}

export default Cadastro;
