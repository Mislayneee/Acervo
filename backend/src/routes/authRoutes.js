// src/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      nome, email, senha,

      // perfil público (opcionais)
      role = null,
      affiliation = null,
      city = null,
      state = null,
      country = null,
      lattes = null,
      contactPublic = null,

      // flags (padrões sensatos)
      showName = true,
      showAffiliation = true,
      showContact = false,
    } = req.body ?? {};

    if (!nome || !email || !senha) {
      return res.status(400).json({ error: 'Informe nome, email e senha.' });
    }

    const existe = await prisma.user.findUnique({ where: { email } });
    if (existe) return res.status(400).json({ error: 'E-mail já cadastrado.' });

    const hash = await bcrypt.hash(String(senha), 10);

    const user = await prisma.user.create({
      data: {
        nome, email, senha: hash,
        role, affiliation, city, state, country, lattes,
        showName: !!showName,
        showAffiliation: !!showAffiliation,
        showContact: !!showContact,
        contactPublic: showContact ? (contactPublic ?? null) : null,
      },
      select: {
        id: true, nome: true, email: true,
        role: true, affiliation: true, city: true, state: true, country: true, lattes: true,
        showName: true, showAffiliation: true, showContact: true, contactPublic: true,
        createdAt: true, updatedAt: true,
      }
    });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    return res.status(201).json({ token, user });
  } catch (e) {
    console.error('POST /auth/register', e);
    return res.status(500).json({ error: 'Erro ao registrar.' });
  }
});


// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body ?? {};
    if (!email || !senha) {
      return res.status(400).json({ error: 'Informe e-mail e senha.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const senhaOk = await bcrypt.compare(String(senha), user.senha);
    if (!senhaOk) return res.status(401).json({ error: 'Credenciais inválidas.' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    const safeUser = {
      id: user.id,
      nome: user.nome,
      email: user.email,
      role: user.role,
      affiliation: user.affiliation,
      city: user.city,
      state: user.state,
      country: user.country,
      lattes: user.lattes,
      showName: user.showName,
      showAffiliation: user.showAffiliation,
      showContact: user.showContact,
      contactPublic: user.contactPublic,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    return res.json({ token, user: safeUser });
  } catch (e) {
    console.error('POST /auth/login', e);
    return res.status(500).json({ error: 'Erro no login.' });
  }
});

module.exports = router;
