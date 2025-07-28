// src/Sobre.tsx
import Header from './Header';

export default function Sobre() {
  return (
    <>
      <Header />
      <main style={{ maxWidth: '800px', margin: '60px auto', padding: '0 20px' }}>
        <h2>Sobre o Acervo</h2>
        <p>
          O Acervo Digital de Fósseis Vegetais é uma iniciativa voltada à catalogação,
          preservação e divulgação de fósseis de plantas, com foco em exemplares do período Devoniano.
        </p>
        <p>
          Nosso objetivo é oferecer uma ferramenta acessível para pesquisadores, professores,
          alunos e entusiastas da paleobotânica, possibilitando consulta, colaboração e aprendizado contínuo.
        </p>
      </main>
    </>
  );
}
