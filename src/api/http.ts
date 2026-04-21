const DEFAULT_API_BASE_URL = 'http://localhost:3000';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || DEFAULT_API_BASE_URL;

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
