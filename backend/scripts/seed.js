// backend/scripts/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  // Usuário demo (senha: demo123)
  const senhaHash = bcrypt.hashSync('demo123', 8);
  const user = await prisma.user.upsert({
    where: { email: 'demo@demo.com' },
    update: {},
    create: {
      nome: 'Usuário Demo',
      email: 'demo@demo.com',
      senha: senhaHash,
      // adicione campos extras se existirem no seu schema, ex:
      // instituicao: 'UFPI',
      // telefone: '5599999999999'
    }
  });

  // Fósseis demo (sem imagem no seed; você pode subir depois pelo front)
  const base = [
    { especie: 'Rhyniophyta sp.', familia: 'Rhyniaceae', periodo: 'Devoniano', localizacao: 'Escócia', descricao: 'Registro basal de plantas vasculares.' },
    { especie: 'Lepidodendron', familia: 'Lycopodiaceae', periodo: 'Carbonífero', localizacao: 'Europa', descricao: 'Árvore de licófitas, tronco escamoso.' },
    { especie: 'Glossopteris', familia: 'Glossopteridaceae', periodo: 'Permiano', localizacao: 'Gondwana', descricao: 'Folhas largas, paleoflora importante.' },
    { especie: 'Sigillaria', familia: 'Sigillariaceae', periodo: 'Carbonífero', localizacao: 'América do Norte', descricao: 'Tronco com marcas sigilares.' },
    { especie: 'Calamites', familia: 'Equisetaceae', periodo: 'Carbonífero', localizacao: 'Europa', descricao: 'Parente das cavalinhas, porte arbóreo.' },
    { especie: 'Archaeopteris', familia: 'Progymnospermopsida', periodo: 'Devoniano', localizacao: 'Global', descricao: 'Transição para gimnospermas.' },
    { especie: 'Neuropteris', familia: 'Medullosaceae', periodo: 'Carbonífero', localizacao: 'Europa', descricao: 'Folhas compostas fossilizadas.' },
    { especie: 'Sphenophyllum', familia: 'Sphenophyllaceae', periodo: 'Carbonífero', localizacao: 'Europa', descricao: 'Pequena planta trepadeira.' },
    { especie: 'Cordaites', familia: 'Cordaitales', periodo: 'Carbonífero', localizacao: 'Europa', descricao: 'Precursora das coníferas.' },
    { especie: 'Ginkgoites', familia: 'Ginkgoaceae', periodo: 'Jurássico', localizacao: 'Ásia', descricao: 'Parente do Ginkgo moderno.' },
  ];

  for (const f of base) {
    await prisma.fossil.create({
      data: {
        ...f,
        userId: user.id,
        imageUrl: null, // ficará null até você enviar pelo formulário
      }
    });
  }

  console.log('Seed concluído ✅');
  console.log('Usuário demo: demo@demo.com  |  senha: demo123');
}

main()
  .then(() => process.exit(0))
  .catch((e) => { console.error(e); process.exit(1); });
