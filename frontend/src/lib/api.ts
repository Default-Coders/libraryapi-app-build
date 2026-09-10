import { clearAuthData } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const ASSET_URL = API_URL.replace(/\/api\/?$/, '');

export function assetUrl(path?: string | null) {
  if (!path) return null;
  return /^https?:\/\//.test(path) ? path : `${ASSET_URL}${path}`;
}

export async function apiFetch<T = unknown>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers: HeadersInit = {
    ...(!(options.body instanceof FormData) && { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401 || response.status === 403) {
    clearAuthData();
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const errorMessage = errorData.message ?? errorData.mensagem;
    const message = Array.isArray(errorMessage)
      ? errorMessage.join(', ')
      : errorMessage || errorData.error || errorData.erro || 'Erro ao realizar requisição';
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
}
