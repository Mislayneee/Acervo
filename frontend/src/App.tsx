import './index.css';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';

function App() {
  const navigate = useNavigate();
  const [term, setTerm] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const go = () => {
    const q = term.trim();
    navigate(q ? `/pesquisa?q=${encodeURIComponent(q)}` : '/pesquisa');
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    go();
  };

  const clear = () => {
    setTerm('');
    inputRef.current?.focus();
  };

  return (
    <div>
      {/* Header agora vem do main.tsx */}

      <div className="banner">
        <img src="/folha.jpg" alt="Fóssil" />
        <h2>Acervo Digital de Fósseis Vegetais</h2>
      </div>

      <form className="search-box" onSubmit={onSubmit}>
        <button
          type="submit"
          aria-label="Pesquisar"
          title="Pesquisar"
          style={{ marginRight: 10, cursor: 'pointer', background: 'transparent', border: 'none' }}
        >
          🔍
        </button>

        <input
          ref={inputRef}
          type="text"
          placeholder="Pesquisar fóssil, período, família..."
          value={term}
          onChange={(e) => setTerm(e.target.value)}
        />

        {term && (
          <button
            type="button"
            onClick={clear}
            aria-label="Limpar pesquisa"
            title="Limpar"
            style={{ marginLeft: 10, cursor: 'pointer', background: 'transparent', border: 'none' }}
          >
            ✕
          </button>
        )}
      </form>
    </div>
  );
}

export default App;
