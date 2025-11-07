const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// -------- helpers --------
function required(v) {
  return typeof v === 'string' && v.trim().length > 0;
}
function signToken(userId) {
  const secret = process.env.JWT_SECRET || 'dev-secret';
  return jwt.sign({ userId }, secret, { expiresIn: '2h' });
}

// -------- register --------
const register = async (req, res) => {
  try {
    const {
      // credenciais obrigatórias
      nome,
      email,
      senha,

      // PERFIL PÚBLICO — todos opcionais
      role,
      country,
      affiliation,
      city,
      state,
      lattes,

      // preferências — opcionais com defaults
      showName = true,
      showAffiliation = true,
      showContact = false,
      contactPublic
    } = req.body;

    // validações mínimas
    if (!required(nome) || !required(email) || !required(senha)) {
      return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }
    if (showContact && !required(contactPublic)) {
      return res.status(400).json({ error: 'Informe um contato público (telefone ou e-mail).' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email já cadastrado.' });
    }

    const senhaHash = await bcrypt.hash(senha, 10);

    const newUser = await prisma.user.create({
      data: {
        nome,
        email,
        senha: senhaHash,

        // tudo abaixo opcional (schema aceita null)
        role: role ?? null,
        country: country ?? null,
        affiliation: affiliation ?? null,
        city: city ?? null,
        state: state ?? null,
        lattes: lattes ?? null,

        showName: Boolean(showName),
        showAffiliation: Boolean(showAffiliation),
        showContact: Boolean(showContact),
        contactPublic: showContact ? contactPublic : null,
      },
      select: {
        id: true, nome: true, email: true,
        role: true, country: true, affiliation: true,
        city: true, state: true, lattes: true,
        showName: true, showAffiliation: true, showContact: true,
        contactPublic: true,
        createdAt: true, updatedAt: true,
      }
    });

    const token = signToken(newUser.id);

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso.',
      user: newUser,
      token
    });
  } catch (err) {
    console.error('Erro no cadastro:', err);
    return res.status(500).json({ error: 'Erro interno ao tentar cadastrar o usuário.' });
  }
};

// -------- login --------
const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!required(email) || !required(senha)) {
      return res.status(400).json({ error: 'Informe o e-mail e a senha.' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado.' });

    const ok = await bcrypt.compare(senha, user.senha);
    if (!ok) return res.status(401).json({ error: 'Senha incorreta.' });

    const token = signToken(user.id);

    return res.json({
      token,
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        role: user.role,
        country: user.country,
        affiliation: user.affiliation,
        city: user.city,
        state: user.state,
        lattes: user.lattes,
        showName: user.showName,
        showAffiliation: user.showAffiliation,
        showContact: user.showContact,
        contactPublic: user.contactPublic,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }
    });
  } catch (err) {
    console.error('Erro no login:', err);
    return res.status(500).json({ error: 'Erro interno ao tentar fazer login.' });
  }
};

module.exports = { register, login };
