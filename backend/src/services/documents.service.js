const crypto = require('node:crypto');
const documentsRepository = require('../repositories/documents.repository');

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

async function createDocument(file, owner) {
  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner,
    storagePath: file.path,
  };

  try {
    documentsRepository.create(document);
    return toPublicDocument(document);
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
  return documentsRepository.findAllByOwner(owner).map(toPublicDocument);
}

function findOwnedDocument(id, owner) {
  const document = documentsRepository.findOwnedById(id, owner);

  if (!document) {
    return null;
  }

  return {
    originalName: document.originalName,
    storagePath: document.storagePath,
  };
}

module.exports = {
  createDocument,
  listDocuments,
  findOwnedDocument,
};