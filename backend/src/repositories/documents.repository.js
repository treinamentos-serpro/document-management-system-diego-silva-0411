const fs = require('node:fs/promises');

const documents = new Map();

function toPublicDocument(document) {
  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  };
}

function create(document) {
  documents.set(document.id, document);
  return toPublicDocument(document);
}

function findAllByOwner(owner) {
  return [...documents.values()]
    .filter((document) => document.owner === owner)
    .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt))
    .map(toPublicDocument);
}

function findOwnedById(id, owner) {
  const document = documents.get(id);

  if (!document || document.owner !== owner) {
    return null;
  }

  return {
    ...toPublicDocument(document),
    storagePath: document.storagePath,
  };
}

async function removeStoredFile(storagePath) {
  try {
    await fs.unlink(storagePath);
  } catch (error) {
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

module.exports = {
  create,
  findAllByOwner,
  findOwnedById,
  removeStoredFile,
};