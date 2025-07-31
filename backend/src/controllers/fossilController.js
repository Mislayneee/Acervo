const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// POST /api/fosseis
const createFossil = async (req, res) => {
  console.log("🧾 req.body:", req.body);
  console.log("🖼️ req.file:", req.file);

  const {
    especie,
    familia,
    periodo,
    localizacao,
    descricao,
    userId
  } = req.body;

  // Validação de ID do usuário
  if (!userId || isNaN(parseInt(userId))) {
    console.error('❌ userId inválido:', userId);
    return res.status(400).json({ error: 'ID do usuário não fornecido ou inválido.' });
  }

  const imageUrl = req.file?.filename || null;

  try {
    const fossil = await prisma.fossil.create({
      data: {
        especie,
        familia,
        periodo,
        local: localizacao,
        descricao,
        imageUrl,
        userId: parseInt(userId)
      }
    });

    res.status(201).json({ message: 'Fóssil criado com sucesso', fossil });
  } catch (err) {
    console.error('❌ Erro ao criar fóssil:', err);
    res.status(500).json({ error: 'Erro interno ao cadastrar fóssil.', detalhe: err.message });
  }
};

// GET /api/fosseis[?periodo=Devoniano]
const listFossils = async (req, res) => {
  const { periodo } = req.query;

  const whereClause = periodo
    ? { periodo: { equals: periodo, mode: 'insensitive' } }
    : {};

  try {
    const fossils = await prisma.fossil.findMany({
      where: whereClause,
      orderBy: { periodo: 'asc' }
    });

    res.status(200).json(fossils);
  } catch (err) {
    console.error('❌ Erro ao buscar fósseis:', err);
    res.status(500).json({ error: 'Erro ao buscar fósseis.', detalhe: err.message });
  }
};

// GET /api/fosseis/:id
const getFossilById = async (req, res) => {
  const { id } = req.params;

  try {
    const fossil = await prisma.fossil.findUnique({
      where: { id: parseInt(id) }
    });

    if (!fossil) {
      return res.status(404).json({ error: 'Fóssil não encontrado' });
    }

    res.status(200).json(fossil);
  } catch (err) {
    console.error('❌ Erro ao buscar fóssil por ID:', err);
    res.status(500).json({ error: 'Erro ao buscar fóssil.', detalhe: err.message });
  }
};

module.exports = {
  createFossil,
  listFossils,
  getFossilById
};
