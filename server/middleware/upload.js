const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const env = require('../config/env');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Storage engine with sanitized unique filenames
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
    cb(null, `file-${uniqueSuffix}${ext}`);
  },
});

// Allowed file types filter
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|webp|svg|pdf|doc|docx|txt|zip|json/;
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const isValidExt = allowedExtensions.test(ext);

  if (isValidExt) {
    cb(null, true);
  } else {
    cb(
      new Error(
        'Unsupported file format. Allowed formats: PDF, Images (PNG, JPG, SVG, GIF), Docs (DOC, DOCX, TXT), ZIP, JSON.'
      ),
      false
    );
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: (env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024, // Default 10MB
  },
  fileFilter,
});

module.exports = upload;
