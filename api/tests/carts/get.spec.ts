import { test, expect } from '@playwright/test';
import { CartsService } from '../../services/carts.service';
import { CartListSchema, CartSchema } from '../../schemas/cart.schema';
import { assertNullOrApiError, assertSchema } from '../../../helpers/api.assertions';

const carts = new CartsService();

test.describe('GET /carts', () => {

  test.describe('Positive', () => {
    test('returns all carts with correct count', async () => {
      const res = await carts.getAll();
      expect(res.status).toBe(200);
      expect(Array.isArray(res.data)).toBe(true);
      expect(res.data.length).toBeGreaterThan(0);
      assertSchema(CartListSchema, res.data);
    });

    test('returns single cart by id with valid schema', async () => {
      const res = await carts.getById(1);
      expect(res.status).toBe(200);
      assertSchema(CartSchema, res.data);
      expect(res.data.id).toBe(1);
    });

    test('cart products array contains productId and quantity', async () => {
      const res = await carts.getById(1);
      expect(res.data.products.length).toBeGreaterThan(0);
      res.data.products.forEach((p: { productId: unknown; quantity: unknown }) => {
        expect(p.productId).toBeDefined();
        expect(p.quantity).toBeDefined();
      });
    });
  });

  test.describe('Negative', () => {
    test('non-existent cart id returns null or 404', async () => {
      await assertNullOrApiError(() => carts.getById(99999));
    });
  });
});
