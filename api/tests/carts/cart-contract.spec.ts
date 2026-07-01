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
import { assertFieldTypes } from '@helpers/api.assertions';
import snapshot from './contract-snapshots/cart.snapshot.json';

const carts = new CartsService();

function assertCartMatchesSnapshot(cart: Record<string, unknown>, index?: number): void {
  const label = index === undefined ? 'cart' : `cart at index ${index}`;

  (snapshot.requiredFields as string[]).forEach((field) => {
    expect(cart, `Required field '${field}' is missing from ${label}`).toHaveProperty(field);
  });

  assertFieldTypes(cart, snapshot.cart as Record<string, string>);

  const products = cart.products as Record<string, unknown>[];
  products.forEach((item, i) => {
    (snapshot.productItemRequiredFields as string[]).forEach((field) => {
      expect(
        item,
        `Product item at index ${i} in ${label} is missing required field '${field}'`,
      ).toHaveProperty(field);
    });
    assertFieldTypes(item, snapshot['cart.products[*]'] as Record<string, string>);
  });
}

test.describe('Cart — Contract / Snapshot Tests', { tag: '@regression' }, () => {
  test('GET /carts/1 response shape conforms to committed cart snapshot', async () => {
    const res = await carts.getById(1);
    expect(res.status).toBe(200);
    assertCartMatchesSnapshot(res.data as Record<string, unknown>);
    expect(res.data.products.length).toBeGreaterThan(0);
  });

  test('Verify GET All Carts Response Matches Contract Schema', async () => {
    const res = await carts.getAll();
    expect(res.status).toBe(200);
    expect(Array.isArray(res.data)).toBe(true);
    expect(res.data.length).toBeGreaterThan(0);

    res.data.forEach((cart: Record<string, unknown>, index: number) => {
      assertCartMatchesSnapshot(cart, index);
    });
  });
});
