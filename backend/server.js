// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

/**
 * -------- CORS (allowlist) --------
 * Evita usar '*' com credentials:true.
 * Se CORS_ORIGIN não vier, força http://localhost:5173.
 * Suporta múltiplas origens separadas por vírgula.
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

// -------- Body parsers --------
app.use(express.json());

// -------- Healthcheck --------
app.get('/health', (_req, res) => res.json({ ok: true }));

// -------- Raiz --------
app.get('/', (_req, res) => {
  res.send('API do Acervo de Fósseis funcionando ✅');
});

// -------- Rotas --------
const authRoutes = require('./src/routes/authRoutes');
const fossilRoutes = require('./src/routes/fossilRoutes');
const userRoutes = require('./src/routes/userRoutes');

app.use('/auth', authRoutes);
app.use('/fosseis', fossilRoutes);
app.use('/users', userRoutes);

// -------- Arquivos estáticos --------
app.use('/uploads', express.static(path.resolve('uploads')));

// -------- Swagger --------
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDoc = YAML.load(path.join(__dirname, 'openapi.yaml'));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDoc));

// -------- 404 handler --------
app.use((req, res, next) => {
  if (req.path === '/favicon.ico') return res.status(204).end();
  return res.status(404).json({ error: 'Rota não encontrada.' });
});

// -------- Error handler central --------
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err?.message || err);
  const status = err?.message?.startsWith('Origin não permitido') ? 403 : 500;
  return res.status(status).json({ error: err?.message || 'Erro interno.' });
});

// -------- Inicialização --------
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
