const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

async function parseJSON(response) {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

function getAuthHeaders(token) {
  return {
    Accept: 'application/json',
    Authorization: `Bearer ${token}`,
  };
}

async function registerUser(userData) {
  const response = await fetch(`${API_BASE_URL}/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(userData),
  });

  return parseJSON(response);
}

async function loginUser(credentials) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  return parseJSON(response);
}

async function getCurrentUser(token) {
  const response = await fetch(`${API_BASE_URL}/me`, {
    method: 'GET',
    headers: getAuthHeaders(token),
  });

  return parseJSON(response);
}

export {
  API_BASE_URL,
  parseJSON,
  getAuthHeaders,
  registerUser,
  loginUser,
  getCurrentUser,
};