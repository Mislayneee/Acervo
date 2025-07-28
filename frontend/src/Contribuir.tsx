import Header from './Header';
import { useNavigate } from 'react-router-dom';

function Contribuir() {
  const navigate = useNavigate();

  const handleIrParaPerfil = () => {
    navigate('/perfil');
  };

  return (
    <>
      <Header />
      <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ marginBottom: '20px' }}>Como Contribuir com o Acervo</h2>

        <ol style={{ lineHeight: '1.8', fontSize: '16px', paddingLeft: '20px' }}>
          <li>Faça login ou crie uma conta.</li>
          <li>Acesse seu perfil clicando no menu superior.</li>
          <li>No seu perfil, preencha o formulário com as informações do fóssil.</li>
          <li>Envie uma imagem clara e de boa qualidade do fóssil.</li>
          <li>Aguarde a validação e publicação no acervo público.</li>
        </ol>

        <button
          onClick={handleIrParaPerfil}
          style={{
            marginTop: '30px',
            padding: '12px 24px',
            backgroundColor: '#4CAF50',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Ir para o Perfil
        </button>
      </div>
    </>
  );
}

export default Contribuir;
