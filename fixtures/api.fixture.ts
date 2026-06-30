import { setAuthToken } from '../helpers/api.client';

export async function withAuthToken<T>(
  token: string,
  fn: () => Promise<T>,
): Promise<T> {
  setAuthToken(token);
  try {
    return await fn();
  } finally {
    setAuthToken(null);
  }
}
