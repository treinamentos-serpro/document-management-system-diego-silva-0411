const documentsService = require('../services/documents.service');

function sendNotFound(res) {
  return res.status(404).json({
    error: {
      code: 'DOCUMENT_NOT_FOUND',
      message: 'Documento não encontrado.',
    },
  });
}

function requireUser(req, res, next) {
  const userId = req.get('X-User-Id');

  if (!userId || !userId.trim()) {
    return res.status(400).json({
      error: {
        code: 'USER_ID_REQUIRED',
        message: 'O cabeçalho X-User-Id é obrigatório.',
      },
    });
  }

  req.userId = userId.trim();
  return next();
}

async function uploadDocument(req, res, next) {
  if (!req.file) {
    return res.status(400).json({
      error: {
        code: 'FILE_REQUIRED',
        message: 'Envie um arquivo no campo file.',
      },
    });
  }

  try {
    const document = await documentsService.createDocument(req.file, req.userId);
    return res.status(201).json(document);
  } catch (error) {
    return next(error);
  }
}

function listDocuments(req, res, next) {
  try {
    const documents = documentsService.listDocuments(req.userId);
    return res.status(200).json(documents);
  } catch (error) {
    return next(error);
  }
}

function downloadDocument(req, res, next) {
  const document = documentsService.findOwnedDocument(req.params.id, req.userId);

  if (!document) {
    return sendNotFound(res);
  }

  return res.download(document.storagePath, document.originalName, (error) => {
    if (!error) {
      return;
    }

    if (res.headersSent) {
      res.destroy(error);
      return;
    }

    if (error.code === 'ENOENT') {
      sendNotFound(res);
      return;
    }

    next(error);
  });
}

module.exports = {
  requireUser,
  uploadDocument,
  listDocuments,
  downloadDocument,
};