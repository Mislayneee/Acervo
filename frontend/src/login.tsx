import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./index.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    try {
      await login(email, senha);
      navigate("/perfil");
    } catch (err: any) {
      alert(err?.message || "Credenciais inválidas.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-wrapper login-page">
      <div className="signup-card">
        <header className="signup-header">
          <h1 className="signup-title">Entrar na sua conta</h1>
        </header>

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="field">
            <label>E-mail</label>
            <input
              className="input"
              type="email"
              placeholder="seuemail@exemplo.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="field">
            <label>Senha</label>
            <input
              className="input"
              type="password"
              placeholder="Sua senha"
              required
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <div className="signup-footer">
          Não tem uma conta? <Link to="/cadastro">Cadastre-se</Link>
        </div>
      </div>
    </div>
  );
}
