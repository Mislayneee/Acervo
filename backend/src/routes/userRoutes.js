// src/routes/userRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../middlewares/authMiddleware');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');

/** Utils */
const isNonEmpty = (v) => typeof v === 'string' && v.trim().length > 0;
const toBool = (v) => {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return v !== 0;
  if (typeof v !== 'string') return false;
  const s = v.trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'on' || s === 'yes';
};

/** GET /users/me -> retorna perfil completo */
router.get('/me', auth, async (req, res) => {
  try {
    const me = await prisma.user.findUnique({
      where: { id: Number(req.userId) },
      select: {
        id: true,
        nome: true,
        email: true,

        // Perfil público
        role: true,
        affiliation: true,
        city: true,
        state: true,
        country: true,
        lattes: true,

        // Preferências
        showName: true,
        showAffiliation: true,
        showContact: true,
        contactPublic: true,

        createdAt: true,
        updatedAt: true,
      }
    });
    if (!me) return res.status(404).json({ error: 'Usuário não encontrado.' });
    return res.json(me);
  } catch (e) {
    console.error('GET /users/me', e);
    return res.status(500).json({ error: 'Erro ao buscar seu perfil.' });
  }
});

/** PUT /users/me -> atualiza perfil completo + senha opcional */
router.put('/me', auth, async (req, res) => {
  try {
    const userId = Number(req.userId);
    const {
      // acesso
      nome,
      email,

      // perfil público
      role,
      affiliation,
      city,
      state,
      country,
      lattes,

      // preferências
      showName,
      showAffiliation,
      showContact,
      contactPublic,

      // senha
      senhaAtual,
      novaSenha,
    } = req.body ?? {};

    const data = {};

    // nome / email (opcionais)
    if (typeof nome === 'string' && nome.trim()) data.nome = nome.trim();
    if (typeof email === 'string' && email.trim()) data.email = email.trim();

    // campos públicos (aceitam vazio -> vira null)
    if (role !== undefined)        data.role        = isNonEmpty(String(role)) ? String(role).trim() : null;
    if (affiliation !== undefined) data.affiliation = isNonEmpty(String(affiliation)) ? String(affiliation).trim() : null;
    if (city !== undefined)        data.city        = isNonEmpty(String(city)) ? String(city).trim() : null;
    if (state !== undefined)       data.state       = isNonEmpty(String(state)) ? String(state).trim() : null;
    if (country !== undefined)     data.country     = isNonEmpty(String(country)) ? String(country).trim() : null;
    if (lattes !== undefined)      data.lattes      = isNonEmpty(String(lattes)) ? String(lattes).trim() : null;

    // flags de privacidade
    if (showName !== undefined)        data.showName        = toBool(showName);
    if (showAffiliation !== undefined) data.showAffiliation = toBool(showAffiliation);
    if (showContact !== undefined)     data.showContact     = toBool(showContact);

    // contactPublic depende de showContact
    const willShowContact = (data.showContact !== undefined)
      ? data.showContact
      : undefined;

    if (willShowContact === true || (willShowContact === undefined && toBool(showContact))) {
      // precisa ter contactPublic não vazio
      if (contactPublic === undefined || !isNonEmpty(String(contactPublic))) {
        return res.status(400).json({ error: 'Informe um contato público para exibir.' });
      }
      data.contactPublic = String(contactPublic).trim();
    } else if (willShowContact === false) {
      // desabilitado -> zera contato público
      data.contactPublic = null;
    } else if (contactPublic !== undefined) {
      // showContact não mudou, mas o contato veio no body -> atualiza
      data.contactPublic = isNonEmpty(String(contactPublic)) ? String(contactPublic).trim() : null;
    }

    // troca de senha (opcional)
    if (novaSenha) {
      if (!senhaAtual) {
        return res.status(400).json({ error: 'Informe a senha atual para alterá-la.' });
      }
      const current = await prisma.user.findUnique({ where: { id: userId } });
      if (!current) return res.status(404).json({ error: 'Usuário não encontrado.' });
      const ok = await bcrypt.compare(String(senhaAtual), current.senha);
      if (!ok) return res.status(400).json({ error: 'Senha atual incorreta.' });
      data.senha = await bcrypt.hash(String(novaSenha), 10);
    }

    if (!Object.keys(data).length) {
      return res.status(400).json({ error: 'Nada para atualizar.' });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data,
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        affiliation: true,
        city: true,
        state: true,
        country: true,
        lattes: true,
        showName: true,
        showAffiliation: true,
        showContact: true,
        contactPublic: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    return res.json({ message: 'Perfil atualizado com sucesso.', user: updated });
  } catch (e) {
    console.error('PUT /users/me', e);
    return res.status(500).json({ error: 'Erro ao atualizar seu perfil.' });
  }
});

// GET /users/:id/public -> perfil público conforme flags
router.get('/:id/public', async (req, res) => {
  try {
    const id = Number(req.params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        nome: true,
        role: true,
        affiliation: true,
        city: true, state: true, country: true,
        lattes: true,
        showName: true,
        showAffiliation: true,
        showContact: true,
        contactPublic: true,
      }
    });
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });

    // mesma lógica do contributor
    const pub = {
      id: user.id,
      name: user.showName ? user.nome : null,
      affiliation: user.showAffiliation ? user.affiliation : null,
      contact: user.showContact ? user.contactPublic : null,
      role: user.role || null,
      location: [user.city, user.state, user.country].filter(Boolean).join(', ') || null,
      lattes: user.lattes || null,
    };
    return res.json(pub);
  } catch (e) {
    console.error('GET /users/:id/public', e);
    return res.status(500).json({ error: 'Erro ao buscar perfil público.' });
  }
});

module.exports = router;
