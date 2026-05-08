import axios from 'axios';

const API_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const authService = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  }
});

authService.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
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
        
        localStorage.setItem('access_token', access);
        originalRequest.headers.Authorization = `Bearer ${access}`;
        return authService(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        window.location.href = '/auth'; 
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export default authService;
