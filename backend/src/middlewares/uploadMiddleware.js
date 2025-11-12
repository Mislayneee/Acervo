const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Garante que a pasta existe
const UPLOADS_DIR = 'uploads';
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Armazenamento em disco com nome seguro
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // remove path, espaços e caracteres problemáticos do nome original
    const base = path.basename(file.originalname).replace(/\s+/g, '_').replace(/[^a-zA-Z0-9._-]/g, '');
    const unique = `${Date.now()}-${base}`;
    cb(null, unique);
  }
});

// Tipos permitidos
const ALLOWED = new Set(['image/png', 'image/jpeg', 'image/webp']);

// Filtro por mimetype
function fileFilter(req, file, cb) {
  if (!ALLOWED.has(file.mimetype)) {
    return cb(new Error('Tipo de arquivo não permitido. Use PNG, JPEG ou WEBP.'));
  }
  cb(null, true);
}

// Limite de tamanho: 5MB
const limits = { fileSize: 5 * 1024 * 1024 };

const upload = multer({ storage, fileFilter, limits });

module.exports = upload;
