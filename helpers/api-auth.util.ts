import { setAuthToken } from './api.client';

export async function withAuthToken<T>(token: string, fn: () => Promise<T>): Promise<T> {
  setAuthToken(token);
  try {
    return await fn();
  } finally {
    setAuthToken(null);
  }
}

export async function withoutAuthToken<T>(fn: () => Promise<T>): Promise<T> {
  setAuthToken(null);
  try {
    return await fn();
  } finally {
    setAuthToken(null);
  }
}

export function clearAuthToken(): void {
  setAuthToken(null);
}
