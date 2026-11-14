import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
});

// Attach the token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('parkhex_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// If the token is invalid or expired, log the user out
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isLoginCall = err.config?.url?.includes('/auth/login');
    if (err.response?.status === 401 && !isLoginCall) {
      localStorage.removeItem('parkhex_token');
      localStorage.removeItem('parkhex_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const getError = (err) =>
  err.response?.data?.message || err.message || 'Something went wrong';

export default api;
