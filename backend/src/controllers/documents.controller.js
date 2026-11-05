const documentsService = require('../services/documents.service');

function requireUser(req, res, next) {
  const owner = req.get('X-User-Id')?.trim();

  if (!owner) {
    return res.status(400).json({
      error: {
        code: 'USER_ID_REQUIRED',
        message: 'O identificador do usuário é obrigatório.',
      },
    });
  }

  req.userId = owner;
  return next();
}

async function uploadDocument(req, res) {
  if (!req.file) {
    return res.status(400).json({
      error: {
        code: 'FILE_REQUIRED',
        message: 'Um arquivo deve ser enviado.',
      },
    });
  }

  const document = await documentsService.createDocument(req.file, req.userId);
  return res.status(201).json(document);
}

function listDocuments(req, res) {
  return res.json(documentsService.listDocuments(req.userId));
}

function downloadDocument(req, res, next) {
  const document = documentsService.findOwnedDocument(req.params.id, req.userId);

  if (!document) {
    return res.status(404).json({
      error: {
        code: 'DOCUMENT_NOT_FOUND',
        message: 'O documento solicitado não foi encontrado.',
      },
    });
  }

  return res.download(document.storagePath, document.originalName, (error) => {
    if (error) {
      next(error);
    }
  });
}

module.exports = {
  requireUser,
  uploadDocument,
  listDocuments,
  downloadDocument,
};
