// src/controllers/fossilController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const path = require('path');
const fs = require('fs');

/** Monta o bloco "contributor" respeitando as flags de privacidade */
function buildPublicContributor(user) {
  if (!user) return null;

  const name = user.showName ? user.nome : null;
  const affiliation = user.showAffiliation ? user.affiliation : null;
  const contact = user.showContact ? user.contactPublic : null;

  // Campos “neutros” (se vieram nulos do banco, continuam nulos)
  const location = [user.city, user.state, user.country].filter(Boolean).join(', ') || null;

  return {
    id: user.id,                 // id é útil para links internos (não é sensível)
    name,                        // pode ser null se não permitido
    affiliation,                 // pode ser null se não permitido
    contact,                     // pode ser null se não permitido
    role: user.role || null,
    location,
    lattes: user.lattes || null,
  };
}

/** Criação de fóssil (PROTEGIDA) */
exports.createFossil = async (req, res) => {
  try {
    const { especie, familia, periodo, descricao, localizacao } = req.body ?? {};

    if (!especie || !periodo) {
      return res.status(400).json({ error: 'Preencha ao menos espécie e período.' });
    }

    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const created = await prisma.fossil.create({
      data: {
        especie: String(especie).trim(),
        familia: familia ? String(familia).trim() : null,
        periodo: String(periodo).trim(),
        descricao: descricao ? String(descricao).trim() : null,
        localizacao: localizacao ? String(localizacao).trim() : null,
        imageUrl,
        userId: Number(req.userId),
      },
      select: {
        id: true, especie: true, familia: true, periodo: true, localizacao: true,
        descricao: true, imageUrl: true, createdAt: true, userId: true,
      }
    });

    return res.status(201).json(created);
  } catch (e) {
    console.error('createFossil', e);
    return res.status(500).json({ error: 'Erro ao criar fóssil.' });
  }
};

/** Atualização de fóssil (PROTEGIDA) — imagem opcional */
exports.updateFossil = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fossil = await prisma.fossil.findUnique({ where: { id } });
    if (!fossil) return res.status(404).json({ error: 'Fóssil não encontrado.' });
    if (fossil.userId !== Number(req.userId)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    const { especie, familia, periodo, descricao, localizacao } = req.body ?? {};
    const data = {};

    if (especie !== undefined)     data.especie = especie ? String(especie).trim() : null;
    if (familia !== undefined)     data.familia = familia ? String(familia).trim() : null;
    if (periodo !== undefined)     data.periodo = periodo ? String(periodo).trim() : null;
    if (descricao !== undefined)   data.descricao = descricao ? String(descricao).trim() : null;
    if (localizacao !== undefined) data.localizacao = localizacao ? String(localizacao).trim() : null;

    if (req.file) {
      // remove arquivo anterior (se existia e era local)
      if (fossil.imageUrl && fossil.imageUrl.startsWith('/uploads/')) {
        const p = path.resolve('.', fossil.imageUrl.replace('/uploads/', 'uploads/'));
        fs.existsSync(p) && fs.unlink(p, () => {});
      }
      data.imageUrl = `/uploads/${req.file.filename}`;
    }

    const updated = await prisma.fossil.update({
      where: { id },
      data,
      select: {
        id: true, especie: true, familia: true, periodo: true, localizacao: true,
        descricao: true, imageUrl: true, createdAt: true, userId: true,
      }
    });

    return res.json(updated);
  } catch (e) {
    console.error('updateFossil', e);
    return res.status(500).json({ error: 'Erro ao atualizar fóssil.' });
  }
};

/** Remoção (PROTEGIDA) */
exports.deleteFossil = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fossil = await prisma.fossil.findUnique({ where: { id } });
    if (!fossil) return res.status(404).json({ error: 'Fóssil não encontrado.' });
    if (fossil.userId !== Number(req.userId)) {
      return res.status(403).json({ error: 'Acesso negado.' });
    }

    // remove arquivo local se existir
    if (fossil.imageUrl && fossil.imageUrl.startsWith('/uploads/')) {
      const p = path.resolve('.', fossil.imageUrl.replace('/uploads/', 'uploads/'));
      fs.existsSync(p) && fs.unlink(p, () => {});
    }

    await prisma.fossil.delete({ where: { id } });
    return res.status(204).end();
  } catch (e) {
    console.error('deleteFossil', e);
    return res.status(500).json({ error: 'Erro ao remover fóssil.' });
  }
};

/** Detalhe (PÚBLICA) com bloco contributor já filtrado */
exports.getFossilById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const fossil = await prisma.fossil.findUnique({
      where: { id },
      select: {
        id: true,
        especie: true,
        familia: true,
        periodo: true,
        localizacao: true,
        descricao: true,
        imageUrl: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            id: true,
            nome: true,
            email: true,            // não será exposto no contributor
            role: true,
            affiliation: true,
            city: true, state: true, country: true,
            lattes: true,
            showName: true,
            showAffiliation: true,
            showContact: true,
            contactPublic: true,
          }
        }
      }
    });

    if (!fossil) return res.status(404).json({ error: 'Fóssil não encontrado.' });

    const contributor = buildPublicContributor(fossil.user);

    // Não exponho o objeto user cru — só o contributor tratado.
    const { user, ...rest } = fossil;
    return res.json({ ...rest, contributor });
  } catch (e) {
    console.error('getFossilById', e);
    return res.status(500).json({ error: 'Erro ao buscar fóssil.' });
  }
};
