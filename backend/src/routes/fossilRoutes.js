// src/routes/fossilRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fossilController = require('../controllers/fossilController');

// Configuração do multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '-');
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST /api/fosseis - Enviar fósseis
router.post('/', upload.single('imagem'), fossilController.createFossil);

// GET /api/fosseis[?periodo=Devoniano] - Listar fósseis com ou sem filtro
router.get('/', fossilController.listFossils);

router.get('/:id', fossilController.getFossilById);

module.exports = router;
