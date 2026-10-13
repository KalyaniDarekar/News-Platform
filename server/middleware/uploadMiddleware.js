// ========================================================================
// Multer Upload Middleware — Phase 3
// Handles multipart/form-data image uploads with:
//   - MIME type validation (images only)
//   - File size limit (from MAX_FILE_SIZE_MB env var, default 10 MB)
//   - Unique filename generation (timestamp + random suffix)
//   - Organised storage under server/uploads/images/YYYY/MM/
//   - Compatible with multer 2.x API
// ========================================================================

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- Allowed MIME types ----
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'image/avif'
]);

// ---- Max file size ----
const MAX_MB = parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10);
const MAX_BYTES = MAX_MB * 1024 * 1024;

// ---- Dynamic dated storage path ----
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const now = new Date();
    const yyyy = now.getUTCFullYear();
    const mm = String(now.getUTCMonth() + 1).padStart(2, '0');

    // Resolve upload path relative to server root, not middleware file
    const uploadRoot = process.env.UPLOAD_DIR
      ? path.resolve(process.env.UPLOAD_DIR)
      : path.join(__dirname, '..', 'uploads');

    const dest = path.join(uploadRoot, 'images', String(yyyy), mm);

    // Create directory tree if it doesn't exist (sync, only on upload)
    try {
      fs.mkdirSync(dest, { recursive: true });
    } catch (err) {
      return cb(err);
    }

    cb(null, dest);
  },

  filename: (req, file, cb) => {
    // Sanitize original name — strip non-ASCII, spaces, and special chars
    const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
    const base = path
      .basename(file.originalname, ext)
      .replace(/[^a-z0-9_-]/gi, '_')
      .toLowerCase()
      .slice(0, 60);

    const unique = `${base}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext}`;
    cb(null, unique);
  }
});

// ---- File filter ----
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new multer.MulterError('LIMIT_UNEXPECTED_FILE', file.fieldname);
    err.message = `File type '${file.mimetype}' is not allowed. Accepted: JPEG, PNG, GIF, WebP, SVG, AVIF.`;
    cb(err, false);
  }
};

// ---- Multer instance ----
export const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_BYTES,
    files: 1
  }
}).single('image'); // client must send field name = 'image'

// ---- Error-handling wrapper for use as Express middleware ----
// Converts multer errors to consistent JSON error responses
export const handleUpload = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const status = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
      const message =
        err.code === 'LIMIT_FILE_SIZE'
          ? `File exceeds the maximum allowed size of ${MAX_MB} MB`
          : err.message || 'File upload error';

      return res.status(status).json({
        success: false,
        error: { code: err.code, message }
      });
    }

    // Other errors (e.g. disk full, permission denied)
    next(err);
  });
};

export default { handleUpload, uploadSingle };
