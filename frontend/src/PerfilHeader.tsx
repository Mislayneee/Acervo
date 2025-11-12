import { useAuth } from "./AuthContext";

function clean(v?: string | null) {
  const s = (v ?? "").toString().trim();
  if (!s || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") return "";
  return s;
}

function Dot({
  visible,
  tipVisible,
  tipHidden,
}: {
  visible?: boolean;
  tipVisible: string;
  tipHidden: string;
}) {
  const tip = visible ? tipVisible : tipHidden;
  const color = visible ? "#2f6b2f" : "#9aa3a0";
  return (
    <span
      title={tip}
      aria-label={tip}
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        marginLeft: 6,
      }}
    />
  );
}

export default function PerfilHeader() {
  const { user } = useAuth();

  const nome        = clean(user?.nome) || "Nome do Usuário";
  const role        = clean(user?.role);
  const affiliation = clean(user?.affiliation);
  const lattes      = clean(user?.lattes);
  const contact     = clean(user?.contactPublic);

  const showName        = user?.showName ?? true;
  const showAffiliation = user?.showAffiliation ?? true;
  const showContact     = user?.showContact ?? false;

  const headerStyle: React.CSSProperties = {
    maxWidth: 960,
    margin: "20px auto 8px",
    padding: "16px 20px",
    background: "#fff",
    border: "1px solid #e7ece7",
    borderRadius: 14,
    boxShadow: "0 10px 24px rgba(0,0,0,.05)",
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  };

  const row: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    color: "#31453a",
    fontSize: 14, // mesma sensação de “SP, Argentina”
  };

  return (
    <section style={headerStyle} aria-labelledby="perfil-cabecalho">
      {/* Título + ponto de visibilidade do nome */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        <h1
          id="perfil-cabecalho"
          style={{
            margin: 0,
            fontFamily: "Playfair Display, serif",
            fontWeight: 800,
            fontSize: 28,
            color: "#0e2010",
            letterSpacing: 0.2,
          }}
        >
          {nome}
        </h1>
        <Dot
          visible={showName}
          tipVisible="Seu nome está visível nas páginas de fósseis."
          tipHidden="Seu nome está oculto nas páginas de fósseis."
        />
      </div>

      {(role || affiliation) && (
        <div style={{ ...row, marginTop: 8 }}>
          {role && <strong>{role}</strong>}
          {role && affiliation && <span aria-hidden style={{ color: "#b9c4bd" }}>•</span>}
          {affiliation && (
            <>
              <span>{affiliation}</span>
              <Dot
                visible={showAffiliation}
                tipVisible="Sua afiliação está visível nas páginas de fósseis."
                tipHidden="Sua afiliação está oculta nas páginas de fósseis."
              />
            </>
          )}
        </div>
      )}

      {lattes && (
        <div style={{ ...row, marginTop: 6 }}>
          <span style={{ color: "#44574d" }}>Lattes:</span>
          <a
            href={lattes}
            target="_blank"
            rel="noopener noreferrer"
            className="link-reset"
            title={lattes}
          >
            {lattes}
          </a>
        </div>
      )}

      <div style={{ ...row, marginTop: 2 }}>
        <span style={{ color: "#44574d" }}>Contato:</span>
        {showContact && contact ? (
          <>
            <a href={`mailto:${contact}`} className="link-reset">{contact}</a>
            <Dot
              visible
              tipVisible="Seu contato público está visível nas páginas de fósseis."
              tipHidden=""
            />
          </>
        ) : (
          <>
            <span className="muted">não exibido</span>
            <Dot
              visible={false}
              tipVisible=""
              tipHidden="Seu contato público está oculto."
            />
          </>
        )}
      </div>
    </section>
  );
}
