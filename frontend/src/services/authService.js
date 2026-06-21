import axios from 'axios';

// Resolve backend API URL dynamically to avoid issues with missing environment variables in Vercel preview/production builds.
const getApiUrl = () => {
  if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;
  if (import.meta.env.VITE_API_BASE_URL) return import.meta.env.VITE_API_BASE_URL;

  // Fallback to production URL if running in Vercel (not localhost / 127.0.0.1)
  if (
    typeof window !== 'undefined' &&
    window.location.hostname &&
    !window.location.hostname.includes('localhost') &&
    !window.location.hostname.includes('127.0.0.1')
  ) {
    return 'https://library-management-system-9rm2.onrender.com';
  }

  return 'http://127.0.0.1:8000';
};

const API_URL = getApiUrl();

const authService = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  timeout: 60000, // 60 seconds timeout (allows Render free tier cold-start to wake up)
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
