/**
 * Assignment 2 — Cart CRUD Test Suite
 * Covers: Positive write ops, Negative write cases, Schema Validation
 * GET scenarios live in get.spec.ts
 */

import { test, expect } from '@playwright/test';
import { CartsService } from '../../services/carts.service';
import { AuthService } from '../../services/auth.service';
import { CartSchema } from '../../schemas/cart.schema';
import { assertSchema, expectSuccessStatus } from '@helpers/api.assertions';
import { withAuthToken } from '@helpers/api-auth.util';
import { API_USERS } from '@config/constants';
import { buildCart } from '@helpers/data.helper';

const carts = new CartsService();
const auth = new AuthService();

test.describe('Cart CRUD — Positive Cases', { tag: '@regression' }, () => {
  test('POST /carts creates a cart and returns a new id', { tag: '@smoke' }, async () => {
    const res = await carts.create(buildCart({ products: [{ productId: 5, quantity: 2 }] }));
    expectSuccessStatus(res.status);
    expect(res.data.id).toBeDefined();
    expect(typeof res.data.id).toBe('number');
    assertSchema(CartSchema, res.data, 'created cart');
  });

  test('PUT /carts/:id fully replaces a cart and returns updated id', async () => {
    const payload = buildCart({
      userId: 3,
      date: '2024-06-15',
      products: [
        { productId: 2, quantity: 1 },
        { productId: 8, quantity: 3 },
      ],
    });
    const res = await carts.update(1, payload);
    expectSuccessStatus(res.status);
    expect(res.data.id).toBe(1);
  });

  test('PATCH /carts/:id partially updates a cart', async () => {
    const res = await carts.patch(1, { products: [{ productId: 10, quantity: 1 }] });
    expectSuccessStatus(res.status);
    expect(res.data.id).toBeDefined();
  });

  test('DELETE /carts/:id returns the deleted cart object', async () => {
    const res = await carts.delete(6);
    expectSuccessStatus(res.status);
    expect(res.data.id).toBe(6);

    const followUp = await carts.getById(6);
    expectSuccessStatus(followUp.status);
    expect(followUp.data.id).toBe(6);
  });
});

test.describe('Cart CRUD — Negative Cases', { tag: '@regression' }, () => {
  test('POST /carts with empty products array still returns an id (FakeStoreAPI simulates)', async () => {
    const res = await carts.create(buildCart({ products: [] }));
    expectSuccessStatus(res.status);
    expect(res.data.id).toBeDefined();
  });

  test('PUT /carts/:id for non-existent cart returns a simulated response', async () => {
    const res = await carts.update(99999, buildCart());
    expectSuccessStatus(res.status);
  });

  test('DELETE /carts/:id for non-existent cart returns a simulated response', async () => {
    const res = await carts.delete(99999);
    expectSuccessStatus(res.status);
  });

  test('PATCH /carts/:id with an empty body returns a response without crashing', async () => {
    const res = await carts.patch(1, {});
    expectSuccessStatus(res.status);
  });
});

test.describe('Cart CRUD — Partial Update Integrity', { tag: '@regression' }, () => {
  test('Verify PATCH Does Not Modify Unspecified Fields', async () => {
    const original = await carts.getById(1);
    const patchProducts = [{ productId: 3, quantity: 2 }];

    const patchRes = await carts.patch(1, { products: patchProducts });
    expectSuccessStatus(patchRes.status);
    expect(patchRes.data.products).toEqual(patchProducts);

    const updated = await carts.getById(1);
    expect(updated.data.userId).toBe(original.data.userId);
    expect(updated.data.date).toBe(original.data.date);
  });
});

test.describe('Cart CRUD — Authenticated Requests', { tag: '@regression' }, () => {
  test('Authenticated GET /carts request returns data with Bearer token', async () => {
    const loginRes = await auth.login(API_USERS.VALID.username, API_USERS.VALID.password);
    await withAuthToken(loginRes.data.token, async () => {
      const res = await carts.getAll();
      expectSuccessStatus(res.status);
      expect(Array.isArray(res.data)).toBe(true);
    });
  });
});

test.describe('Cart CRUD — Schema Validation', { tag: '@regression' }, () => {
  test('Cart products array items each have productId (number) and quantity (number)', async () => {
    const res = await carts.getById(1);
    expect(res.data.products.length).toBeGreaterThan(0);
    res.data.products.forEach((item: { productId: unknown; quantity: unknown }) => {
      expect(typeof item.productId).toBe('number');
      expect(typeof item.quantity).toBe('number');
      expect(item.productId).toBeGreaterThan(0);
      expect(item.quantity).toBeGreaterThan(0);
    });
  });

  test('Cart id and userId are positive integers', async () => {
    const res = await carts.getById(2);
    expect(Number.isInteger(res.data.id)).toBe(true);
    expect(res.data.id).toBeGreaterThan(0);
    expect(Number.isInteger(res.data.userId)).toBe(true);
    expect(res.data.userId).toBeGreaterThan(0);
  });

  test('Cart date field is a non-empty string', async () => {
    const res = await carts.getById(1);
    expect(typeof res.data.date).toBe('string');
    expect(res.data.date.length).toBeGreaterThan(0);
  });

  test('Verify Cart Dates Follow ISO-8601 Format', async () => {
    const res = await carts.getById(1);
    assertSchema(CartSchema, res.data, 'cart date ISO-8601');
  });
});
