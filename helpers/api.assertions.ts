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

export async function assertApiErrorStatus(
  action: () => Promise<unknown>,
  expectedStatus: number,
): Promise<void> {
  let apiError: AxiosError | undefined;

  try {
    await action();
  } catch (err) {
    apiError = err as AxiosError;
  }

  expect(apiError?.response?.status, `Expected API error with status ${expectedStatus}`).toBe(
    expectedStatus,
  );
}

type ShapeMap = Record<string, string>;

export function assertFieldTypes(obj: Record<string, unknown>, shapeMap: ShapeMap): void {
  for (const [field, expectedType] of Object.entries(shapeMap)) {
    if (expectedType === 'array') {
      expect(Array.isArray(obj[field]), `Field '${field}' should be an array`).toBe(true);
    } else {
      expect(
        typeof obj[field],
        `Field '${field}' should be type '${expectedType}', got '${typeof obj[field]}'`,
      ).toBe(expectedType);
    }
  }
}
