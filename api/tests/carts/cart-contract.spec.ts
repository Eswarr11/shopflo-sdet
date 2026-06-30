/**
 * Assignment 2 — Senior Bonus: Contract / Snapshot Test
 *
 * Approach:
 *   1. A known-good response shape is committed to contract-snapshots/cart.snapshot.json
 *   2. These tests fetch fresh responses from the API and assert that the response structure
 *      (field names + types) still conforms to the committed snapshot.
 *   3. Any breaking change in the API (renamed field, type change, removed key) will fail
 *      these tests. The fix is intentional: update the snapshot file via a PR so the diff
 *      is visible and reviewable before merge.
 *
 * This pattern is sometimes called "consumer-driven contract testing" in lightweight form.
 */

import { test, expect } from '@playwright/test';
import { CartsService } from '../../services/carts.service';
import snapshot from './contract-snapshots/cart.snapshot.json';

type ShapeMap = Record<string, string>;

const carts = new CartsService();

function assertFieldTypes(obj: Record<string, unknown>, shapeMap: ShapeMap): void {
  for (const [field, expectedType] of Object.entries(shapeMap)) {
    if (expectedType === 'array') {
      expect(Array.isArray(obj[field]), `Field '${field}' should be an array`).toBe(true);
    } else {
      expect(
        typeof obj[field],
        `Field '${field}' should be type '${expectedType}', got '${typeof obj[field]}'`
      ).toBe(expectedType);
    }
  }
}

test.describe('Cart — Contract / Snapshot Tests', () => {
  test('GET /carts/1 response shape conforms to committed cart snapshot', async () => {
    const res = await carts.getById(1);
    expect(res.status).toBe(200);

    const cart = res.data;

    // Assert all required top-level fields are present
    (snapshot.requiredFields as string[]).forEach((field) => {
      expect(cart, `Required field '${field}' is missing from response`).toHaveProperty(field);
    });

    // Assert field types match the snapshot
    assertFieldTypes(cart as Record<string, unknown>, snapshot.cart as ShapeMap);
    expect(cart.products.length).toBeGreaterThan(0);
    cart.products.forEach((item: Record<string, unknown>, i: number) => {
      (snapshot.productItemRequiredFields as string[]).forEach((field) => {
        expect(
          item,
          `Product item at index ${i} is missing required field '${field}'`
        ).toHaveProperty(field);
      });

      assertFieldTypes(item, snapshot['cart.products[*]'] as ShapeMap);
    });
  });
});
