const BASE_URL = 'http://localhost:8000/api';

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('access_token');
  
  const headers = new Headers(options.headers || {});
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
    throw new Error('Unauthorized - Redirecting to Login');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    
    // Check for standard DRF error fields
    if (errorData.error) {
      throw new Error(errorData.error);
    } else if (errorData.detail) {
      throw new Error(errorData.detail);
    } else if (typeof errorData === 'object' && Object.keys(errorData).length > 0) {
      // It might be a DRF validation error like {"email": ["..."], "password": ["..."]}
      const firstKey = Object.keys(errorData)[0];
      const firstError = errorData[firstKey];
      const errorMsg = Array.isArray(firstError) ? firstError[0] : firstError;
      throw new Error(`${firstKey}: ${errorMsg}`);
    }
    
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}
