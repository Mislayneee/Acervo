import { useNavigate } from "react-router-dom";
import "./index.css";

export default function Contribuir() {
  const navigate = useNavigate();

  const primary = "var(--color-primary, #1a4d2e)";

  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      {/* HERO */}
      <section
        style={{
          marginTop: 12,
          borderRadius: 16,
          overflow: "hidden",
          background: `linear-gradient(180deg, #e8e3d9 0%, ${primary} 85%)`,
          color: "#fff",
        }}
      >
        <div
          style={{
            /* ⇩⇩ AQUI: aumentei a altura da faixa verde ⇩⇩ */
            padding: "56px 18px 64px",
            textAlign: "center",
            background: "rgba(0,0,0,0.10)",
          }}
        >
          <h1
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 28,
              fontWeight: 800,
              margin: 0,
              textShadow: "0 1px 0 rgba(0,0,0,.15)",
            }}
          >
            Contribua com o Acervo
          </h1>
          <p style={{ margin: "12px auto 0", maxWidth: 720, lineHeight: 1.5 }}>
            Compartilhe fósseis vegetais e amplie o acesso ao conhecimento científico.
          </p>
          {/* (botões removidos conforme pedido) */}
        </div>
      </section>

      {/* POR QUE CONTRIBUIR */}
      <section style={{ marginTop: 28 }}>
        <h2 style={h2}>Por que Contribuir?</h2>

        <div style={grid3}>
          <Card
            icon={<ArchiveIcon />}
            title="Preservação do Conhecimento"
            text="Cada registro digital ajuda a garantir a longevidade e o alcance de coleções paleobotânicas."
          />
          <Card
            icon={<GroupsIcon />}
            title="Colaboração Acadêmica"
            text="Integra alunos, docentes, museus e instituições em rede — com dados verificáveis e citáveis."
          />
          <Card
            icon={<PublicIcon />}
            title="Acesso Aberto"
            text="Amplia o alcance do conhecimento para escolas, universidades e público geral."
          />
        </div>
      </section>

      {/* COMO FUNCIONA */}
      <section style={{ marginTop: 32 }}>
        <h2 style={h2}>Como Funciona</h2>
        <p style={{ textAlign: "center", marginTop: -6, marginBottom: 18 }}>
          Um passo a passo simples para enviar suas contribuições ao acervo.
        </p>

        <div style={stepsGrid4}>
          <Step number={1} icon={<PersonAddIcon />} title="Cadastro" text="Crie sua conta na plataforma." />
          <Step number={2} icon={<AccountIcon />} title="Acessar Perfil" text="No topo, clique em Perfil → Contribuição." />
          <Step number={3} icon={<ListIcon />} title="Preencher Dados" text="Informe espécie, período, local e descrição do fóssil." />
          <Step number={4} icon={<UploadIcon />} title="Enviar Imagens" text="Fotos nítidas, sem filtro agressivo, com escala (quando possível)." />
          {/* passo 5 removido */}
        </div>

        <div style={{ display: "flex", justifyContent: "center", marginTop: 12 }}>
          <button onClick={() => navigate("/perfil")} style={btnDark}>
            Acessar meu Perfil
          </button>
        </div>
      </section>

      {/* BOAS PRÁTICAS */}
      <section style={{ marginTop: 32 }}>
        <h2 style={h2}>Boas Práticas de Envio</h2>

        <div style={grid3}>
          <TipCard
            icon={<CameraIcon />}
            title="Qualidade das imagens"
            text="Envie fotos nítidas, bem iluminadas e em alta resolução. Evite recortes excessivos e objetos que gerem reflexos."
          />
          <TipCard
            icon={<RulerIcon />}
            title="Referência de escala"
            text="Inclua uma escala métrica (ou objeto padrão) em pelo menos uma imagem, sem cobrir o fóssil."
          />
          <TipCard
            icon={<BackgroundIcon />}
            title="Fundo neutro"
            text="Use fundo simples e limpo; evite padrões que tirem o contraste. Se preciso, ajuste o enquadramento."
          />
          <TipCard
            icon={<DescriptionIcon />}
            title="Descrição completa"
            text="Informe espécie, família (se souber), período, local, contexto do achado e observações relevantes."
          />
          <TipCard
            icon={<PolicyIcon />}
            title="Políticas e direitos"
            text="Ao enviar, você concorda com uso acadêmico não comercial, com atribuição. Você mantém seus direitos autorais."
          />
          <TipCard
            icon={<FileIcon />}
            title="Formato dos arquivos"
            text="Prefira JPG/PNG. Evite filtros pesados e marcas d'água. Nomeie os arquivos de forma consistente."
          />
        </div>
      </section>

      {/* CTA FINAL */}
      <section style={{ marginTop: 36 }}>
        <div
          style={{
            background: primary,
            color: "#fff",
            borderRadius: 16,
            textAlign: "center",
            padding: "28px 18px",
          }}
        >
          <h3
            style={{
              margin: 0,
              fontFamily: "Playfair Display, serif",
              fontSize: 22,
              fontWeight: 800,
            }}
          >
            Pronto para fazer parte da história?
          </h3>
          <p style={{ margin: "8px auto 18px", maxWidth: 720, opacity: 0.9 }}>
            Sua contribuição é um legado para as futuras gerações de pesquisadores e entusiastas.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/perfil")} style={btnLight}>
              Contribuir Agora
            </button>
            <button onClick={() => navigate("/biblioteca")} style={btnOutline}>
              Explorar acervo
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

