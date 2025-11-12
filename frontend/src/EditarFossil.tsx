import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "./AuthContext";

type Fossil = {
  id: number;
  especie: string;
  familia: string;
  periodo: string;
  localizacao: string;
  descricao: string;
  imageUrl?: string | null;
};

// 🎨 Constantes de cor
const COLOR_PRIMARY = "var(--color-primary, #0b4e2f)";
const COLOR_PRIMARY_HOVER = "var(--color-primary-hover, #064d2f)";

const periodos = [
  "Cambriano",
  "Ordoviciano",
  "Siluriano",
  "Devoniano",
  "Carbonífero",
  "Permiano",
  "Triássico",
  "Jurássico",
  "Cretáceo",
  "Paleógeno",
  "Neógeno",
  "Quaternário",
];

export default function EditarFossil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    especie: "",
    familia: "",
    periodo: "",
    localizacao: "",
    descricao: "",
    imagem: null as File | null,
  });

  const baseUrl = useMemo(
    () => (import.meta.env.VITE_API_URL?.replace(/\/$/, "") || ""),
    []
  );

  // carregar dados existentes
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const r = await fetch(`${baseUrl}/fosseis/${id}`);
        const data: Fossil = await r.json();
        if (!r.ok) throw new Error("Não foi possível carregar o fóssil.");

        if (!alive) return;
        setForm((f) => ({
          ...f,
          especie: data.especie || "",
          familia: data.familia || "",
          periodo: data.periodo || "",
          localizacao: data.localizacao || "",
          descricao: data.descricao || "",
          imagem: null,
        }));
        setLoading(false);
      } catch (e: any) {
        if (!alive) return;
        setError(e?.message || "Erro ao carregar.");
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id, baseUrl]);

  const handleChangeText = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLTextAreaElement>
      | React.ChangeEvent<HTMLSelectElement>
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
      alert("Faça login novamente.");
      return;
    }
    if (!form.especie || !form.familia || !form.periodo || !form.localizacao) {
      alert("Preencha espécie, família, período e localização.");
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const fd = new FormData();
      fd.append("especie", form.especie);
      fd.append("familia", form.familia);
      fd.append("periodo", form.periodo);
      fd.append("localizacao", form.localizacao);
      fd.append("descricao", form.descricao);
      if (form.imagem) fd.append("imagem", form.imagem);

      const r = await fetch(`${baseUrl}/fosseis/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data?.error || "Falha ao salvar.");

      navigate(`/detalhes/${id}`);
    } catch (e: any) {
      setError(e?.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main
      className="container"
      style={{ maxWidth: 880, paddingTop: 12, paddingBottom: 28 }}
    >
      <h2 className="h2" style={{ marginTop: 10 }}>
        Editar fóssil
      </h2>

      {loading && <div className="skeleton">Carregando...</div>}
      {error && <div className="form-alert" style={{ maxWidth: 760 }}>{error}</div>}

      {!loading && !error && (
        <form onSubmit={onSubmit} className="signup-card" style={{ padding: 20 }}>
          {/* Preview atual */}
          <PreviewImagem fossilId={Number(id)} />

          <div className="field">
            <label>Espécie</label>
            <input
              className="input-claro"
              type="text"
              name="especie"
              value={form.especie}
              onChange={handleChangeText}
              placeholder="Ex: Psilophyton princeps"
              required
              style={inputClaro}
            />
          </div>

          <div className="field">
            <label>Família</label>
            <input
              className="input-claro"
              type="text"
              name="familia"
              value={form.familia}
              onChange={handleChangeText}
              placeholder="Ex: Rhyniaceae"
              required
              style={inputClaro}
            />
          </div>

          <div className="field">
            <label>Período</label>
            <select
              className="input-claro"
              name="periodo"
              value={form.periodo}
              onChange={handleChangeText}
              required
              style={{ ...inputClaro, cursor: "pointer" }}
            >
              <option value="">Selecione um período</option>
              {periodos.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>Localização</label>
            <input
              className="input-claro"
              type="text"
              name="localizacao"
              value={form.localizacao}
              onChange={handleChangeText}
              placeholder="Ex: Serra da Capivara, Piauí, Brasil"
              required
              style={inputClaro}
            />
          </div>

          <div className="field">
            <label>Descrição</label>
            <textarea
              className="input-claro"
              name="descricao"
              rows={4}
              value={form.descricao}
              onChange={handleChangeText}
              placeholder="Observações, contexto do achado, etc."
              style={inputClaro}
            />
          </div>

          <div className="field" style={{ marginTop: 6 }}>
            <label>Nova imagem (opcional)</label>
            <div
              style={{
                border: "1px dashed var(--color-border)",
                padding: 14,
                borderRadius: 10,
                background: "#f6f8f6",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <label
                  htmlFor="img-input"
                  className="btn"
                  style={{
                    background: "#fff",
                    border: "1px solid var(--color-border)",
                    color: "var(--color-text)",
                    padding: "8px 12px",
                    borderRadius: 12,
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Selecionar nova imagem
                </label>
                <input
                  id="img-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImage}
                  style={{ display: "none" }}
                />
                <span className="muted" style={{ fontSize: 12 }}>
                  Formatos: JPG, PNG, WEBP — até 5MB
                </span>
              </div>
              {form.imagem && (
                <div style={{ marginTop: 8, fontSize: 12 }}>
                  {form.imagem.name}
                </div>
              )}
            </div>
          </div>

          {/* Botões — pill, à direita, largura automática */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 12,
              marginTop: 18,
            }}
          >
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-ghost"
              style={btnGhost}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#f3f3f3")
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  "#fff")
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={saving}
              style={btnPrimary}
              onMouseEnter={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  COLOR_PRIMARY_HOVER)
              }
              onMouseLeave={(e) =>
                ((e.currentTarget as HTMLButtonElement).style.backgroundColor =
                  COLOR_PRIMARY)
              }
            >
              {saving ? "Salvando…" : "Salvar alterações"}
            </button>
          </div>
        </form>
      )}
    </main>
  );
}

/** Exibe a imagem atual (se houver). */
function PreviewImagem({ fossilId }: { fossilId: number }) {
  const [src, setSrc] = useState<string | null>(null);
  const [loadingImg, setLoadingImg] = useState(true);
  const baseUrl = useMemo(
    () => import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "",
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
        const path = (data.imageUrl || "").replace(/^\/?/, "");
        const full = data.imageUrl ? `${baseUrl}/${path}` : null;
        if (alive) setSrc(full);
      } catch {
        if (alive) setSrc(null);
      } finally {
        if (alive) setLoadingImg(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [fossilId, baseUrl]);

  return (
    <div style={{ marginBottom: 12 }}>
      <div
        style={{
          width: "100%",
          aspectRatio: "4 / 1.8",
          borderRadius: 12,
          border: "1px solid var(--color-border)",
          background: "#2e2d31",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#d9c38a",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {loadingImg ? (
          <div
            className="skeleton"
            style={{ background: "transparent", color: "#ccc" }}
          >
            Carregando imagem...
          </div>
        ) : src ? (
          <img
            src={src}
            alt="Imagem atual do fóssil"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <div style={{ textAlign: "center", opacity: 0.6 }}>imagem</div>
        )}
      </div>
      <div className="muted" style={{ marginTop: 6, fontSize: 12 }}>
        Imagem atual
      </div>
    </div>
  );
}

/* ===== estilos inline reutilizáveis ===== */
const inputClaro: React.CSSProperties = {
  width: "100%",
  marginBottom: 12,
  padding: 10,
  backgroundColor: "#f2f5f1",
  border: "none",
  borderRadius: 6,
  boxSizing: "border-box",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 22px",
  borderRadius: 9999,
  lineHeight: 1,
  border: "1px solid var(--color-border)",
  background: "#fff",
  color: "var(--color-text)",
  fontWeight: 600,
  cursor: "pointer",
  transition: "background-color 0.2s ease",
  width: "fit-content",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 26px",
  borderRadius: 9999,
  backgroundColor: COLOR_PRIMARY,
  color: "#fff",
  fontWeight: 700,
  border: "none",
  cursor: "pointer",
  lineHeight: 1,
  width: "fit-content",
  transition: "background-color 0.2s ease",
};
