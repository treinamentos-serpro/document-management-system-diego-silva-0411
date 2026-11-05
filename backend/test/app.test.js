const { test } = require('node:test');
const assert = require('node:assert');
const { once } = require('node:events');
const app = require('../src/app');
const documentsRepository = require('../src/repositories/documents.repository');

// Teste de fumaça do seed: garante que o app Express foi exportado.
// Novos testes serão adicionados durante os Steps 2, 6 e 7 com auxílio do Copilot.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('upload, listagem e download respeitam o dono do documento', async (t) => {
  const server = app.listen(0);
  await once(server, 'listening');

  let document;
  const owner = 'integration-user';
  const baseUrl = `http://127.0.0.1:${server.address().port}`;

  t.after(async () => {
    if (document) {
      const storedDocument = documentsRepository.findOwnedById(document.id, owner);
      if (storedDocument) {
        await documentsRepository.removeStoredFile(storedDocument.storagePath);
      }
    }
    await new Promise((resolve) => server.close(resolve));
  });

  const formData = new FormData();
  formData.append('file', new Blob(['conteudo de teste']), 'teste.txt');

  const uploadResponse = await fetch(`${baseUrl}/upload`, {
    method: 'POST',
    headers: { 'X-User-Id': owner },
    body: formData,
  });

  assert.strictEqual(uploadResponse.status, 201);
  document = await uploadResponse.json();
  assert.strictEqual(document.originalName, 'teste.txt');
  assert.strictEqual(document.size, Buffer.byteLength('conteudo de teste'));
  assert.strictEqual(Object.hasOwn(document, 'storagePath'), false);

  const ownerListResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': owner },
  });
  assert.deepStrictEqual(await ownerListResponse.json(), [document]);

  const otherUserListResponse = await fetch(`${baseUrl}/documents`, {
    headers: { 'X-User-Id': 'another-user' },
  });
  assert.deepStrictEqual(await otherUserListResponse.json(), []);

  const downloadResponse = await fetch(`${baseUrl}/documents/${document.id}/download`, {
    headers: { 'X-User-Id': owner },
  });
  assert.strictEqual(downloadResponse.status, 200);
  assert.strictEqual(await downloadResponse.text(), 'conteudo de teste');

  const unauthorizedDownloadResponse = await fetch(
    `${baseUrl}/documents/${document.id}/download`,
    { headers: { 'X-User-Id': 'another-user' } },
  );
  assert.strictEqual(unauthorizedDownloadResponse.status, 404);
});
