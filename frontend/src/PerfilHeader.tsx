import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PerfilHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // fecha o menu ao clicar fora
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  // helpers de exibição
  const nome = user?.nome || "Nome Completo do Usuário";
  const role = user?.role || "";
  const affiliation = (user as any)?.affiliation || "";     // campos públicos (opcionais)
  const city = (user as any)?.city || "";
  const state = (user as any)?.state || "";
  const country = (user as any)?.country || "";
  const lattes = (user as any)?.lattes || "";

  const temLocal = Boolean(city || state || country);
  const localStr = [city, state, country].filter(Boolean).join(", ");

  return (
    <div
      style={{
        maxWidth: 960,
        margin: "36px auto 18px",
        padding: "0 24px",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
      }}
    >
      {/* Bloco de informações (esquerda) */}
      <div>
        <h1
          style={{
            margin: 0,
            fontFamily: "Playfair Display, serif",
            fontWeight: 700,
            fontSize: 28,
            color: "#122b12",
          }}
        >
          {nome}
        </h1>

        {role && (
          <div style={{ color: "#4a604e", fontSize: 15, marginTop: 6 }}>
            {role}
          </div>
        )}

        {affiliation && (
          <div style={{ color: "#4a604e", fontSize: 15, marginTop: 2 }}>
            {affiliation}
          </div>
        )}

        {temLocal && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#4a604e",
              fontSize: 14,
              marginTop: 10,
            }}
          >
            <img
              src="/icons/location.svg"
              alt="Localização"
              style={{ width: 16, height: 16 }}
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
            <span>{localStr}</span>
          </div>
        )}

        {lattes && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#4a604e",
              fontSize: 14,
              marginTop: 6,
            }}
          >
            <img
              src="/icons/lattes.svg"
              alt="Currículo Lattes"
              style={{ width: 16, height: 16 }}
              onError={(e) => ((e.currentTarget as HTMLImageElement).style.display = "none")}
            />
            <a
              href={lattes}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#2f6b2f", textDecoration: "none", fontWeight: 600 }}
            >
              Currículo Lattes
            </a>
          </div>
        )}
      </div>

      {/* Engrenagem (direita) */}
      <div ref={ref} style={{ position: "relative" }}>
        <img
          src="/config.png"
          alt="Configurações"
          title="Configurações"
          onClick={() => setOpen((v) => !v)}
          style={{ width: 28, height: 28, cursor: "pointer" }}
        />
        {open && (
          <div
            style={{
              position: "absolute",
              right: 0,
              top: 36,
              background: "#fff",
              border: "1px solid #e7ece7",
              borderRadius: 10,
              boxShadow: "0 6px 16px rgba(0,0,0,.08)",
              minWidth: 220,
              zIndex: 10,
            }}
          >
            <button
              onClick={() => {
                setOpen(false);
                navigate("/perfil/editar");
              }}
              style={itemBtn}
            >
              Editar perfil
            </button>

            <div style={{ height: 1, background: "#e7ece7", margin: "4px 8px" }} />

            <button
              onClick={() => {
                setOpen(false);
                logout();
                navigate("/");
              }}
              style={{ ...itemBtn, color: "#a11", fontWeight: 700 }}
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const itemBtn: React.CSSProperties = {
  width: "100%",
  textAlign: "left",
  background: "transparent",
  border: "none",
  padding: "10px 12px",
  cursor: "pointer",
  fontSize: 14,
};
