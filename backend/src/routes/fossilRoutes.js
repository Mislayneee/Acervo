const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const fossilController = require('../controllers/fossilController');
const authMiddleware = require('../middlewares/authMiddleware');

// garante que a pasta uploads existe
const uploadDir = path.resolve('uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer seguro
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const time = Date.now();
    const safeOriginal = file.originalname
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9.\-_]/g, '');
    cb(null, `${time}-${safeOriginal}`);
  }
});

const fileFilter = (_req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('Tipo de arquivo inválido. Use JPEG, PNG ou WEBP.'));
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// ==== Rotas ====

// Criar (PROTEGIDA)
router.post('/', authMiddleware, upload.single('imagem'), fossilController.createFossil);

// Atualizar (PROTEGIDA) — imagem opcional
router.put('/:id', authMiddleware, upload.single('imagem'), fossilController.updateFossil);

// Excluir (PROTEGIDA)
router.delete('/:id', authMiddleware, fossilController.deleteFossil);

// Detalhe (PÚBLICA)
router.get('/:id', fossilController.getFossilById);

// IMPORTANTE: NADA de router.get('/') aqui — listagem fica no server.js

module.exports = router;
