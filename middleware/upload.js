const multer = require('multer');
const path = require('path');
const fs = require('fs-extra');

// Assicura che la directory di upload esista
fs.ensureDirSync('./uploads');

// Configura lo storage per multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Salva i file nella cartella uploads
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    // Genera un nome univoco basato sul timestamp e nome originale
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

// Filtro per accettare solo file CSV
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
    cb(null, true);
  } else {
    cb(new Error('Solo file CSV sono supportati'), false);
  }
};

// Limite dimensione file: 10MB
const MAX_SIZE = 10 * 1024 * 1024;

// Crea l'istanza di multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
});

module.exports = {
  uploadSingle: upload.single('file')
}; 