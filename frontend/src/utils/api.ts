const API_BASE_URL = import.meta.env.VITE_API_URL || '';

/**
 * Helper to fetch from API with base URL and Auth Token
 */
export const apiFetch = (path: string, options: RequestInit = {}) => {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`;
  const token = localStorage.getItem('token');
  
  const headers = {
    ...options.headers,
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };

  return fetch(url, { ...options, headers });
};

/**
 * Returns full API URL for a given path
 */
export const getApiUrl = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE_URL}${path}`;
};
