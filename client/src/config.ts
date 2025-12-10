const apiHost = import.meta.env.VITE_API_HOST;
export const API_BASE_URL = apiHost ? `https://${apiHost}/api/v1` : (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1');
