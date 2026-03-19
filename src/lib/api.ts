import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30_000, // 30 seconds
});

// Response interceptor: handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      // Redirect to login page on unauthorized
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

export default api;
