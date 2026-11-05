const path = require('node:path');

const storageDirectory = path.resolve(__dirname, '../../storage');

function resolveStoragePath(storagePath) {
  const resolvedPath = path.resolve(storagePath);
  const relativePath = path.relative(storageDirectory, resolvedPath);

  if (
    !relativePath
    || relativePath === '..'
    || relativePath.startsWith(`..${path.sep}`)
    || path.isAbsolute(relativePath)
  ) {
    throw new Error('Invalid document storage path.');
  }

  return resolvedPath;
}

module.exports = resolveStoragePath;
