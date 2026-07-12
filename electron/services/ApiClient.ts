import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { getSetting, setSetting } from './DatabaseService';

// Fallback to import.meta.env if process is not fully injected with dotenv, 
// but we expect process.env to be populated by dotenv in main.ts
const envUrl = process.env.API_BASE_URL || 'http://localhost:8080';
const envTimeout = process.env.API_TIMEOUT ? parseInt(process.env.API_TIMEOUT, 10) : 30000;

let apiClientInstance: AxiosInstance | null = null;

export function getApiClient(): AxiosInstance {
  if (apiClientInstance) {
    return apiClientInstance;
  }

  console.log(`[ApiClient] Initializing Axios Client targeting: ${envUrl}`);

  apiClientInstance = axios.create({
    baseURL: envUrl,
    timeout: envTimeout,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to attach JWT token
  apiClientInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      const token = getSetting('jwt_token');
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 unauthorized
  apiClientInstance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        console.warn('[ApiClient] 401 Unauthorized detected. Clearing session.');
        // Clear JWT and related cached profiles in DB
        setSetting('jwt_token', '');
        setSetting('is_logged_in', 'false');
        setSetting('user_profile', '');
        
        // Let Renderer know if possible (could send an IPC event or let standard request fail so UI redirects)
      }
      return Promise.reject(error);
    }
  );

  return apiClientInstance;
}
