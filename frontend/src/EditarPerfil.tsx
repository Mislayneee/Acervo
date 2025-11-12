// src/EditarPerfil.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./index.css";

type Form = {
  nome: string;

  // perfil público
  role: string;
  affiliation: string;
  city: string;
  state: string;
  country: string;
  lattes: string;
  contactPublic: string;

  // privacidade
  showName: boolean;
  showAffiliation: boolean;
  showContact: boolean;

  // troca de senha (opcional)
  senhaAtual?: string;
  novaSenha?: string;
};

// normaliza null/undefined/"null" -> ""
const nz = (v: any) => (v === null || v === undefined || v === "null" ? "" : String(v));

export default function EditarPerfil() {
  const { user, token, setUser } = useAuth() as any;
  const navigate = useNavigate();

  const apiBase = useMemo(
    () => (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, ""),
    []
  );

  const [form, setForm] = useState<Form>({
    nome: nz(user?.nome),

    role: nz(user?.role),
    affiliation: nz(user?.affiliation),
    city: nz(user?.city),
    state: nz(user?.state),
    country: nz(user?.country),
    lattes: nz(user?.lattes),
    contactPublic: nz(user?.contactPublic),

    showName: user?.showName ?? true,
    showAffiliation: user?.showAffiliation ?? true,
    showContact: user?.showContact ?? false,

    senhaAtual: "",
    novaSenha: "",
  });

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // carrega / sincroniza dados do backend
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        setCarregando(true);
        setErro(null);
        const resp = await fetch(`${apiBase}/users/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data?.error || "Falha ao carregar seu perfil.");

        if (alive) {
          setForm((prev) => ({
            ...prev,
            nome: nz(data?.nome ?? prev.nome),

            role: nz(data?.role ?? prev.role),
            affiliation: nz(data?.affiliation ?? prev.affiliation),
            city: nz(data?.city ?? prev.city),
            state: nz(data?.state ?? prev.state),
            country: nz(data?.country ?? prev.country),
            lattes: nz(data?.lattes ?? prev.lattes),
            contactPublic: nz(data?.contactPublic ?? prev.contactPublic),

            showName: data?.showName ?? prev.showName,
            showAffiliation: data?.showAffiliation ?? prev.showAffiliation,
            showContact: data?.showContact ?? prev.showContact,
          }));

          setUser?.(data);
        }
      } catch (e: any) {
        if (alive) setErro(e?.message || "Não foi possível carregar o perfil.");
      } finally {
        if (alive) setCarregando(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [apiBase, token, navigate, setUser]);

  const set = (patch: Partial<Form>) => setForm((p) => ({ ...p, ...patch }));

  // ao alternar "mostrar contato", preencher com e-mail do usuário se estiver vazio
  useEffect(() => {
    if (form.showContact && !form.contactPublic.trim() && user?.email) {
      set({ contactPublic: user.email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.showContact]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || salvando) return;

    setErro(null);
    setInfo(null);

    // validações:
    // 1) role é o campo essencial
    if (!form.role.trim()) {
      setErro("Informe sua atuação (role).");
      return;
    }
    // 2) contato obrigatório apenas se marcado
    if (form.showContact && !form.contactPublic.trim()) {
      setErro("Para exibir contato publicamente, preencha o campo de contato.");
      return;
    }
    // 3) troca de senha exige senha atual
    if (form.novaSenha && !form.senhaAtual) {
      setErro("Para trocar a senha, informe a senha atual.");
      return;
    }

    try {
      setSalvando(true);

      const body: any = {
        nome: form.nome.trim(),

        // qualquer campo vazio vira null para o backend
        role: form.role.trim(),
        affiliation: form.affiliation.trim() || null,
        city: form.city.trim() || null,
        state: form.state.trim() || null,
        country: form.country.trim() || null,
        lattes: form.lattes.trim() || null,

        showName: !!form.showName,
        showAffiliation: !!form.showAffiliation,
        showContact: !!form.showContact,
        contactPublic: form.showContact ? form.contactPublic.trim() || null : null,
      };

      if (form.novaSenha) {
        body.senhaAtual = form.senhaAtual;
        body.novaSenha = form.novaSenha;
      }

      const resp = await fetch(`${apiBase}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(data?.error || "Falha ao salvar alterações.");

      setUser?.(data.user || data);
      navigate("/perfil");
    } catch (e: any) {
      setErro(e?.message || "Erro ao salvar.");
    } finally {
      setSalvando(false);
    }
  };

  const cancelar = () => navigate("/perfil");

  if (carregando) {
    return (
      <main className="container" style={{ padding: "40px 0" }}>
        <h1 className="h1" style={{ color: "var(--color-primary)" }}>Editar Perfil</h1>
        <div className="skeleton">Carregando…</div>
      </main>
    );
  }

  return (
    <main className="container" style={{ maxWidth: 860, padding: "32px 0" }}>
      <h1 className="h1" style={{ color: "var(--color-primary)", textAlign: "center" }}>
        Editar Perfil
      </h1>

      {erro && (
        <div style={{ background: "#fde8e8", border: "1px solid #f5b5b5", color: "#8a1c1c", padding: 12, borderRadius: 8, margin: "10px 0" }}>
          {erro}
        </div>
      )}
      {info && (
        <div style={{ background: "#edf7ed", border: "1px solid #b8e3b8", color: "#215e21", padding: 12, borderRadius: 8, margin: "10px 0" }}>
          {info}
        </div>
      )}

      <form onSubmit={onSubmit} style={{ marginTop: 8 }}>
        {/* Acesso */}
        <section style={card}>
          <h2 style={secTitle}>Acesso</h2>

          <div style={grid2}>
            <div>
              <Label>Nome</Label>
              <input
                type="text"
                value={form.nome}
                onChange={(e) => set({ nome: e.target.value })}
                required
                style={input}
              />
            </div>

            <div>
              <Label>E-mail</Label>
              <input
                type="email"
                value={user?.email || ""}
                disabled
                style={{ ...input, background: "#f6f6f6", color: "#777" }}
              />
            </div>
          </div>
        </section>

        {/* Perfil público */}
        <section style={card}>
          <h2 style={secTitle}>Perfil público</h2>

          <div style={grid2}>
            <div>
              <Label>Atuação (role) *</Label>
              <select
                value={form.role}
                onChange={(e) => set({ role: e.target.value })}
                style={{ ...input, cursor: "pointer" }}
                required
              >
                <option value="">Selecione</option>
                <option>Estudante</option>
                <option>Pesquisador</option>
                <option>Professor</option>
                <option>Profissional</option>
                <option>Outro</option>
              </select>
            </div>

            <div>
              <Label>Afiliação (affiliation)</Label>
              <input
                type="text"
                placeholder="Ex.: UFPI"
                value={form.affiliation}
                onChange={(e) => set({ affiliation: e.target.value })}
                style={input}
              />
            </div>
          </div>

          <div style={grid3}>
            <div>
              <Label>Cidade</Label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => set({ city: e.target.value })}
                style={input}
              />
            </div>
            <div>
              <Label>Estado</Label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => set({ state: e.target.value })}
                style={input}
              />
            </div>
            <div>
              <Label>País</Label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => set({ country: e.target.value })}
                style={input}
              />
            </div>
          </div>

          <div>
            <Label>Currículo Lattes (URL)</Label>
            <input
              type="url"
              value={form.lattes}
              onChange={(e) => set({ lattes: e.target.value })}
              placeholder="https://lattes.cnpq.br/xxxxxxxxxxxxx"
              style={input}
            />
          </div>
        </section>

        {/* Preferências de Privacidade */}
        <section style={card}>
          <h2 style={secTitle}>Preferências de Privacidade</h2>

          <Check
            checked={form.showName}
            onChange={(v) => set({ showName: v })}
            label="Mostrar meu nome nos fósseis que eu publicar"
          />

          <Check
            checked={form.showAffiliation}
            onChange={(v) => set({ showAffiliation: v })}
            label="Mostrar minha afiliação"
          />

          <div style={{ marginTop: 6 }}>
            <Check
              checked={form.showContact}
              onChange={(v) => set({ showContact: v })}
              label="Desejo exibir um contato público nas páginas dos fósseis que eu publicar"
            />
            <div style={{ marginTop: 8 }}>
              <input
                type="text"
                placeholder="e-mail ou telefone para contato público"
                value={form.contactPublic}
                onChange={(e) => set({ contactPublic: e.target.value })}
                style={{ ...input, ...(form.showContact ? {} : { background: "#f6f6f6" }) }}
                disabled={!form.showContact}
              />
            </div>
          </div>
        </section>

        {/* Alterar senha (opcional) */}
        <section style={card}>
          <h2 style={secTitle}>(Opcional) Alterar senha</h2>
          <div style={grid2}>
            <div>
              <Label>Senha atual</Label>
              <input
                type="password"
                value={form.senhaAtual}
                onChange={(e) => set({ senhaAtual: e.target.value })}
                placeholder="Informe apenas se for trocar"
                style={input}
              />
            </div>
            <div>
              <Label>Nova senha</Label>
              <input
                type="password"
                value={form.novaSenha}
                onChange={(e) => set({ novaSenha: e.target.value })}
                placeholder="Deixe vazio para não trocar"
                style={input}
              />
            </div>
          </div>
        </section>

        {/* Ações */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 16 }}>
          <button
            type="button"
            onClick={cancelar}
            style={{
              background: "transparent",
              border: "1px solid var(--gray-200)",
              color: "#333",
              padding: "10px 18px",
              borderRadius: 20,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={salvando}
            style={{
              backgroundColor: "var(--color-primary)",
              color: "#fff",
              padding: "10px 22px",
              borderRadius: 20,
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
              minWidth: 180,
            }}
          >
            {salvando ? "Salvando…" : "Salvar alterações"}
          </button>
        </div>
      </form>
    </main>
  );
}

/* --------- UI helpers --------- */
const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e7ece7",
  borderRadius: 12,
  padding: 16,
  marginTop: 16,
};

const secTitle: React.CSSProperties = {
  margin: 0,
  fontSize: 16,
  fontWeight: 700,
  color: "#122b12",
  marginBottom: 12,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: 10,
  borderRadius: 6,
  border: "1px solid var(--gray-200)",
  background: "#f6f9f6",
  boxSizing: "border-box",
};

const grid2: React.CSSProperties = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "1fr 1fr",
};

const grid3: React.CSSProperties = {
  display: "grid",
  gap: 12,
  gridTemplateColumns: "1fr 1fr 1fr",
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label style={{ display: "block", fontWeight: 600, marginBottom: 6 }}>{children}</label>
);

const Check: React.FC<{ checked: boolean; onChange: (v: boolean) => void; label: string }> = ({
  checked,
  onChange,
  label,
}) => (
  <label style={{ display: "flex", alignItems: "center", gap: 8, userSelect: "none", cursor: "pointer" }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
    <span>{label}</span>
  </label>
);
