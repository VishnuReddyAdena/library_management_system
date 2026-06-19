import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const authService = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 10000, // 10 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  }
});

authService.interceptors.request.use(
  (config) => {
    // Use sessionStorage so each tab keeps its own session
    const token = sessionStorage.getItem('access_token') || localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

authService.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Prevent retry on login route to avoid loops if credentials fail
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url.includes('/api/auth/login/')) {
      originalRequest._retry = true;
      try {
        // Attempt to refresh the token using the http-only cookie
        const response = await axios.post(`${API_URL}/api/auth/refresh/`, {}, { withCredentials: true });
        const { access } = response.data;

        sessionStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return authService(originalRequest);
      } catch (refreshError) {
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user_data');
        window.location.href = '/auth';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default authService;
