// src/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  // Espera: Authorization: Bearer <token>
  const authHeader = req.headers.authorization || '';
  const parts = authHeader.split(' ');
  const token = parts.length === 2 && /^Bearer$/i.test(parts[0]) ? parts[1] : null;

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    // SEU controller assina { userId: <id> }
    if (!payload?.userId) {
      return res.status(401).json({ error: 'Token inválido.' });
    }
    req.userId = Number(payload.userId);
    return next();
  } catch (e) {
    return res.status(401).json({ error: 'Token inválido ou expirado.' });
  }
};
