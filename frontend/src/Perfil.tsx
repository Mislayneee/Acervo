// src/Perfil.tsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import BibliotecaPessoal from "./BibliotecaPessoal";
import "./index.css";

const PERIODOS = [
  "Cambriano","Ordoviciano","Siluriano","Devoniano","Carbonífero",
  "Permiano","Triássico","Jurássico","Cretáceo","Paleógeno","Neógeno","Quaternário"
];

export default function Perfil() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [abaAtiva, setAbaAtiva] = useState<"contribuicao" | "biblioteca">("contribuicao");

  // menu config
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // ---- Form Contribuição ----
  const [formulario, setFormulario] = useState({
    especie: "",
    familia: "",
    periodo: "",
    descricao: "",
    localizacao: "",
    imagem: null as File | null,
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setFormulario({ ...formulario, [e.target.name]: e.target.value });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    setFormulario({ ...formulario, imagem: f ?? null });
  };

  const [enviando, setEnviando] = useState(false);

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, ""),
    []
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user || !token) {
      alert("Você precisa estar logado.");
      return;
    }
    if (!formulario.especie || !formulario.familia || !formulario.periodo || !formulario.localizacao) {
      alert("Preencha espécie, família, período e localização.");
      return;
    }

    const formData = new FormData();
    formData.append("especie", formulario.especie);
    formData.append("familia", formulario.familia);
    formData.append("periodo", formulario.periodo);
    formData.append("descricao", formulario.descricao);
    formData.append("localizacao", formulario.localizacao);
    if (formulario.imagem) formData.append("imagem", formulario.imagem);

    try {
      setEnviando(true);
      const resp = await fetch(`${apiBase}/fosseis`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) {
        if (resp.status === 401) {
          alert("Sua sessão expirou. Faça login novamente.");
          logout();
          navigate("/login");
          return;
        }
        throw new Error(data?.error || "Erro ao enviar contribuição.");
      }

      alert("Contribuição enviada com sucesso!");
      setFormulario({
        especie: "",
        familia: "",
        periodo: "",
        descricao: "",
        localizacao: "",
        imagem: null
      });
      // limpa o input de arquivo visualmente
      if (fileRef.current) fileRef.current.value = "";
    } catch (err: any) {
      alert(err?.message || "Erro ao enviar.");
      console.error(err);
    } finally {
      setEnviando(false);
    }
  };

  // avatar com fallback de inicial
  const userInitial = (user?.nome || "U").trim().charAt(0).toUpperCase();

  return (
    <main style={{ maxWidth: 1000, margin: "32px auto", padding: "0 24px" }}>
      {/* Cabeçalho do perfil */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h2 style={{ margin: 0 }} className="h1">Perfil</h2>

        <div ref={menuRef} style={{ position: "relative" }}>
          <img
            src="/config.png"
            alt="Configurações"
            title="Configurações"
            onClick={() => setMenuOpen(v => !v)}
            style={{ width: 28, height: 28, cursor: "pointer" }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
          />
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                top: 36,
                background: "#fff",
                border: "1px solid #e7ece7",
                borderRadius: 10,
                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
                minWidth: 220,
                zIndex: 10
              }}
            >
              <button onClick={() => { setMenuOpen(false); navigate("/perfil/editar"); }} style={menuItem}>
                Editar perfil
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  window.open("mailto:contato@exemplo.com?subject=Reportar%20problema", "_blank");
                }}
                style={menuItem}
              >
                Reportar problema
              </button>
              <div style={{ height: 1, background: "#e7ece7", margin: "4px 8px" }} />
              <button onClick={() => { setMenuOpen(false); logout(); navigate("/"); }} style={{ ...menuItem, color: "#a11", fontWeight: 700 }}>
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Avatar + nomes */}
      <div style={{ display: "grid", placeItems: "center", marginTop: 24, marginBottom: 8 }}>
        {/* fallback: círculo verde com inicial */}
        <div
          style={{
            width: 120, height: 120, borderRadius: "50%",
            display: "grid", placeItems: "center",
            background: "var(--color-primary)", color: "#fff",
            fontSize: 48, fontWeight: 700
          }}
          aria-label="Avatar"
          title={user?.nome || "Usuário"}
        >
          {userInitial}
        </div>
        <div style={{ fontWeight: 700, marginTop: 12 }}>{user?.nome || "Usuário"}</div>
        <div className="muted">@{(user?.nome || "usuario").toLowerCase().replace(/\s/g, "")}</div>
      </div>

      {/* Abas */}
      <div style={{ display: "flex", justifyContent: "center", marginTop: 20, borderBottom: "1px solid #e7ece7" }}>
        <button onClick={() => setAbaAtiva("contribuicao")} style={tabBtn(abaAtiva === "contribuicao")}>
          Contribuição
        </button>
        <button onClick={() => setAbaAtiva("biblioteca")} style={tabBtn(abaAtiva === "biblioteca")}>
          Biblioteca Pessoal
        </button>
      </div>

      {/* Conteúdo: Contribuição */}
      {abaAtiva === "contribuicao" && (
        <form onSubmit={handleSubmit} style={{ marginTop: 28, maxWidth: 800, marginInline: "auto" }}>
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
          <Textarea name="descricao" placeholder="Ex: Planta vascular terrestre do Devoniano médio..." value={formulario.descricao} onChange={handleChange} />

          <Label>Localização</Label>
          <Input name="localizacao" placeholder="Ex: Serra da Capivara, Piauí, Brasil" value={formulario.localizacao} onChange={handleChange} required />

          <Label>Imagem</Label>
          <div style={{ ...inputStyle, border: "1px dashed #ccc", padding: 20, textAlign: "center", marginBottom: 20 }}>
            <p><strong>Arraste e solte ou clique para adicionar uma imagem</strong></p>
            <p style={{ fontSize: 12 }}>Formatos: JPG, PNG, WEBP — até 5MB</p>
            <input ref={fileRef} type="file" onChange={handleImageUpload} accept="image/jpeg,image/png,image/webp" />
            {formulario.imagem && <div style={{ marginTop: 8, fontSize: 12 }}>{formulario.imagem.name}</div>}
          </div>

          <button
            type="submit"
            disabled={enviando}
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              padding: "10px 30px",
              borderRadius: 20,
              border: "none",
              fontWeight: 600,
              cursor: "pointer"
            }}
          >
            {enviando ? "Enviando..." : "Enviar"}
          </button>
        </form>
      )}

      {/* Conteúdo: Biblioteca Pessoal */}
      {abaAtiva === "biblioteca" && <BibliotecaPessoal />}
    </main>
  );
}

/* ---------- UI helpers ---------- */
const inputStyle: React.CSSProperties = {
  width: "100%",
  marginBottom: 12,
  padding: 10,
  backgroundColor: "#f2f5f1",
  border: "none",
  borderRadius: 6,
  boxSizing: "border-box",
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ display: "block", marginTop: 6, marginBottom: 6, fontWeight: 600 }}>{children}</label>
);
const Input: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (props) => (
  <input {...props} style={inputStyle} />
);
const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement>> = (props) => (
  <textarea {...props} rows={4} style={inputStyle} />
);
const Select: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (props) => (
  <select {...props} style={{ ...inputStyle, backgroundColor: "#f2f5f1", cursor: "pointer" }} />
);

const tabBtn = (active: boolean): React.CSSProperties => ({
  border: "none",
  background: "none",
  fontWeight: active ? 700 : 400,
  textDecoration: active ? "underline" : "none",
  margin: "0 16px 0 0",
  cursor: "pointer",
  padding: "8px 0",
});

const menuItem: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: "none",
  padding: "8px 12px",
  cursor: "pointer",
  fontSize: 14,
};
