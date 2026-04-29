const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function parseJSON(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(data.error || data.message || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

function buildHeaders(token, headers = {}) {
  const finalHeaders = { ...headers };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  return finalHeaders;
}

export async function fetchFileMetadata(token, password = '') {
  const url = new URL(`${API_BASE_URL}/file/${token}`);
  if (password) {
    url.searchParams.set('password', password);
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
  });

  return parseJSON(response);
}

export async function uploadFile(file, token, expiresInHours = 'never', password = '') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('expiresInHours', expiresInHours);
  if (password.trim()) {
    formData.append('password', password.trim());
  }

  const response = await fetch(`${API_BASE_URL}/upload`, {
    body: formData,
    headers: buildHeaders(token),
    method: 'POST',
  });

  return parseJSON(response);
}

export function getDownloadUrl(token) {
  return `${API_BASE_URL}/download/${token}`;
}

export async function downloadFile(token, password = '') {
  const url = new URL(`${API_BASE_URL}/download/${token}`);
  if (password) {
    url.searchParams.set('password', password);
  }

  const response = await fetch(url, {
    method: 'GET',
  });

  if (!response.ok) {
    return parseJSON(response).then(() => null);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get('Content-Disposition') || '';
  const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/i);

  return {
    blob,
    filename: filenameMatch?.[1] || 'download',
  };
}

export async function registerUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    body: JSON.stringify(payload),
    headers: buildHeaders('', { 'Content-Type': 'application/json' }),
    method: 'POST',
  });

  return parseJSON(response);
}

export async function loginUser(payload) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    body: JSON.stringify(payload),
    headers: buildHeaders('', { 'Content-Type': 'application/json' }),
    method: 'POST',
  });

  return parseJSON(response);
}

export async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/me`, {
    headers: buildHeaders(token, { Accept: 'application/json' }),
    method: 'GET',
  });

  return parseJSON(response);
}

export async function fetchMyFiles(token) {
  const response = await fetch(`${API_BASE_URL}/me/files`, {
    headers: buildHeaders(token, { Accept: 'application/json' }),
    method: 'GET',
  });

  return parseJSON(response);
}

export async function revokeMyFile(fileToken, token) {
  const response = await fetch(`${API_BASE_URL}/me/files/revoke/${fileToken}`, {
    headers: buildHeaders(token, { Accept: 'application/json' }),
    method: 'PATCH',
  });

  return parseJSON(response);
}

export async function deleteMyFile(fileToken, token) {
  const response = await fetch(`${API_BASE_URL}/me/files/${fileToken}`, {
    headers: buildHeaders(token, { Accept: 'application/json' }),
    method: 'DELETE',
  });

  return parseJSON(response);
}
