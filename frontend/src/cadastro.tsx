import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./index.css";

type Atuacao = "" | "Estudante" | "Pesquisador(a)" | "Docente" | "Técnico(a)" | "Outro";

export default function Cadastro() {
  const navigate = useNavigate();
  const { register, token } = useAuth();

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, ""),
    []
  );

  // credenciais
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");

  // perfil público
  const [atuacao, setAtuacao] = useState<Atuacao>(""); // começa vazio (obrigatório selecionar)
  const [afiliacao, setAfiliacao] = useState("");
  const [cidade, setCidade] = useState("");
  const [estado, setEstado] = useState("");
  const [pais, setPais] = useState("");

  // links opcionais
  const [lattes, setLattes] = useState("");

  // privacidade
  const [showName, setShowName] = useState(true);
  const [showAffiliation, setShowAffiliation] = useState(true);
  const [showContact, setShowContact] = useState(false);
  const [publicContact, setPublicContact] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const urlOk = (s: string) => {
    if (!s) return true;
    try { new URL(s); return true; } catch { return false; }
  };

  async function saveExtras() {
    if (!token) return;
    const payload: Record<string, any> = {
      displayName: nome,
      role: atuacao || undefined,          // redundante, mas mantém perfil sincronizado
      affiliation: afiliacao || undefined,
      city: cidade || undefined,
      state: estado || undefined,
      country: pais || undefined,
      lattes: lattes || undefined,
      showName,
      showAffiliation,
      showContact,
      publicContact: showContact ? (publicContact || undefined) : undefined,
    };
    Object.keys(payload).forEach((k) => payload[k] === undefined && delete payload[k]);

    await fetch(`${apiBase}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      credentials: "include",
      body: JSON.stringify(payload),
    }).catch(() => {});
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // validações
    if (!nome.trim()) return setErro("Informe seu nome completo.");
    if (!email.trim()) return setErro("Informe seu e-mail.");
    if (!senha || senha.length < 6) return setErro("Senha deve ter ao menos 6 caracteres.");
    if (senha !== confirma) return setErro("As senhas não conferem.");
    if (!atuacao.trim()) return setErro("Informe sua atuação.");          // ← OBRIGATÓRIO
    if (!urlOk(lattes)) return setErro("Lattes inválido (use a URL completa).");
    if (showContact && !publicContact.trim())
      return setErro("Informe o contato público (e-mail alternativo ou telefone).");

    setErro(null);
    setSubmitting(true);

    try {
      // IMPORTANTE: envia a atuação no /auth/register
      await register(nome, email, senha, atuacao);

      // salva demais campos do perfil
      await saveExtras();
      navigate("/perfil");
    } catch (err: any) {
      setErro(err?.message || "Erro ao cadastrar.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="signup-wrapper">
      <div className="signup-card">
        <header className="signup-header">
          <h1 className="signup-title">Criar Conta</h1>
          <p className="signup-subtitle">
            Crie sua conta para <strong>contribuir</strong> com o acervo digital de fósseis vegetais.
          </p>
        </header>

        {erro && <div className="form-alert">{erro}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          {/* Acesso */}
          <div className="fieldset">
            <div className="legend">Acesso</div>

            <div className="grid-2">
              <div className="field">
                <label>Nome completo *</label>
                <input
                  className="input"
                  placeholder="Digite seu nome completo"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>

              <div className="field">
                <label>E-mail *</label>
                <input
                  className="input"
                  type="email"
                  placeholder="exemplo@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Senha *</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Crie uma senha forte"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Confirmar senha *</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Confirme sua senha"
                  value={confirma}
                  onChange={(e) => setConfirma(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Perfil público */}
          <div className="fieldset">
            <div className="legend">
              Perfil público{" "}
              <span className="legend-note">
                (essas informações aparecem na página dos fósseis que você publicar e ajudam na validação/contato)
              </span>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Atuação *</label>
                <select
                  className="input"
                  value={atuacao}
                  onChange={(e) => setAtuacao(e.target.value as Atuacao)}
                >
                  <option value="">Selecione sua atuação</option>
                  <option value="Estudante">Estudante</option>
                  <option value="Pesquisador(a)">Pesquisador(a)</option>
                  <option value="Docente">Docente</option>
                  <option value="Técnico(a)">Técnico(a)</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className="field">
                <label>Instituição / Afiliação (opcional)</label>
                <input
                  className="input"
                  placeholder="Ex.: UFPI"
                  value={afiliacao}
                  onChange={(e) => setAfiliacao(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>Cidade (opcional)</label>
                <input
                  className="input"
                  placeholder="Ex.: Picos"
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
              </div>
              <div className="field">
                <label>Estado (opcional)</label>
                <input
                  className="input"
                  placeholder="Ex.: PI"
                  value={estado}
                  onChange={(e) => setEstado(e.target.value)}
                />
              </div>
            </div>

            <div className="grid-2">
              <div className="field">
                <label>País (opcional)</label>
                <input
                  className="input"
                  placeholder="Ex.: Brasil"
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                />
              </div>

              <div className="field">
                <label>Lattes (URL) (opcional)</label>
                <input
                  className="input"
                  placeholder="https://lattes.cnpq.br/XXXXXXXXXXXXXXX"
                  value={lattes}
                  onChange={(e) => setLattes(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Preferências de Privacidade */}
          <div className="fieldset">
            <div className="legend">Preferências de Privacidade</div>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={showName}
                onChange={(e) => setShowName(e.target.checked)}
              />
              <span>Mostrar meu nome nos fósseis que eu publicar.</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={showAffiliation}
                onChange={(e) => setShowAffiliation(e.target.checked)}
              />
              <span>Mostrar minha afiliação (instituição).</span>
            </label>

            <label className="checkbox">
              <input
                type="checkbox"
                checked={showContact}
                onChange={(e) => setShowContact(e.target.checked)}
              />
              <span>Desejo exibir um contato público nas páginas dos fósseis que eu publicar.</span>
            </label>

            {showContact && (
              <div className="field" style={{ marginTop: 8 }}>
                <label>Contato público</label>
                <input
                  className="input"
                  placeholder="E-mail alternativo ou telefone"
                  value={publicContact}
                  onChange={(e) => setPublicContact(e.target.value)}
                />
                <div className="help">
                  Este contato aparece apenas nas páginas dos fósseis que você publicar.
                </div>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" disabled={submitting}>
            {submitting ? "Cadastrando..." : "Cadastrar"}
          </button>
        </form>

        <div className="signup-footer">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </div>
      </div>
    </div>
  );
}