/* =======================
   Subcomponentes visuais
   ======================= */

function Card({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={iconBadge}>{icon}</div>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>{title}</h3>
      </div>
      <p style={{ margin: "8px 0 0", color: "var(--gray-600, #495057)", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function TipCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div style={{ ...card, minHeight: 140 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={iconBadge}>{icon}</div>
        <h4 style={{ margin: 0, fontSize: 15, fontWeight: 700 }}>{title}</h4>
      </div>
      <p style={{ margin: "8px 0 0", color: "var(--gray-600, #495057)", lineHeight: 1.5 }}>{text}</p>
    </div>
  );
}

function Step({
  number,
  icon,
  title,
  text,
}: {
  number: number;
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  const primary = "var(--color-primary, #1a4d2e)";
  return (
    <div style={stepCard}>
      <div style={{ position: "relative" }}>
        <div style={stepIcon}>{icon}</div>
        <div
          style={{
            position: "absolute",
            top: -8,
            right: -8,
            width: 26,
            height: 26,
            borderRadius: 999,
            background: primary,
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 13,
            fontWeight: 800,
          }}
        >
          {number}
        </div>
      </div>
      <h4 style={{ margin: "8px 0 4px", fontSize: 15, fontWeight: 800 }}>{title}</h4>
      <p style={{ margin: 0, color: "var(--gray-600, #495057)" }}>{text}</p>
    </div>
  );
}

/* =======================
   Ícones SVG inline
   ======================= */
function ArchiveIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="4" rx="1" /><path d="M5 8v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8" /><path d="M9 12h6" /></svg>); }
function GroupsIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="9" cy="7" r="3" /><path d="M2 21v-2a5 5 0 0 1 5-5h4" /><circle cx="17" cy="8" r="3" /><path d="M22 21v-2a5 5 0 0 0-5-5h-2" /></svg>); }
function PublicIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15 15 0 0 1 0 20a15 15 0 0 1 0-20" /></svg>); }
function PersonAddIcon() { return (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="9" cy="7" r="3" /><path d="M2 21v-2a5 5 0 0 1 5-5h4" /><path d="M16 11v6" /><path d="M13 14h6" /></svg>); }
function AccountIcon() { return (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="4" /><path d="M20 21a8 8 0 1 0-16 0" /></svg>); }
function ListIcon() { return (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M9 6h11" /><path d="M9 12h11" /><path d="M9 18h11" /><circle cx="5" cy="6" r="1.5" /><circle cx="5" cy="12" r="1.5" /><circle cx="5" cy="18" r="1.5" /></svg>); }
function UploadIcon() { return (<svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M12 16V4" /><path d="M7 9l5-5l5 5" /><rect x="4" y="16" width="16" height="4" rx="1" /></svg>); }
function CameraIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h3l2-2h6l2 2h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2z" /><circle cx="12" cy="13" r="4" /></svg>); }
function RulerIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M16 2l6 6L8 22l-6-6L16 2z" /><path d="M7 16l1 1" /><path d="M10 13l1 1" /><path d="M13 10l1 1" /><path d="M16 7l1 1" /></svg>); }
function BackgroundIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 16l5-5l4 4l3-3l6 6" /></svg>); }
function DescriptionIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 9h8" /><path d="M8 13h8" /><path d="M8 17h6" /></svg>); }
function PolicyIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 2l8 4v6c0 5-3 8-8 10C7 20 4 17 4 12V6l8-4z" /><path d="M9 12l2 2l4-4" /></svg>); }
function FileIcon() { return (<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>); }

/* =======================
   Estilos inline
   ======================= */
const h2: React.CSSProperties = {
  textAlign: "center",
  fontFamily: "Playfair Display, serif",
  fontSize: 24,
  fontWeight: 800,
  margin: 0,
  color: "var(--color-primary, #1a4d2e)",
  marginBottom: 12,
};

const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: 12,
};

const stepsGrid4: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: 12,
};

const card: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--gray-200, #e7ece7)",
  borderRadius: 12,
  padding: 14,
};

const stepCard: React.CSSProperties = {
  background: "#fff",
  border: "1px solid var(--gray-200, #e7ece7)",
  borderRadius: 12,
  padding: 14,
  textAlign: "center",
};

const iconBadge: React.CSSProperties = {
  width: 36,
  height: 36,
  borderRadius: 999,
  background: "var(--card-bg, #f6f9f6)",
  color: "var(--color-primary, #1a4d2e)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--gray-200, #e7ece7)",
};

const stepIcon: React.CSSProperties = {
  width: 56,
  height: 56,
  borderRadius: 999,
  background: "var(--card-bg, #f6f9f6)",
  color: "var(--color-primary, #1a4d2e)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "1px solid var(--gray-200, #e7ece7)",
  margin: "0 auto",
};

const btnLight: React.CSSProperties = {
  background: "#e8e3d9",
  color: "var(--color-primary, #1a4d2e)",
  padding: "10px 16px",
  borderRadius: 999,
  border: "none",
  fontWeight: 800,
  cursor: "pointer",
};
const btnDark: React.CSSProperties = {
  background: "var(--color-primary, #1a4d2e)",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 999,
  border: "none",
  fontWeight: 800,
  cursor: "pointer",
  minWidth: 160,
};
const btnOutline: React.CSSProperties = {
  background: "transparent",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 999,
  border: "2px solid #e8e3d9",
  fontWeight: 800,
  cursor: "pointer",
};
