const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function parseJSON(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

export { API_BASE_URL, parseJSON };