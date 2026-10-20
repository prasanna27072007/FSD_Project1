import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5003/api',
});

api.interceptors.request.use((config) => {
  try {
    const token = localStorage.getItem('hdss_token');
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // Ignore storage access issues in restricted browser contexts.
  }
  return config;
});
