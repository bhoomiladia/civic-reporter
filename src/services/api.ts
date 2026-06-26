import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Create Axios Client
export const api = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Setup tokens variables
let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshSubscribers: ((token: string) => void)[] = [];
let isRefreshing = false;

// Helpers to set tokens
export const setTokens = (access: string | null, refresh: string | null) => {
  accessToken = access;
  refreshToken = refresh;
  if (typeof window !== 'undefined') {
    if (access) localStorage.setItem('cr_access_token', access);
    else localStorage.removeItem('cr_access_token');

    if (refresh) localStorage.setItem('cr_refresh_token', refresh);
    else localStorage.removeItem('cr_refresh_token');
  }
};

// Initial load from localStorage
if (typeof window !== 'undefined') {
  accessToken = localStorage.getItem('cr_access_token');
  refreshToken = localStorage.getItem('cr_refresh_token');
}

// Request Interceptor to Inject JWT
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor for Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    
    // Check if error is 401 Unauthorized and not already retried
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/refresh') || originalRequest.url?.includes('/auth/login')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve) => {
          refreshSubscribers.push((token: string) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const tokenToRefresh = refreshToken || (typeof window !== 'undefined' ? localStorage.getItem('cr_refresh_token') : null);
        if (!tokenToRefresh) {
          throw new Error('No refresh token');
        }

        const response = await axios.post('/api/auth/refresh', { refreshToken: tokenToRefresh });
        const { accessToken: newAccess, refreshToken: newRefresh } = response.data.data;

        setTokens(newAccess, newRefresh);
        
        isRefreshing = false;
        onRefreshed(newAccess);
        refreshSubscribers = [];

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        setTokens(null, null);
        
        // Dispatch event or redirect to login
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth_logout'));
        }
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

function onRefreshed(token: string) {
  refreshSubscribers.map((cb) => cb(token));
}
