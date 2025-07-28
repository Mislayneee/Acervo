// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

// Middlewares
app.use(cors());
app.use(express.json());

// Teste de rota
app.get('/', (req, res) => {
  res.send('API do Acervo de Fósseis funcionando ✅');
});

// Rota pública para listar fósseis (com usuário)
app.get('/fosseis', async (req, res) => {
  try {
    const fosseis = await prisma.fossil.findMany({
      include: { user: true },
    });
    res.json(fosseis);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar fósseis.' });
  }
});

// Rotas de autenticação (cadastro e login)
const authRoutes = require('./src/routes/authRoutes');
app.use('/auth', authRoutes); // 🔁 tirando o "/api"

// Rotas protegidas (criação de fósseis)
const fossilRoutes = require('./src/routes/fossilRoutes');
app.use('/fosseis', fossilRoutes); // 🔁 tirando o "/api"

// Servir imagens estáticas
app.use('/uploads', express.static('uploads'));

// Inicialização do servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});
