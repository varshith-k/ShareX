const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

function getFileHeaders(token) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function parseFileResponse(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Unable to fetch files');
  }

  return data;
}

async function getMyFiles(token) {
  const response = await fetch(`${API_BASE_URL}/me/files`, {
    method: 'GET',
    headers: getFileHeaders(token),
  });

  return parseFileResponse(response);
}

export { getMyFiles, getFileHeaders, parseFileResponse };