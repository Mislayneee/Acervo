// src/Perfil.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

type Fossil = {
  id: number;
  especie: string;
  familia: string;
  periodo: string;
  localizacao: string;
  descricao: string;
  imageUrl?: string | null;
  createdAt?: string;
};

type ApiResp = {
  items: Fossil[];
  total: number;
  page: number;
  pageSize: number;
};

const PAGE_SIZE = 9; // múltiplo de 3 p/ grid
const PERIODOS = [
  'Cambriano','Ordoviciano','Siluriano','Devoniano','Carbonífero',
  'Permiano','Triássico','Jurássico','Cretáceo','Paleógeno','Neógeno','Quaternário'
];

export default function Perfil() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  // ✅ Garante que a primeira aba visível é Contribuição
  const [abaAtiva, setAbaAtiva] = useState<'contribuicao' | 'biblioteca'>('contribuicao');

  // =========================
  // Cabeçalho + menu configs
  // =========================
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  // =========================
  // Form de Contribuição
  // =========================
  const [formulario, setFormulario] = useState({
    especie: '',
    familia: '',
    periodo: '',
    descricao: '',
    localizacao: '',
    imagem: null as File | null,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormulario({ ...formulario, imagem: e.target.files[0] });
    }
  };

  const [enviando, setEnviando] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      alert('Você precisa estar logado.');
      return;
    }
    if (!formulario.especie || !formulario.familia || !formulario.periodo || !formulario.localizacao) {
      alert('Preencha espécie, família, período e localização.');
      return;
    }

    const formData = new FormData();
    formData.append('especie', formulario.especie);
    formData.append('familia', formulario.familia);
    formData.append('periodo', formulario.periodo);
    formData.append('descricao', formulario.descricao);
    formData.append('localizacao', formulario.localizacao);
    if (formulario.imagem) formData.append('imagem', formulario.imagem);

    try {
      setEnviando(true);
      const base = import.meta.env.VITE_API_URL;
      const resp = await fetch(`${base}/fosseis`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (resp.status === 401) {
          alert('Sua sessão expirou. Faça login novamente.');
          logout();
          navigate('/login');
          return;
        }
        throw new Error(data?.error || 'Erro ao enviar contribuição.');
      }

      alert('Contribuição enviada com sucesso!');
      setFormulario({
        especie: '',
        familia: '',
        periodo: '',
        descricao: '',
        localizacao: '',
        imagem: null,
      });
      // Se estiver na biblioteca, recarrega
      if (abaAtiva === 'biblioteca') reload(1);
    } catch (err: any) {
      alert(err?.message || 'Erro ao enviar.');
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  // =========================
  // Biblioteca Pessoal (grid)
  // =========================
  const [bib, setBib] = useState<ApiResp>({ items: [], total: 0, page: 1, pageSize: PAGE_SIZE });
  const [page, setPage] = useState(1);
  const [carregandoBib, setCarregandoBib] = useState(false);
  const [erroBib, setErroBib] = useState<string | null>(null);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(bib.total / PAGE_SIZE)), [bib.total]);
  const baseUrl = import.meta.env.VITE_API_URL?.replace(/\/$/, '');

  const reload = async (pageArg?: number) => {
    if (!user) return;
    const p = pageArg ?? page;
    try {
      setCarregandoBib(true);
      setErroBib(null);
      const base = import.meta.env.VITE_API_URL;
      const url = new URL(`${base}/fosseis`);
      url.searchParams.set('userId', String(user.id)); // requer server.js com suporte a userId
      url.searchParams.set('page', String(p));
      url.searchParams.set('pageSize', String(PAGE_SIZE));
      url.searchParams.set('order', 'createdAt:desc');

      const r = await fetch(url.toString());
      const data = (await r.json()) as ApiResp;
      if (!r.ok) throw new Error('Erro ao carregar sua biblioteca.');
      setBib(data);
    } catch (e: any) {
      setErroBib(e?.message || 'Erro ao carregar sua biblioteca.');
    } finally {
      setCarregandoBib(false);
    }
  };

  useEffect(() => {
    if (abaAtiva === 'biblioteca' && user) reload(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abaAtiva, user?.id]);

  const goTo = (p: number) => {
    const n = Math.min(Math.max(1, p), totalPages);
    setPage(n);
    reload(n);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // menu "⋯" por item
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const itemMenuRef = useRef<HTMLDivElement>(null);
  function toggleMenu(e: React.MouseEvent, id: number) {
    e.stopPropagation();
    setOpenMenuId((curr) => (curr === id ? null : id));
  }
  useEffect(() => {
    function closeAll(e: MouseEvent) {
      if (itemMenuRef.current && !itemMenuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    }
    document.addEventListener('mousedown', closeAll);
    return () => document.removeEventListener('mousedown', closeAll);
  }, []);

  async function onExcluir(id: number) {
    if (!token) {
      alert('Você precisa estar logada.');
      return;
    }
    if (!confirm('Tem certeza que deseja excluir este fóssil?')) return;

    try {
      const base = import.meta.env.VITE_API_URL;
      const resp = await fetch(`${base}/fosseis/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await resp.json().catch(() => ({}));

      if (!resp.ok) {
        if (resp.status === 401) {
          alert('Sua sessão expirou. Faça login novamente.');
          logout();
          navigate('/login');
          return;
        }
        throw new Error(data?.error || 'Erro ao excluir.');
      }

      setOpenMenuId(null);
      // remove localmente
      setBib((prev) => ({ ...prev, items: prev.items.filter((x) => x.id !== id), total: Math.max(0, prev.total - 1) }));
    } catch (e: any) {
      alert(e?.message || 'Erro ao excluir.');
    }
  }

  function onEditar(id: number) {
    navigate(`/editar/${id}`);
    setOpenMenuId(null);
  }

  // utils
  function formatDate(iso?: string) {
    if (!iso) return '';
    try {
      const d = new Date(iso);
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  }

  return (
    <main style={{ maxWidth: 1000, margin: '32px auto', padding: '0 24px' }}>
      {/* Cabeçalho do perfil */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 28 }}>Perfil</h2>

        <div ref={menuRef} style={{ position: 'relative' }}>
          <img
            src="/config.png" // certifique-se que o arquivo é .png
            alt="Configurações"
            title="Configurações"
            onClick={() => setMenuOpen((v) => !v)}
            style={{ width: 28, height: 28, cursor: 'pointer' }}
          />
          {menuOpen && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 36,
                background: '#fff',
                border: '1px solid #e7ece7',
                borderRadius: 10,
                boxShadow: '0 6px 16px rgba(0,0,0,0.06)',
                minWidth: 220,
                zIndex: 10
              }}
            >
              <button onClick={() => { setMenuOpen(false); navigate('/perfil/editar'); }} style={menuItem}>
                Editar perfil
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.open('mailto:contato@exemplo.com?subject=Reportar%20problema', '_blank');
                }}
                style={menuItem}
              >
                Reportar problema
              </button>
              <div style={{ height: 1, background: '#e7ece7', margin: '4px 8px' }} />
              <button
                onClick={() => { setMenuOpen(false); logout(); navigate('/'); }}
                style={{ ...menuItem, color: '#a11', fontWeight: 700 }}
              >
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Avatar + nomes */}
      <div style={{ display: 'grid', placeItems: 'center', marginTop: 24, marginBottom: 8 }}>
        <img
          src="/perfil.png"
          alt="Avatar"
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', background: '#1f3b23' }}
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <div style={{ fontWeight: 700, marginTop: 12 }}>{user?.nome || 'Usuário'}</div>
        <div style={{ color: '#6a6f6a' }}>@{(user?.nome || 'usuario').toLowerCase().replace(/\s/g, '')}</div>
      </div>

      {/* Abas */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 20, borderBottom: '1px solid #e7ece7' }}>
        <button onClick={() => setAbaAtiva('contribuicao')} style={tabBtn(abaAtiva === 'contribuicao')}>
          Contribuição
        </button>
        <button onClick={() => setAbaAtiva('biblioteca')} style={tabBtn(abaAtiva === 'biblioteca')}>
          Biblioteca Pessoal
        </button>
      </div>

      {/* Conteúdo: Contribuição */}
      {abaAtiva === 'contribuicao' && (
        <form onSubmit={handleSubmit} style={{ marginTop: 28, maxWidth: 800, marginInline: 'auto' }}>
          <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Adicionar nova imagem</h3>

          <Label>Espécie</Label>
          <Input name="especie" placeholder="Ex: Psilophyton princeps" value={formulario.especie} onChange={handleChange} required />

          <Label>Família</Label>
          <Input name="familia" placeholder="Ex: Rhyniaceae" value={formulario.familia} onChange={handleChange} required />

          <Label>Período</Label>
          <Select name="periodo" value={formulario.periodo} onChange={handleChange} required>
            <option value="">Selecione um período</option>
            {PERIODOS.map(p => <option key={p} value={p}>{p}</option>)}
          </Select>

          <Label>Descrição</Label>
          <Textarea
            name="descricao"
            placeholder="Ex: Planta vascular terrestre do Devoniano médio..."
            value={formulario.descricao}
            onChange={handleChange}
          />

          <Label>Localização</Label>
          <Input name="localizacao" placeholder="Ex: Serra da Capivara, Piauí, Brasil" value={formulario.localizacao} onChange={handleChange} required />

          <Label>Imagem</Label>
          <div
            style={{
              ...inputStyle,
              border: '1px dashed #ccc',
              padding: 20,
              textAlign: 'center',
              marginBottom: 20,
            }}
          >
            <p><strong>Arraste e solte ou clique para adicionar uma imagem</strong></p>
            <p style={{ fontSize: 12 }}>Formatos: JPG, PNG, WEBP — até 5MB</p>
            <input type="file" onChange={handleImageUpload} accept="image/jpeg,image/png,image/webp" />
            {formulario.imagem && <div style={{ marginTop: 8, fontSize: 12 }}>{formulario.imagem.name}</div>}
          </div>

          <button
            type="submit"
            disabled={enviando}
            style={{
              backgroundColor: '#1a4d2e',
              color: '#fff',
              padding: '10px 30px',
              borderRadius: 20,
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            {enviando ? 'Enviando...' : 'Enviar'}
          </button>
        </form>
      )}

      {/* Conteúdo: Biblioteca */}
      {abaAtiva === 'biblioteca' && (
        <div style={{ marginTop: 28 }} ref={itemMenuRef}>
          {carregandoBib && <div style={{ color: '#6a6f6a' }}>Carregando...</div>}
          {erroBib && <div style={{ color: '#a11' }}>{erroBib}</div>}
          {!carregandoBib && !erroBib && bib.items.length === 0 && (
            <div style={{ textAlign: 'center', color: '#6a6f6a' }}>Você ainda não adicionou nenhuma imagem.</div>
          )}

          {/* Grid 3 colunas com link para detalhes */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            {bib.items.map((f) => {
              const path = (f.imageUrl ?? '').replace(/^\/?/, '');
              const src = f.imageUrl ? `${baseUrl}/${path}` : '';
              const date = formatDate(f.createdAt);

              return (
                <div key={f.id} className="bib-card">
                  <Link to={`/detalhes/${f.id}`} className="bib-thumb-wrap">
                    {src ? (
                      <img src={src} alt={f.especie} className="bib-thumb" />
                    ) : (
                      <div className="bib-thumb" style={{ background: '#1f3b23' }} />
                    )}

                    {/* menu ⋯ */}
                    <div className="bib-kebab" onClick={(e) => e.preventDefault()}>
                      <button
                        className="bib-kebab-btn"
                        onClick={(e) => toggleMenu(e, f.id)}
                        aria-label="Mais opções"
                        title="Mais opções"
                      >
                        ⋯
                      </button>
                      {openMenuId === f.id && (
                        <div className="bib-menu" onClick={(e) => e.preventDefault()}>
                          <button onClick={() => onEditar(f.id)}>Editar</button>
                          <button className="danger" onClick={() => onExcluir(f.id)}>Excluir</button>
                        </div>
                      )}
                    </div>
                  </Link>

                  <div style={{ padding: '10px 12px' }}>
                    <div className="bib-title">{f.especie || '—'}</div>
                    <div className="bib-date">{date}</div>
                  </div>
                </div>
              );

                          })}
                        </div>

                        {bib.total > PAGE_SIZE && (
                          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
                            <button onClick={() => goTo(page - 1)} disabled={page <= 1}>‹</button>
                            <span style={{ padding: '4px 8px' }}>{page} / {totalPages}</span>
                            <button onClick={() => goTo(page + 1)} disabled={page >= totalPages}>›</button>
                          </div>
                        )}
                      </div>
                    )}
                  </main>
                );
              }

// ---------- UI helpers ----------
const inputStyle: React.CSSProperties = {
  width: '100%',
  marginBottom: 12,
  padding: 10,
  backgroundColor: '#f2f5f1',
  border: 'none',
  borderRadius: 6,
  boxSizing: 'border-box',
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ display: 'block', marginTop: 6, marginBottom: 6, fontWeight: 600 }}>{children}</label>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={inputStyle} />
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} rows={4} style={inputStyle} />
);
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} style={{ ...inputStyle, backgroundColor: '#f2f5f1', cursor: 'pointer' }} />
);

const tabBtn = (active: boolean): React.CSSProperties => ({
  border: 'none',
  background: 'none',
  fontWeight: active ? 700 : 400,
  textDecoration: active ? 'underline' : 'none',
  margin: '0 16px 0 0',
  cursor: 'pointer',
  padding: '8px 0',
});

const menuItem: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  padding: '8px 12px',
  cursor: 'pointer',
  fontSize: 14,
};
