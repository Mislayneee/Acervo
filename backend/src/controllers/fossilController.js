const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');
const { z } = require('zod');

// ---------- Helpers ----------
const trimStr = (v) => (typeof v === 'string' ? v.trim() : v);

function toUploadsRelative(filename) {
  return filename ? `uploads/${filename}` : null;
}
function absoluteFromRelative(p) {
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

// ---------- Schemas ----------
const fossilCreateSchema = z.object({
  especie: z.string().trim().min(1, 'especie é obrigatória'),
  familia: z.string().trim().min(1, 'familia é obrigatória'),
  periodo: z.string().trim().min(1, 'periodo é obrigatório'),
  localizacao: z.string().trim().min(1, 'localizacao é obrigatória'),
  descricao: z.string().trim().max(5000).optional().nullable(),
});

const fossilUpdateSchema = z
  .object({
    especie: z.string().trim().min(1).optional(),
    familia: z.string().trim().min(1).optional(),
    periodo: z.string().trim().min(1).optional(),
    localizacao: z.string().trim().min(1).optional(),
    descricao: z.string().trim().max(5000).optional().nullable(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Nenhum campo para atualizar.',
  });

// ---------- Controllers ----------
/**
 * GET /fosseis (PÚBLICA)
 */
const listFossils = async (req, res) => {
  try {
    const {
      q = '',
      especie = '',
      familia = '',
      periodo = '',
      localizacao = '',
      userId = '',
      page = '1',
      limit: limitParam,
      pageSize: pageSizeParam,
      orderBy = 'createdAt',
      orderDir = 'desc',
    } = req.query;

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const rawLimit = limitParam ?? pageSizeParam ?? '12';
    const limit = Math.min(50, Math.max(parseInt(rawLimit, 10) || 12, 1));
    const skip = (pageNum - 1) * limit;

    const allowedOrderFields = [
      'createdAt',
      'especie',
      'familia',
      'periodo',
      'localizacao',
    ];
    const safeOrderBy = allowedOrderFields.includes(String(orderBy))
      ? String(orderBy)
      : 'createdAt';
    const safeOrderDir = String(orderDir) === 'asc' ? 'asc' : 'desc';

    const whereAND = [];
    if (q) {
      whereAND.push({
        OR: [
          { especie: { contains: String(q), mode: 'insensitive' } },
          { familia: { contains: String(q), mode: 'insensitive' } },
          { periodo: { contains: String(q), mode: 'insensitive' } },
          { localizacao: { contains: String(q), mode: 'insensitive' } },
          { descricao: { contains: String(q), mode: 'insensitive' } },
        ],
      });
    }
    if (especie)
      whereAND.push({
        especie: { contains: String(especie), mode: 'insensitive' },
      });
    if (familia)
      whereAND.push({
        familia: { contains: String(familia), mode: 'insensitive' },
      });
    if (localizacao)
      whereAND.push({
        localizacao: { contains: String(localizacao), mode: 'insensitive' },
      });
    if (periodo) whereAND.push({ periodo: String(periodo) });

    if (userId && !Number.isNaN(Number(userId))) {
      whereAND.push({ userId: Number(userId) });
    }

    const where = whereAND.length ? { AND: whereAND } : undefined;

    const [items, total] = await Promise.all([
      prisma.fossil.findMany({
        where,
        orderBy: { [safeOrderBy]: safeOrderDir },
        skip,
        take: limit,
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
        },
      }),
      prisma.fossil.count({ where }),
    ]);

    return res.json({
      items,
      page: pageNum,
      limit,
      total,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Erro no GET /fosseis:', error);
    return res.status(500).json({ error: 'Erro ao buscar fósseis.' });
  }
};

/**
 * POST /fosseis (PROTEGIDA)
 */
const createFossil = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) return res.status(401).json({ error: 'Não autenticado.' });

    const parsed = fossilCreateSchema.parse({
      especie: req.body.especie,
      familia: req.body.familia,
      periodo: req.body.periodo,
      localizacao: req.body.localizacao,
      descricao: req.body.descricao ?? null,
    });

    const imageUrl = req.file?.filename ? toUploadsRelative(req.file.filename) : null;

    const fossil = await prisma.fossil.create({
      data: {
        especie: trimStr(parsed.especie),
        familia: trimStr(parsed.familia),
        periodo: trimStr(parsed.periodo),
        localizacao: trimStr(parsed.localizacao),
        descricao: parsed.descricao ? trimStr(parsed.descricao) : null,
        imageUrl,
        userId: Number(userId),
      },
      include: {
        user: {
          select: { id: true, nome: true, email: true },
        },
      },
    });

    return res.status(201).json({ message: 'Fóssil criado com sucesso', fossil });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(422).json({ error: 'Validação falhou.', issues: err.errors });
    }
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
      select: {
        id: true,
        especie: true,
        familia: true,
        periodo: true,
        localizacao: true,
        descricao: true,
        imageUrl: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            nome: true,
            email: true,

            // ——— PERFIL PÚBLICO ———
            role: true,
            affiliation: true,
            city: true,
            state: true,
            country: true,
            lattes: true,

            // ——— FLAGS DE PRIVACIDADE ———
            showName: true,
            showAffiliation: true,
            showContact: true,
            contactPublic: true,
          },
        },
      },
    });

    if (!fossil) return res.status(404).json({ error: 'Fóssil não encontrado.' });

    const u = fossil.user;
    const userSlim = u ? { id: u.id, nome: u.nome, email: u.email } : null;

    const author = u
      ? {
          id: u.id,
          nome: u.nome,
          email: u.email,
          role: u.role,
          affiliation: u.affiliation,
          city: u.city,
          state: u.state,
          country: u.country,
          lattes: u.lattes,
          showName: u.showName,
          showAffiliation: u.showAffiliation,
          showContact: u.showContact,
          contactPublic: u.contactPublic,
        }
      : null;

    const { user, ...rest } = fossil;
    return res.status(200).json({ ...rest, user: userSlim, author });
  } catch (err) {
    console.error('❌ Erro ao buscar fóssil por ID:', err);
    return res
      .status(500)
      .json({ error: 'Erro ao buscar fóssil.', detalhe: err.message });
  }
};

