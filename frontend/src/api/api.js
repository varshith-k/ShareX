const BASE_URL = 'http://localhost:8080';

async function request(endpoint, options = {}) {
  const response = await fetch(`${BASE_URL}${endpoint}`, options);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'Something went wrong');
  }

  return response.json();
}

export const api = {
  get: (endpoint) =>
    request(endpoint, {
      method: 'GET',
    }),

  post: (endpoint, body, isFormData = false) =>
    request(endpoint, {
      method: 'POST',
      headers: isFormData ? undefined : { 'Content-Type': 'application/json' },
      body: isFormData ? body : JSON.stringify(body),
    }),
};
