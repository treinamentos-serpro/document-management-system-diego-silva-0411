const crypto = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');

async function createDocument(file, owner) {
  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storageName: file.filename,
    storagePath: file.path,
  };

  try {
    return documentsRepository.create(document);
  } catch (error) {
    try {
      await documentsRepository.removeStoredFile(file.path);
    } catch (cleanupError) {
      error.cleanupError = cleanupError;
    }
    throw error;
  }
}

function listDocuments(owner) {
  return documentsRepository.findAllByOwner(owner);
}

function findOwnedDocument(id, owner) {
  return documentsRepository.findOwnedById(id, owner);
}

module.exports = {
  createDocument,
  listDocuments,
  findOwnedDocument,
};