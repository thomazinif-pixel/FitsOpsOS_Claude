import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor — inject token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('fits_ops_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      localStorage.removeItem('fits_ops_token');
      localStorage.removeItem('fits_ops_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

export default apiClient;
