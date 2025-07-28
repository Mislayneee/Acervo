// src/routes/fossilRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const { PrismaClient } = require('@prisma/client');
const path = require('path');

const prisma = new PrismaClient();

// Configuração do multer
const storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

// POST /fosseis
router.post('/', upload.single('imagem'), async (req, res) => {
  console.log('🧾 req.body:', req.body);
  console.log('🖼️ req.file:', req.file);
  
  try {
    const { especie, familia, periodo, localizacao, descricao, userId } = req.body;
    if (!userId || isNaN(parseInt(userId))) {
        console.error('❌ userId inválido:', userId);
        return res.status(400).json({ error: 'ID do usuário não fornecido ou inválido.' });
    }

    const fossil = await prisma.fossil.create({
        data: {
            especie,
            familia,
            periodo,
            local: localizacao, // ✅ corrigido
            descricao,
            imageUrl: `/uploads/${req.file.filename}`,
            userId: parseInt(userId)
        }
        });


    res.status(201).json(fossil);
  } catch (error) {
    console.error('❌ Erro ao cadastrar fóssil:', error);
    res.status(500).json({ error: 'Erro interno ao cadastrar fóssil.', detalhe: error.message });
  }
});

module.exports = router;
