// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

// GET /users/me  -> retorna id, nome, email
router.get('/me', auth, async (req, res) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: Number(req.userId) },
      select: { id: true, nome: true, email: true }
    });
    if (!me) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.json(me);
  } catch (e) {
    console.error('GET /users/me', e);
    return res.status(500).json({ error: 'Erro ao buscar seu perfil.' });
  }
});

// PUT /users/me -> atualiza nome e (opcional) senha
router.put('/me', auth, async (req, res) => {
  try {
    const { nome, senhaAtual, novaSenha } = req.body ?? {};
    const data = {};

    if (typeof nome === 'string' && nome.trim()) {
      data.nome = nome.trim();
    }

    // Troca de senha opcional (requer senhaAtual)
    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ error: 'Informe a senha atual para alterá-la.' });
      }
      const user = await prisma.user.findUnique({ where: { id: Number(req.userId) } });
      if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

      const ok = await bcrypt.compare(String(senhaAtual), user.senha);
      if (!ok) return res.status(400).json({ error: 'Senha atual incorreta.' });

      data.senha = await bcrypt.hash(String(novaSenha), 10);
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({ error: 'Nada para atualizar.' });
    }

    const updated = await prisma.user.update({
      where: { id: Number(req.userId) },
      data,
      select: { id: true, nome: true, email: true }
    });

    return res.json({ message: 'Perfil atualizado com sucesso.', user: updated });
  } catch (e) {
    console.error('PUT /users/me', e);
    return res.status(500).json({ error: 'Erro ao atualizar seu perfil.' });
  }
});

module.exports = router;
