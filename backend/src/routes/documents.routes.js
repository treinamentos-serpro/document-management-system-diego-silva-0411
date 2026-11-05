const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');
const { rateLimit } = require('express-rate-limit');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();
const downloadRateLimit = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Limite de downloads atingido. Tente novamente mais tarde.',
    },
  },
});
const upload = multer({
  storage: multer.diskStorage({
    destination: path.resolve(__dirname, '../../storage'),
    filename: (req, file, callback) => callback(null, crypto.randomUUID()),
  }),
});

router.post(
  '/upload',
  documentsController.requireUser,
  upload.single('file'),
  documentsController.uploadDocument,
);
router.get('/documents', documentsController.requireUser, documentsController.listDocuments);
router.get(
  '/documents/:id/download',
  documentsController.requireUser,
  downloadRateLimit,
  documentsController.downloadDocument,
);

module.exports = router;
