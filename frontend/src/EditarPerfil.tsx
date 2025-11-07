// src/EditarPerfil.tsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import './index.css';

export default function EditarPerfil() {
  const { user, token, setUser } = useAuth() as any; // se seu contexto exporta setUser
  const navigate = useNavigate();

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || 'http://localhost:3001').replace(/\/$/, ''),
    []
  );

  const [nome, setNome] = useState(user?.nome ?? '');
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [carregandoMe, setCarregandoMe] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) {
        navigate('/login');
        return;
      }
      try {
        setCarregandoMe(true);
        const resp = await fetch(`${apiBase}/users/me`, {
          credentials: 'include',
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || 'Erro ao carregar seu perfil.');
        if (alive) {
          setNome(data?.nome ?? '');
          // Atualiza contexto (opcional)
          setUser?.(data);
        }
      } catch (e: any) {
        if (alive) setErro(e?.message || 'Falha ao carregar.');
      } finally {
        if (alive) setCarregandoMe(false);
      }
    })();
    return () => { alive = false; };
  }, [apiBase, token, setUser, navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    if (loading) return;
    setErro(null);
    setLoading(true);
    try {
      const body: any = { nome };
      if (novaSenha) {
        body.senhaAtual = senhaAtual;
        body.novaSenha = novaSenha;
      }
      const resp = await fetch(`${apiBase}/users/me`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });
      const data = await resp.json();
      if (!resp.ok) throw new Error(data?.error || 'Erro ao atualizar perfil.');

      // Atualiza contexto local
      setUser?.(data.user);
      alert('Perfil atualizado com sucesso!');
      navigate('/perfil');
    } catch (e: any) {
      setErro(e?.message || 'Falha ao atualizar.');
    } finally {
      setLoading(false);
    }
  };

  if (carregandoMe) {
    return (
      <main className="container" style={{ padding: '40px 0' }}>
        <h1 className="h1" style={{ color: 'var(--color-primary)' }}>Editar Perfil</h1>
        <div className="skeleton">Carregando…</div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 720, padding: '32px 0' }}>
      <h1 className="h1" style={{ color: 'var(--color-primary)' }}>Editar Perfil</h1>

      {erro && <div className="erro" style={{ marginTop: 8 }}>{erro}</div>}

      <form onSubmit={onSubmit} style={{ marginTop: 16 }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nome</label>
        <input
          type="text"
          required
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            border: '1px solid var(--gray-200)',
            background: '#f6f9f6',
            marginBottom: 12
          }}
        />

        {/* Campos de senha são OPCIONAIS. Se não quiser agora, pode remover essa seção inteira */}
        <div className="muted" style={{ marginBottom: 8 }}>
          (Opcional) Alterar senha
        </div>

        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Senha atual</label>
        <input
          type="password"
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          placeholder="Informe apenas se for trocar a senha"
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            border: '1px solid var(--gray-200)',
            background: '#f6f9f6',
            marginBottom: 12
          }}
        />

        <label style={{ display: 'block', fontWeight: 600, marginBottom: 6 }}>Nova senha</label>
        <input
          type="password"
          value={novaSenha}
          onChange={(e) => setNovaSenha(e.target.value)}
          placeholder="Deixe vazio para não trocar"
          style={{
            width: '100%',
            padding: 10,
            borderRadius: 6,
            border: '1px solid var(--gray-200)',
            background: '#f6f9f6',
            marginBottom: 20
          }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: 'var(--color-primary)',
            color: '#fff',
            padding: '10px 22px',
            borderRadius: 20,
            border: 'none',
            fontWeight: 600,
            cursor: 'pointer'
          }}
        >
          {loading ? 'Salvando…' : 'Salvar alterações'}
        </button>
      </form>
    </main>
  );
}
