import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE || '/api',
  headers: { 'Content-Type': 'application/json' },
});

export default api;
