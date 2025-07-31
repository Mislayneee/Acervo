// src/Perfil.tsx
import { useAuth } from './AuthContext';
import Header from './Header';
import { useState } from 'react';

export default function Perfil() {
  const { user } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState<'contribuicao' | 'biblioteca'>('contribuicao');

  const [formulario, setFormulario] = useState({
    especie: '',
    familia: '',
    periodo: '',
    descricao: '',
    localizacao: '',
    imagem: null as File | null,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormulario({ ...formulario, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormulario({ ...formulario, imagem: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append('especie', formulario.especie);
    formData.append('familia', formulario.familia);
    formData.append('periodo', formulario.periodo);
    formData.append('descricao', formulario.descricao);
    formData.append('localizacao', formulario.localizacao);
    if (!user || typeof user.id !== 'number') {
      alert('Usuário não autenticado. Faça login novamente.');
      return;
    }
    formData.append('userId', String(user.id));

    if (formulario.imagem) {
      formData.append('imagem', formulario.imagem);
    }

    try {
      const response = await fetch('http://localhost:3001/fosseis', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        alert('Contribuição enviada com sucesso!');
        setFormulario({
          especie: '',
          familia: '',
          periodo: '',
          descricao: '',
          localizacao: '',
          imagem: null,
        });
      } else {
        alert(`Erro ao enviar contribuição: ${data?.error || 'Erro desconhecido.'}`);
      }
    } catch (err) {
      console.error(err);
      alert('Erro de rede ao enviar a contribuição.');
    }
  };

  return (
    <>
      <Header />
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>Perfil</h2>

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <div style={{
            width: 100,
            height: 100,
            borderRadius: '50%',
            backgroundColor: '#1a4d2e',
            margin: '0 auto'
          }}></div>
          <h3 style={{ margin: '10px 0 4px', fontWeight: 600 }}>{user?.nome || 'Usuário'}</h3>
          <p style={{ color: '#666' }}>@{user?.nome?.toLowerCase().replace(/\s/g, '') || 'usuario'}</p>
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginTop: '30px',
          borderBottom: '1px solid #ccc'
        }}>
          <button
            onClick={() => setAbaAtiva('contribuicao')}
            style={{
              border: 'none',
              background: 'none',
              fontWeight: abaAtiva === 'contribuicao' ? 700 : 400,
              textDecoration: abaAtiva === 'contribuicao' ? 'underline' : 'none',
              marginRight: '20px',
              cursor: 'pointer'
            }}>
            Contribuição
          </button>
          <button
            onClick={() => setAbaAtiva('biblioteca')}
            style={{
              border: 'none',
              background: 'none',
              fontWeight: abaAtiva === 'biblioteca' ? 700 : 400,
              textDecoration: abaAtiva === 'biblioteca' ? 'underline' : 'none',
              cursor: 'pointer'
            }}>
            Biblioteca Pessoal
          </button>
        </div>

        {abaAtiva === 'contribuicao' && (
          <form onSubmit={handleSubmit} style={{ marginTop: '40px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px' }}>Adicionar nova imagem</h3>

            <label>Espécie</label>
            <input
              type="text"
              name="especie"
              placeholder="Ex: Psilophyton princeps"
              value={formulario.especie}
              onChange={handleChange}
              style={inputStyle}
            />

            <label>Família</label>
            <input
              type="text"
              name="familia"
              placeholder="Ex: Rhyniaceae"
              value={formulario.familia}
              onChange={handleChange}
              style={inputStyle}
            />

            <label>Período</label>
            <select
              name="periodo"
              value={formulario.periodo}
              onChange={handleChange}
              style={{ ...inputStyle, backgroundColor: '#f2f5f1', cursor: 'pointer' }}
            >
              <option value="">Selecione um período</option>
              <option value="Cambriano">Cambriano</option>
              <option value="Ordoviciano">Ordoviciano</option>
              <option value="Siluriano">Siluriano</option>
              <option value="Devoniano">Devoniano</option>
              <option value="Carbonífero">Carbonífero</option>
              <option value="Permiano">Permiano</option>
              <option value="Triássico">Triássico</option>
              <option value="Jurássico">Jurássico</option>
              <option value="Cretáceo">Cretáceo</option>
              <option value="Paleógeno">Paleógeno</option>
              <option value="Neógeno">Neógeno</option>
              <option value="Quaternário">Quaternário</option>
            </select>

            <label>Descrição</label>
            <textarea
              name="descricao"
              placeholder="Ex: Planta vascular terrestre do Devoniano médio com estruturas ramificadas."
              value={formulario.descricao}
              onChange={handleChange}
              rows={4}
              style={inputStyle}
            />

            <label>Localização</label>
            <input
              type="text"
              name="localizacao"
              placeholder="Ex: Gilboa, Nova York, EUA"
              value={formulario.localizacao}
              onChange={handleChange}
              style={inputStyle}
            />

            <label>Imagem</label>
            <div style={{
              ...inputStyle,
              border: '1px dashed #ccc',
              padding: '30px',
              textAlign: 'center',
              marginBottom: '20px',
              borderRadius: '6px'
            }}>
              <p><strong>Arraste e solte ou clique para adicionar uma imagem</strong></p>
              <p style={{ fontSize: '12px' }}>Formatos suportados: JPG, PNG</p>
              <input type="file" onChange={handleImageUpload} accept="image/*" />
            </div>

            <button
              type="submit"
              style={{
                backgroundColor: '#1a4d2e',
                color: '#fff',
                padding: '10px 30px',
                borderRadius: '20px',
                border: 'none',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Enviar
            </button>
          </form>
        )}

        {abaAtiva === 'biblioteca' && (
          <div style={{ marginTop: '40px', textAlign: 'center' }}>
            <p>Você ainda não adicionou nenhuma imagem.</p>
          </div>
        )}
      </main>
    </>
  );
}

const inputStyle = {
  width: '100%',
  marginBottom: '12px',
  padding: '10px',
  backgroundColor: '#f2f5f1',
  border: 'none',
  borderRadius: '6px',
  boxSizing: 'border-box' as const
};
