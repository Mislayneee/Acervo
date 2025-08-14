// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const prisma = new PrismaClient();

// -------- Middlewares --------
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
}));
app.use(express.json());

// -------- Healthcheck --------
app.get('/health', (_req, res) => res.json({ ok: true }));

// -------- Raiz --------
app.get('/', (_req, res) => {
  res.send('API do Acervo de Fósseis funcionando ✅');
});

// -------- GET /fosseis (pública) --------
// Lista/busca com filtros, paginação e ordenação.
// Suporta filtros: especie, familia, periodo, localizacao, q, userId
// Paginação: page, pageSize
// Ordenação: order=campo:direcao  (campos permitidos abaixo)
app.get('/fosseis', async (req, res) => {
  try {
    const {
      especie,
      familia,
      periodo,
      localizacao,
      q,
      userId,                 // <- para biblioteca pessoal
      page = '1',
      pageSize = '12',
      order = 'createdAt:desc',
    } = req.query;

    // paginação segura
    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const sizeNum = Math.min(Math.max(parseInt(pageSize, 10) || 12, 1), 50);
    const skip = (pageNum - 1) * sizeNum;

    // ordenação segura
    const [orderFieldRaw, orderDirRaw] = String(order).split(':');
    const allowedFields = ['createdAt', 'especie', 'familia', 'periodo', 'localizacao'];
    const orderField = allowedFields.includes(orderFieldRaw) ? orderFieldRaw : 'createdAt';
    const orderDir = orderDirRaw === 'asc' ? 'asc' : 'desc';

    // filtros
    const where = {
      ...(especie && { especie: { contains: String(especie), mode: 'insensitive' } }),
      ...(familia && { familia: { contains: String(familia), mode: 'insensitive' } }),
      ...(periodo && { periodo: { contains: String(periodo), mode: 'insensitive' } }),
      ...(localizacao && { localizacao: { contains: String(localizacao), mode: 'insensitive' } }),
      ...(userId && !Number.isNaN(Number(userId)) && { userId: Number(userId) }),
      ...(q && {
        OR: [
          { especie: { contains: String(q), mode: 'insensitive' } },
          { familia: { contains: String(q), mode: 'insensitive' } },
          { periodo: { contains: String(q), mode: 'insensitive' } },
          { localizacao: { contains: String(q), mode: 'insensitive' } },
          { descricao: { contains: String(q), mode: 'insensitive' } },
        ],
      }),
    };

    const [items, total] = await Promise.all([
      prisma.fossil.findMany({
        where,
        include: { user: true },
        skip,
        take: sizeNum,
        orderBy: { [orderField]: orderDir },
      }),
      prisma.fossil.count({ where }),
    ]);

    res.json({ items, total, page: pageNum, pageSize: sizeNum });
  } catch (error) {
    console.error('Erro no GET /fosseis:', error);
    res.status(500).json({ error: 'Erro ao buscar fósseis.' });
  }
});

// -------- Rotas de autenticação --------
const authRoutes = require('./src/routes/authRoutes');
app.use('/auth', authRoutes);

// -------- Rotas de fósseis (protegidas e detalhe) --------
// IMPORTANTE: dentro de src/routes/fossilRoutes.js NÃO ter router.get('/').
// Lá devem ficar: POST / (protegida, com upload) e GET /:id (pública).
const fossilRoutes = require('./src/routes/fossilRoutes');
app.use('/fosseis', fossilRoutes);

// -------- Arquivos estáticos --------
app.use('/uploads', express.static(path.resolve('uploads')));

// -------- Inicialização --------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
