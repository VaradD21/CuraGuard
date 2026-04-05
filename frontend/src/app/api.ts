// Always use the Render backend URL directly — no local proxy needed
export const BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string) ||
  'https://curaguard-backend.onrender.com';

export async function apiCall(
  endpoint: string,
  method: string = 'GET',
  body?: any,
  token?: string
) {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr: any) {
    throw new Error(
      `Network error — cannot reach server. Check your connection. (${networkErr.message})`
    );
  }

  // Try to parse JSON body (may be empty on some error codes)
  let data: any = null;
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg =
      data?.detail ||
      data?.message ||
      `Server error (HTTP ${response.status})`;
    throw new Error(errorMsg);
  }

  return data;
}
