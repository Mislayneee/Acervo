import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';

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
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div style={{ maxWidth: 760, margin: '32px auto 12px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Título */}
        <h2 style={{ margin: 0, fontFamily: 'Playfair Display, serif', fontSize: 28 }}>Perfil</h2>

        {/* Botão de configurações */}
        <div ref={ref} style={{ position: 'relative' }}>
          {/* ✅ use /config.png (correção do seu arquivo .pnd) */}
          <img
            src="/config.png"
            alt="Configurações"
            title="Configurações"
            onClick={() => setOpen((v) => !v)}
            style={{ width: 28, height: 28, cursor: 'pointer' }}
          />
          {open && (
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
              <button
                onClick={() => { setOpen(false); navigate('/perfil/editar'); }}
                style={itemBtn}
              >
                Editar perfil
              </button>
              <button
                onClick={() => {
                  setOpen(false);
                  // pode trocar por rota própria de feedback
                  window.open('mailto:contato@exemplo.com?subject=Reportar%20problema', '_blank');
                }}
                style={itemBtn}
              >
                Reportar problema
              </button>
              <div style={{ height: 1, background: '#e7ece7', margin: '4px 8px' }} />
              <button
                onClick={() => { setOpen(false); logout(); navigate('/'); }}
                style={{ ...itemBtn, color: '#a11', fontWeight: 700 }}
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
        <div style={{ fontWeight: 700, marginTop: 12 }}>{user?.nome || 'Visitante'}</div>
        <div style={{ color: '#6a6f6a' }}>@{(user?.nome || 'usuario').toLowerCase()}</div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e7ece7', marginTop: 20 }} />
    </div>
  );
}

const itemBtn: React.CSSProperties = {
  width: '100%',
  textAlign: 'left',
  background: 'transparent',
  border: 'none',
  padding: '10px 12px',
  cursor: 'pointer',
  fontSize: 14
};
