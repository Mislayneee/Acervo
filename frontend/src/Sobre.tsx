// src/pages/Sobre.tsx
import { useNavigate } from "react-router-dom";
import React from "react";

export default function Sobre() {
  const navigate = useNavigate();
  const primary = "var(--color-primary, #1a4d2e)";
  const border = "var(--gray-200, #e7ece7)";

  return (
    <main className="container" style={{ paddingBottom: 48 }}>
      {/* HERO — mesmos tamanhos do Contribuir.tsx */}
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
            Sobre o Acervo
          </h1>
          <p style={{ margin: "12px auto 0", maxWidth: 720, lineHeight: 1.5 }}>
            Uma iniciativa dedicada à preservação e acesso digital de fósseis vegetais para pesquisa, educação e apreciação pública.
          </p>
        </div>
      </section>

      {/* O que é e por que existe — texto mantido exatamente */}
      <section style={{ marginTop: 28 }}>
        <h2 style={h2}>O que é e por que existe?</h2>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <p style={p}>
            O Acervo Digital de Fósseis Vegetais é um repositório online voltado exclusivamente a registros paleobotânicos.
            Desenvolvido como parte de um projeto de Iniciação Científica da Universidade Federal do Piauí (UFPI), no
            Laboratório de Pesquisas Aplicadas a Visão e Inteligencia Computacional (PAVIC), o sistema nasceu da necessidade de reunir, padronizar e preservar digitalmente
            informações que se encontram dispersas em diferentes fontes e coleções físicas.
          </p>
          <p style={p}>
            O objetivo é oferecer uma base de dados aberta à comunidade acadêmica, promovendo o intercâmbio científico e a valorização
            da paleobotânica, ao mesmo tempo em que garante a preservação de imagens e informações de valor histórico e educacional.
          </p>
        </div>
      </section>

      {/* Como o acervo funciona? — agora em texto corrido */}
      <section style={{ marginTop: 28 }}>
        <h2 style={h2}>Como o acervo funciona?</h2>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <p style={p}>
            O acervo recebe contribuições fotográficas de fósseis vegetais enviadas por pesquisadores e colaboradores. As submissões seguem diretrizes de qualidade de imagem e o preenchimento de campos obrigatórios (espécie, família, período geológico e local de origem). A descrição é livre e opcional, utilizada para observações adicionais, como método de datação, tipo de fossilização ou contexto do achado.
          </p>
          <p style={p}>
            Após as validações técnicas básicas (consistência de dados e formato dos arquivos), os registros ficam disponíveis para busca e navegação pública. A plataforma oferece filtros por período, família e localização, permitindo que a comunidade acadêmica explore e compare achados de forma ágil. As submissões são monitoradas pela equipe do projeto, com revisão evolutiva conforme o acervo cresce e amadurece.
          </p>
        </div>
      </section>

      {/* Quais dados guardamos — sem hover */}
      <section style={{ margin: "32px 0 28px" }}>
        <h2 style={h2}>Quais dados são armazenados?</h2>
        <div style={grid3}>
          <DataCard title="Imagem do fóssil" text="Fotografia principal em boa qualidade e fundo neutro." />
          <DataCard title="Espécie e família" text="Identificação taxonômica informada no envio." />
          <DataCard title="Período geológico" text="Era correspondente (ex.: Devoniano, Carbonífero, Permiano etc.)." />
          <DataCard title="Localização" text="Região/estado brasileiro de origem do fóssil." />
          <DataCard title="Descrição (opcional)" text="Observações adicionais (método de datação, tipo de fossilização, contexto do achado)." />
          <DataCard title="Autor do envio" text="Nome e contato do colaborador (quando autorizado)." />
        </div>
      </section>

      {/* Licenças e uso — neutro/seguro para protótipo */}
      <section
        style={{
          marginTop: 12,
          border: `1px solid ${border}`,
          background: "#f6f9f6",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h3 style={h3}>Licenças e uso</h3>
        <p style={p}>
          O acervo é voltado a fins acadêmicos e científicos. O reuso de imagens deve respeitar o crédito ao autor do envio.
          Detalhes de licenciamento aberto poderão ser incorporados em versões futuras, alinhados à política institucional.
        </p>
      </section>

      {/* FAQ — removidas as perguntas sobre citação/crédito */}
      <section style={{ marginTop: 28 }}>
        <h2 style={h2}>Perguntas frequentes</h2>
        <div style={{ maxWidth: 880, margin: "0 auto" }}>
          <Details title="Quem pode contribuir com o acervo?">
            Colaboradores que possuam registros fotográficos de fósseis vegetais e possam informar espécie, família, período e local. Há orientações de fotografia na página <strong>Contribuir</strong>.
          </Details>

          <Details title="Como posso reportar um erro ou sugerir uma correção?">
            Você pode enviar correções e sugestões diretamente para o e-mail <strong>acervofosseisvegetais@gmail.com</strong>.
          </Details>

          <Details title="Quais filtros de busca estão disponíveis?">
            Atualmente, é possível filtrar por <strong>período geológico</strong>, <strong>família</strong> e <strong>localização</strong>, além da pesquisa por palavras-chave.
          </Details>
        </div>
      </section>

      {/* CTA final (verde) — mantém o estilo do Contribuir.tsx */}
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
            Junte-se à nossa missão
          </h3>
          <p style={{ margin: "8px auto 18px", maxWidth: 720, opacity: 0.9 }}>
            Explore a história da vida vegetal ou contribua com seu conhecimento para expandir este acervo.
          </p>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={() => navigate("/perfil")} style={btnLight}>
              Contribuir
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

/* ---------- Subcomponentes ---------- */
function DataCard({ title, text }: { title: string; text: string }) {
  return (
    <div
      style={{
        border: "1px solid var(--gray-200, #e7ece7)",
        background: "#fff",
        borderRadius: 14,
        padding: 16,
        textAlign: "center",
      }}
    >
      <div style={{ fontWeight: 800, marginBottom: 4 }}>{title}</div>
      <div style={{ color: "var(--gray-700, #4a4a4a)", lineHeight: 1.45 }}>{text}</div>
    </div>
  );
}

function Details({ title, children }: { title: string; children: React.ReactNode }) {
  const border = "var(--gray-200, #e7ece7)";
  return (
    <details style={{ borderBottom: `1px solid ${border}`, padding: "10px 0" }}>
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
          fontWeight: 800,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {title}
        <span aria-hidden style={{ fontSize: 20, lineHeight: 1, opacity: 0.7 }}>▾</span>
      </summary>
      <div style={{ marginTop: 8, color: "var(--gray-800, #333)" }}>{children}</div>
    </details>
  );
}

/* ---------- estilos base ---------- */
const h2: React.CSSProperties = {
  textAlign: "center",
  fontFamily: "Playfair Display, serif",
  fontSize: 24,
  fontWeight: 800,
  margin: 0,
  color: "var(--color-primary, #1a4d2e)",
  marginBottom: 12,
};
const h3: React.CSSProperties = {
  fontFamily: "Playfair Display, serif",
  fontSize: 20,
  fontWeight: 800,
  color: "var(--color-primary, #1a4d2e)",
  margin: 0,
  marginBottom: 8,
};
const p: React.CSSProperties = {
  margin: "0 0 10px",
  lineHeight: 1.6,
  color: "var(--gray-900, #2b2b2b)",
};
const grid3: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 16,
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
const btnOutline: React.CSSProperties = {
  background: "transparent",
  color: "#fff",
  padding: "10px 16px",
  borderRadius: 999,
  border: "2px solid #e8e3d9",
  fontWeight: 800,
  cursor: "pointer",
};
