import './index.css';
import Header from './Header';

function Pesquisa() {
  return (
    <div>
      <Header />

      {/* Conteúdo da busca */}
      <div style={{ display: 'flex', padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Filtros laterais */}
        <aside style={{ minWidth: '220px', marginRight: '30px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: '600', marginBottom: '10px' }}>Filtrar por:</h3>

          <label>Período:</label><br />
          <select style={{ width: '100%', marginBottom: '12px' }}>
            <option>Todos</option>
            <option>Devoniano</option>
            <option>Jurássico</option>
            <option>Cretáceo</option>
          </select>

          <label>Localização:</label><br />
          <input type="text" placeholder="Ex: Piauí" style={{ width: '100%', marginBottom: '12px' }} />

          <label>Família:</label><br />
          <input type="text" placeholder="Ex: Psilophytaceae" style={{ width: '100%', marginBottom: '12px' }} />

          <label>Ordem:</label><br />
          <input type="text" placeholder="Ex: Rhyniales" style={{ width: '100%' }} />
        </aside>

        {/* Resultados */}
        <section style={{ flex: 1 }}>
          <input
            type="text"
            placeholder="Buscar fósseis..."
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid #a6c59f',
              borderRadius: '5px',
              backgroundColor: '#d5edc4',
              marginBottom: '20px'
            }}
          />

          <p>resultados da pesquisa...</p>
        </section>
      </div>
    </div>
  );
}

export default Pesquisa;
