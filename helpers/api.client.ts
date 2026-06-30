import axios, { AxiosInstance, AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import logger from './logger';

let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
}

const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.API_BASE_URL || 'https://fakestoreapi.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'User-Agent': 'automation-suite/1.0',
  },
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (authToken) config.headers.Authorization = `Bearer ${authToken}`;
  logger.info(`API Request: ${config.method?.toUpperCase()} ${config.baseURL ?? ''}${config.url}`);
  return config;
});

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    logger.info(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url;
    const data = JSON.stringify(error.response?.data);
    logger.error(`API Error: ${status} ${url} — ${data}`);
    return Promise.reject(error);
  }
);

export { apiClient };
