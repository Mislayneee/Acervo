const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

// Helpers
function nonEmpty(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
function toUploadsRelative(filename) {
  return filename ? `uploads/${filename}` : null;
}
function absoluteFromRelative(p) {
  // aceita "uploads/arquivo.jpg" e retorna caminho absoluto
  if (!p) return null;
  const rel = p.startsWith('uploads/') ? p : `uploads/${p}`.replace(/^\/+/, '');
  return path.resolve(rel);
}
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch (e) {
    console.warn('Aviso: falha ao remover arquivo:', filePath, e.message);
  }
}

/**
 * POST /fosseis (PROTEGIDA)
 * Campos obrigatórios: especie, familia, periodo, localizacao
 * Arquivo opcional: imagem (multer)
 */
const createFossil = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Não autenticado.' });

    const {
      especie = '',
      familia = '',
      periodo = '',
      localizacao = '',
      descricao = '',
    } = req.body;

    const missing = [];
    if (!nonEmpty(especie)) missing.push('especie');
    if (!nonEmpty(familia)) missing.push('familia');
    if (!nonEmpty(periodo)) missing.push('periodo');
    if (!nonEmpty(localizacao)) missing.push('localizacao');
    if (missing.length) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes.', fields: missing });
    }

    const imageUrl = req.file?.filename ? toUploadsRelative(req.file.filename) : null;

    const fossil = await prisma.fossil.create({
      data: {
        especie: especie.trim(),
        familia: familia.trim(),
        periodo: periodo.trim(),
        localizacao: localizacao.trim(),
        descricao: descricao?.trim?.() || '',
        imageUrl,
        userId: Number(userId),
      },
      include: { user: true },
    });

    return res.status(201).json({ message: 'Fóssil criado com sucesso', fossil });
  } catch (err) {
    console.error('❌ Erro ao criar fóssil:', err);
    const status = /arquivo|imagem|file/i.test(err?.message) ? 400 : 500;
    return res.status(status).json({
      error: status === 400 ? 'Arquivo inválido.' : 'Erro interno ao cadastrar fóssil.',
      detalhe: err.message,
    });
  }
};

/**
 * GET /fosseis/:id (PÚBLICA)
 */
const getFossilById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (Number.isNaN(id)) {
      return res.status(400).json({ error: 'ID inválido.' });
    }
    const fossil = await prisma.fossil.findUnique({
      where: { id },
      include: { user: true },
    });
    if (!fossil) return res.status(404).json({ error: 'Fóssil não encontrado.' });
    return res.status(200).json(fossil);
  } catch (err) {
    console.error('❌ Erro ao buscar fóssil por ID:', err);
    return res.status(500).json({ error: 'Erro ao buscar fóssil.', detalhe: err.message });
  }
};

/**
 * PUT /fosseis/:id (PROTEGIDA, somente DONO)
 * Atualiza campos enviados; se enviar nova imagem, substitui e remove a antiga.
 */
const updateFossil = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId;
    if (Number.isNaN(id) || !userId) return res.status(400).json({ error: 'Dados inválidos.' });

    const existing = await prisma.fossil.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Fóssil não encontrado.' });
    if (existing.userId !== Number(userId)) return res.status(403).json({ error: 'Sem permissão.' });

    const { especie, familia, periodo, localizacao, descricao } = req.body;

    const data = {};
    if (especie !== undefined) data.especie = String(especie).trim();
    if (familia !== undefined) data.familia = String(familia).trim();
    if (periodo !== undefined) data.periodo = String(periodo).trim();
    if (localizacao !== undefined) data.localizacao = String(localizacao).trim();
    if (descricao !== undefined) data.descricao = String(descricao).trim();

    // Imagem nova?
    if (req.file?.filename) {
      const newRel = toUploadsRelative(req.file.filename);
      data.imageUrl = newRel;

      // remove a antiga (se houver)
      if (existing.imageUrl) {
        safeUnlink(absoluteFromRelative(existing.imageUrl));
      }
    }

    const updated = await prisma.fossil.update({
      where: { id },
      data,
      include: { user: true },
    });

    return res.json({ message: 'Atualizado com sucesso.', fossil: updated });
  } catch (e) {
    console.error('❌ Erro ao atualizar fóssil:', e);
    return res.status(500).json({ error: 'Erro ao atualizar fóssil.' });
  }
};

/**
 * DELETE /fosseis/:id (PROTEGIDA, somente DONO)
 * Remove o registro e a imagem do disco (se existir).
 */
const deleteFossil = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId;
    if (Number.isNaN(id) || !userId) return res.status(400).json({ error: 'Dados inválidos.' });

    const existing = await prisma.fossil.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Fóssil não encontrado.' });
    if (existing.userId !== Number(userId)) return res.status(403).json({ error: 'Sem permissão.' });

    // apaga imagem (se houver)
    if (existing.imageUrl) {
      safeUnlink(absoluteFromRelative(existing.imageUrl));
    }

    await prisma.fossil.delete({ where: { id } });
    return res.json({ message: 'Excluído com sucesso.' });
  } catch (e) {
    console.error('❌ Erro ao excluir fóssil:', e);
    return res.status(500).json({ error: 'Erro ao excluir fóssil.' });
  }
};

module.exports = {
  createFossil,
  getFossilById,
  updateFossil,
  deleteFossil,
};