/**
 * PUT /fosseis/:id (PROTEGIDA, somente DONO)
 */
const updateFossil = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId;
    if (Number.isNaN(id) || !userId)
      return res.status(400).json({ error: 'Dados inválidos.' });

    const existing = await prisma.fossil.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Fóssil não encontrado.' });
    if (existing.userId !== Number(userId))
      return res.status(403).json({ error: 'Sem permissão.' });

    const parsed = fossilUpdateSchema.parse({
      especie: req.body.especie,
      familia: req.body.familia,
      periodo: req.body.periodo,
      localizacao: req.body.localizacao,
      descricao: req.body.descricao ?? undefined,
    });

    const data = {};
    if (parsed.especie !== undefined) data.especie = trimStr(parsed.especie);
    if (parsed.familia !== undefined) data.familia = trimStr(parsed.familia);
    if (parsed.periodo !== undefined) data.periodo = trimStr(parsed.periodo);
    if (parsed.localizacao !== undefined)
      data.localizacao = trimStr(parsed.localizacao);
    if (parsed.descricao !== undefined)
      data.descricao = parsed.descricao ? trimStr(parsed.descricao) : null;

    if (req.file?.filename) {
      const newRel = toUploadsRelative(req.file.filename);
      data.imageUrl = newRel;

      if (existing.imageUrl) {
        safeUnlink(absoluteFromRelative(existing.imageUrl));
      }
    }

    const updated = await prisma.fossil.update({
      where: { id },
      data,
      include: { user: { select: { id: true, nome: true, email: true } } },
    });

    return res.json({ message: 'Atualizado com sucesso.', fossil: updated });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(422).json({ error: 'Validação falhou.', issues: err.errors });
    }
    console.error('❌ Erro ao atualizar fóssil:', err);
    return res.status(500).json({ error: 'Erro ao atualizar fóssil.' });
  }
};

/**
 * DELETE /fosseis/:id (PROTEGIDA, somente DONO)
 */
const deleteFossil = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const userId = req.userId;
    if (Number.isNaN(id) || !userId)
      return res.status(400).json({ error: 'Dados inválidos.' });

    const existing = await prisma.fossil.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ error: 'Fóssil não encontrado.' });
    if (existing.userId !== Number(userId))
      return res.status(403).json({ error: 'Sem permissão.' });

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
  listFossils,
  createFossil,
  getFossilById,
  updateFossil,
  deleteFossil,
};
