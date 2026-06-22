import axios, { AxiosInstance } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  withCredentials: true, // Necessary for httpOnly cookies
  timeout: 30000,
});

// Request interceptor: attach bearer token from Zustand store
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: silent refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Refresh token is in httpOnly cookie, just call the endpoint
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newAccessToken = data.data.accessToken;
        
        // Update Zustand store
        useAuthStore.getState().setAccessToken(newAccessToken);
        
        // Update current request
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        api.defaults.headers.Authorization = `Bearer ${newAccessToken}`;

        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default api;
