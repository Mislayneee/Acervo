// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const app = express();
const prisma = new PrismaClient();

/**
 * -------- CORS (travado) --------
 * Evita usar '*' com credentials:true.
 * Se CORS_ORIGIN não vier, força http://localhost:5173.
 */
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(s => s.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    // Permite chamadas sem origin (ex.: Postman) ou se estiver na lista
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    return cb(new Error(`Origin não permitido pelo CORS: ${origin}`));
  },
  credentials: true,
}));

// -------- JSON body --------
app.use(express.json());

// -------- Healthcheck --------
app.get('/health', (_req, res) => res.json({ ok: true }));

// -------- Raiz --------
app.get('/', (_req, res) => {
  res.send('API do Acervo de Fósseis funcionando ✅');
});

/**
 * -------- GET /fosseis (pública) --------
 * Lista/busca com filtros, paginação e ordenação.
 * Filtros: q, especie, familia, periodo, localizacao, userId
 * Paginação: page, limit (ou pageSize para compatibilidade)
 * Ordenação: orderBy (createdAt|especie|familia|periodo|localizacao), orderDir (asc|desc)
 * Resposta: { items, page, limit, total, pages }
 */
app.get('/fosseis', async (req, res) => {
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
    const rawLimit = (limitParam ?? pageSizeParam ?? '12');
    const limit = Math.min(50, Math.max(parseInt(rawLimit, 10) || 12, 1));
    const skip = (pageNum - 1) * limit;

    const allowedOrderFields = ['createdAt', 'especie', 'familia', 'periodo', 'localizacao'];
    const safeOrderBy = allowedOrderFields.includes(String(orderBy)) ? String(orderBy) : 'createdAt';
    const safeOrderDir = String(orderDir) === 'asc' ? 'asc' : 'desc';

    // --- Monta filtros de forma segura ---
    const whereAND = [];

    if (q) {
      whereAND.push({
        OR: [
          { especie:     { contains: String(q),        mode: 'insensitive' } },
          { familia:     { contains: String(q),        mode: 'insensitive' } },
          // se 'periodo' for enum, o contains abaixo não funciona; por isso deixamos só no OR geral:
          { periodo:     { contains: String(q),        mode: 'insensitive' } },
          { localizacao: { contains: String(q),        mode: 'insensitive' } },
          { descricao:   { contains: String(q),        mode: 'insensitive' } },
        ],
      });
    }

    if (especie)     whereAND.push({ especie:     { contains: String(especie),     mode: 'insensitive' } });
    if (familia)     whereAND.push({ familia:     { contains: String(familia),     mode: 'insensitive' } });
    if (localizacao) whereAND.push({ localizacao: { contains: String(localizacao), mode: 'insensitive' } });

    // ⚠️ PERÍODO: usa equals para não quebrar se for enum
    if (periodo)     whereAND.push({ periodo: String(periodo) });

    if (userId && !Number.isNaN(Number(userId))) {
      whereAND.push({ userId: Number(userId) });
    }

    const where = whereAND.length ? { AND: whereAND } : undefined;

    const [items, total] = await Promise.all([
      // ⚠️ select só de campos garantidos para evitar erro de schema
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
          // Se você TIVER relação 'user' e os campos existirem no schema,
          // pode reativar abaixo. Por enquanto mantemos comentado para não quebrar:
          // user: { select: { id: true, nome: true, email: true /*, instituicao: true*/ } }
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
    console.error('Erro no GET /fosseis:', error); // mantém log detalhado no servidor
    return res.status(500).json({ error: 'Erro ao buscar fósseis.' });
  }
});


// -------- Rotas de autenticação --------
const authRoutes = require('./src/routes/authRoutes');
app.use('/auth', authRoutes);

// -------- Rotas de fósseis (protegidas e detalhe) --------
// IMPORTANTE: em src/routes/fossilRoutes.js NÃO inclua router.get('/').
// Lá: POST / (protegida, upload), GET /:id (pública), PUT/DELETE /:id (protegidas).
const fossilRoutes = require('./src/routes/fossilRoutes');
app.use('/fosseis', fossilRoutes);

const userRoutes = require('./src/routes/userRoutes');
app.use('/users', userRoutes);

// -------- Arquivos estáticos --------
app.use('/uploads', express.static(path.resolve('uploads')));

// -------- Inicialização --------
const PORT = process.env.PORT || 3001;
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDoc = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
