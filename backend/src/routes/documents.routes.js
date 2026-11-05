const crypto = require('node:crypto');
const path = require('node:path');
const express = require('express');
const multer = require('multer');
const documentsController = require('../controllers/documents.controller');

const router = express.Router();
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
  documentsController.downloadDocument,
);

module.exports = router;
