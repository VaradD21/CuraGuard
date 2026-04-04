export const BASE_URL = 'https://curaguard-backend.onrender.com';

export async function apiCall(endpoint: string, method: string = 'GET', body?: any, token?: string) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errData = await response.json();
      errorMsg = errData.detail || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}
