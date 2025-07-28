const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createFossil = async (req, res) => {
  console.log("🧾 req.body:", req.body);
  console.log("🖼️ req.file:", req.file);

  const userId = req.userId;
  const { especie, periodo, local, descricao } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  try {
    const fossil = await prisma.fossil.create({
      data: {
        especie,
        periodo,
        local,
        descricao,
        imageUrl,
        userId,
      }
    });

    res.status(201).json({ message: 'Fóssil criado com sucesso', fossil });
  } catch (err) {
    console.error('❌ Erro ao criar fóssil:', err);
    res.status(500).json({ error: 'ERRO ao criar fóssil' });
  }
};

module.exports = { createFossil };
