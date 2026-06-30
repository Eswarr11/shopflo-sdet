import { expect } from '@playwright/test';
import { AxiosError } from 'axios';
import { z } from 'zod';

export function assertSchema<T extends z.ZodType>(
  schema: T,
  data: unknown,
  label = 'response',
): asserts data is z.infer<T> {
  const result = schema.safeParse(data);
  expect(result.success, `${label} schema errors: ${JSON.stringify(result.error)}`).toBe(true);
}

export function expectSuccessStatus(status: number, allowed: readonly number[] = [200, 201]): void {
  expect(allowed).toContain(status);
}

export async function assertNullOrApiError(
  action: () => Promise<{ data: unknown }>,
  expectedStatus = 404,
): Promise<void> {
  try {
    const res = await action();
    expect(res.data).toBeNull();
  } catch (err) {
    expect((err as AxiosError).response?.status).toBe(expectedStatus);
  }
}
