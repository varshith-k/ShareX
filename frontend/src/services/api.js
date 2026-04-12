const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function parseJSON(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

export async function fetchFileMetadata(token) {
  const response = await fetch(`${API_BASE_URL}/file/${token}`, {
    headers: {
      Accept: 'application/json',
    },
    method: 'GET',
  });

  return parseJSON(response);
}

export async function uploadFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE_URL}/upload`, {
    body: formData,
    method: 'POST',
  });

  return parseJSON(response);
}

export function getDownloadUrl(token) {
  return `${API_BASE_URL}/download/${token}`;
}
