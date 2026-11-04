const API_BASE = '/api';
const USER_ID_STORAGE_KEY = 'dms-user-id';

function getUserId() {
  let userId = window.localStorage.getItem(USER_ID_STORAGE_KEY);

  if (!userId) {
    userId = window.crypto.randomUUID();
    window.localStorage.setItem(USER_ID_STORAGE_KEY, userId);
  }

  return userId;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers);
  headers.set('X-User-Id', getUserId());

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new Error(body?.error?.message || 'Não foi possível concluir a solicitação.');
  }

  return response;
}

export async function listDocuments() {
  const response = await request('/documents');
  return response.json();
}

export async function uploadDocument(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await request('/upload', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

export async function downloadDocument(document) {
  const response = await request(`/documents/${encodeURIComponent(document.id)}/download`);
  const objectUrl = URL.createObjectURL(await response.blob());
  const link = window.document.createElement('a');

  link.href = objectUrl;
  link.download = document.originalName;
  window.document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}