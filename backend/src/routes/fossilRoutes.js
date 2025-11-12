const express = require('express');
const router = express.Router();

const fossilController = require('../controllers/fossilController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware'); // usa o middleware seguro central

// Listar (PÚBLICA)
router.get('/', fossilController.listFossils);

// Criar (PROTEGIDA)
router.post('/', authMiddleware, upload.single('imagem'), fossilController.createFossil);

// Atualizar (PROTEGIDA) — imagem opcional
router.put('/:id', authMiddleware, upload.single('imagem'), fossilController.updateFossil);

// Excluir (PROTEGIDA)
router.delete('/:id', authMiddleware, fossilController.deleteFossil);

// Detalhe (PÚBLICA)
router.get('/:id', fossilController.getFossilById);

module.exports = router;
