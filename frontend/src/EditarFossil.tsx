import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

type Fossil = {
  id: number;
  especie: string;
  familia: string;
  periodo: string;
  localizacao: string;
  descricao: string;
  imageUrl?: string | null;
};

const periodos = [
  'Cambriano','Ordoviciano','Siluriano','Devoniano','Carbonífero',
  'Permiano','Triássico','Jurássico','Cretáceo','Paleógeno','Neógeno','Quaternário'
];

export default function EditarFossil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    especie: '',
    familia: '',
    periodo: '',
    localizacao: '',
    descricao: '',
    imagem: null as File | null,
  });

  const baseUrl = useMemo(
    () => import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '',
    []
  );

  // carrega dados existentes
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await fetch(`${baseUrl}/fosseis/${id}`);
        const data: Fossil = await r.json();
        if (!r.ok) throw new Error('Não foi possível carregar o fóssil.');

        if (!alive) return;
        setForm((f) => ({
          ...f,
          especie: data.especie || '',
          familia: data.familia || '',
          periodo: data.periodo || '',
          localizacao: data.localizacao || '',
          descricao: data.descricao || '',
          imagem: null,
        }));
        setLoading(false);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || 'Erro ao carregar.');
        setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, baseUrl]);

  const handleChangeText = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setForm((f) => ({ ...f, imagem: e.target.files![0] }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      alert('Faça login novamente.');
      return;
    }
    if (!form.especie || !form.familia || !form.periodo || !form.localizacao) {
      alert('Preencha espécie, família, período e localização.');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const fd = new FormData();
      fd.append('especie', form.especie);
      fd.append('familia', form.familia);
      fd.append('periodo', form.periodo);
      fd.append('localizacao', form.localizacao);
      fd.append('descricao', form.descricao);
      if (form.imagem) fd.append('imagem', form.imagem);

      const r = await fetch(`${baseUrl}/fosseis/${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || 'Falha ao salvar.');

      // vai para a página de detalhes
      navigate(`/detalhes/${id}`);
    } catch (e: any) {
      setError(e?.message || 'Erro ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  // imagem atual (preview)
  const currentImgSrc = useMemo(() => {
    // carregamos o fossil no efeito, mas não guardamos a imageUrl diretamente aqui;
    // para o preview, buscamos novamente o registro leve do servidor? melhor: usa <img> com src montado
    // como mantemos só o nome no backend, vamos buscar o registro outra vez ou reaproveitar form?
    // solução simples: renderizar a miniatura só se já existir em cache do navegador
    // Para robustez, fazemos uma chamada leve no início (já feita). Então montamos o caminho:
    // Como não salvamos a imageUrl no form, podemos reusar a de GET /fosseis/:id:
    return null; // o bloco de preview abaixo busca diretamente do endpoint novamente
  }, []);

  return (
    <main style={{ maxWidth: 800, margin: '32px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 26 }}>Editar fóssil</h2>
        <Link to={`/detalhes/${id}`} style={{ color: '#1a4d2e', fontWeight: 600 }}>Voltar aos detalhes</Link>
      </div>

      {loading && <div className="skeleton">Carregando...</div>}
      {error && <div className="erro" style={{ marginBottom: 12 }}>{error}</div>}

      {!loading && !error && (
        <form onSubmit={onSubmit} className="form-container" style={{ maxWidth: 800, marginTop: 0 }}>
          {/* Preview atual (se existir) */}
          <PreviewImagem fossilId={Number(id)} />

          <label>Espécie</label>
          <input
            className="input-claro"
            type="text"
            name="especie"
            value={form.especie}
            onChange={handleChangeText}
            placeholder="Ex: Psilophyton princeps"
            required
          />

          <label>Família</label>
          <input
            className="input-claro"
            type="text"
            name="familia"
            value={form.familia}
            onChange={handleChangeText}
            placeholder="Ex: Rhyniaceae"
            required
          />

          <label>Período</label>
          <select
            className="input-claro"
            name="periodo"
            value={form.periodo}
            onChange={handleChangeText}
            required
          >
            <option value="">Selecione um período</option>
            {periodos.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>

          <label>Localização</label>
          <input
            className="input-claro"
            type="text"
            name="localizacao"
            value={form.localizacao}
            onChange={handleChangeText}
            placeholder="Ex: Serra da Capivara, Piauí, Brasil"
            required
          />

          <label>Descrição</label>
          <textarea
            className="input-claro"
            name="descricao"
            rows={4}
            value={form.descricao}
            onChange={handleChangeText}
            placeholder="Observações, contexto do achado, etc."
          />

          <label>Nova imagem (opcional)</label>
          <div
            className="input-claro"
            style={{
              border: '1px dashed #ccc',
              padding: 18,
              textAlign: 'center',
              marginBottom: 12,
              background: '#f2f5f1'
            }}
          >
            <p style={{ margin: '0 0 6px' }}><strong>Enviar nova imagem</strong></p>
            <p style={{ margin: 0, fontSize: 12, color: '#6a6f6a' }}>Formatos: JPG, PNG, WEBP — até 5MB</p>
            <input type="file" onChange={handleImage} accept="image/jpeg,image/png,image/webp" />
            {form.imagem && <div style={{ marginTop: 8, fontSize: 12 }}>{form.imagem.name}</div>}
          </div>

          <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
            <button
              type="submit"
              disabled={saving}
              style={{
                backgroundColor: '#1a4d2e',
                color: '#fff',
                padding: '10px 20px',
                borderRadius: 8,
                border: 'none',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {saving ? 'Salvando...' : 'Salvar alterações'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              style={{
                backgroundColor: '#fff',
                color: '#1a4d2e',
                padding: '10px 20px',
                borderRadius: 8,
                border: '1px solid #e7ece7',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

/** Exibe a imagem atual (se houver). Busca o fóssil e monta src completo. */
function PreviewImagem({ fossilId }: { fossilId: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(true);
  const baseUrl = useMemo(
    () => import.meta.env.VITE_API_URL?.replace(/\/$/, '') || '',
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoadingImg(true);
        const r = await fetch(`${baseUrl}/fosseis/${fossilId}`);
        const data: Fossil = await r.json();
        if (!r.ok) throw new Error();
        const path = (data.imageUrl || '').replace(/^\/?/, '');
        const full = data.imageUrl ? `${baseUrl}/${path}` : null;
        if (alive) setSrc(full);
      } catch {
        if (alive) setSrc(null);
      } finally {
        if (alive) setLoadingImg(false);
      }
    })();
    return () => { alive = false; };
  }, [fossilId, baseUrl]);

  if (loadingImg) return <div className="skeleton" style={{ marginBottom: 12 }}>Carregando imagem...</div>;
  if (!src) return null;

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>Imagem atual</div>
      <img
        src={src}
        alt="Imagem atual do fóssil"
        style={{ width: '100%', maxHeight: 320, objectFit: 'cover', borderRadius: 8, border: '1px solid #e7ece7' }}
      />
    </div>
  );
}
