const fs = require('node:fs/promises');

const documents = new Map();

function create(document) {
  documents.set(document.id, document);
  return document;
}

function findAllByOwner(owner) {
  return [...documents.values()]
    .filter((document) => document.owner === owner)
    .sort((left, right) => right.uploadedAt.localeCompare(left.uploadedAt));
}

function findOwnedById(id, owner) {
  const document = documents.get(id);

  if (!document || document.owner !== owner) {
    return null;
  }

  return document;
}

function deleteById(id) {
  return documents.delete(id);
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
  deleteById,
  removeStoredFile,
};
