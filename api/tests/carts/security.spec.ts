import { test, expect } from '@playwright/test';
import { CartsService } from '../../services/carts.service';
import { AuthService } from '../../services/auth.service';
import {
  assertApiErrorStatus,
  expectSuccessStatus,
} from '@helpers/api.assertions';
import { withoutAuthToken, withAuthToken } from '@helpers/api-auth.util';
import { annotateKnownDefect } from '@helpers/known-defects.helper';
import { API_USERS } from '@config/constants';
import { buildCart } from '@helpers/data.helper';

const carts = new CartsService();
const auth = new AuthService();

test.describe('Cart — Security', { tag: '@regression' }, () => {
  test.describe('Authentication boundary', () => {
    test('GET /carts without token returns data (no auth enforced)', async () => {
      await annotateKnownDefect('FAKESTOREAPI_NO_AUTH');

      await withoutAuthToken(async () => {
        const res = await carts.getAll();
        expectSuccessStatus(res.status);
        expect(Array.isArray(res.data)).toBe(true);
        expect(res.data.length).toBeGreaterThan(0);
      });
    });

    test('GET /carts with malformed Bearer token still returns data', async () => {
      await annotateKnownDefect('FAKESTOREAPI_NO_AUTH');

      await withAuthToken('not.a.valid.jwt', async () => {
        const res = await carts.getAll();
        expectSuccessStatus(res.status);
        expect(Array.isArray(res.data)).toBe(true);
      });
    });

    test('GET /carts with tampered JWT payload still returns data', async () => {
      await annotateKnownDefect('FAKESTOREAPI_NO_AUTH');

      const loginRes = await auth.login(API_USERS.VALID.username, API_USERS.VALID.password);
      const validToken = loginRes.data.token as string;
      const parts = validToken.split('.');
      const tamperedPayload = Buffer.from(
        JSON.stringify({ sub: 'attacker', role: 'admin' }),
      ).toString('base64url');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2] ?? 'invalid-signature'}`;

      await withAuthToken(tamperedToken, async () => {
        const res = await carts.getAll();
        expectSuccessStatus(res.status);
        expect(Array.isArray(res.data)).toBe(true);
      });
    });

    test('GET /carts with empty Bearer token still returns data', async () => {
      await annotateKnownDefect('FAKESTOREAPI_NO_AUTH');

      await withAuthToken('', async () => {
        const res = await carts.getAll();
        expectSuccessStatus(res.status);
      });
    });
  });

  test.describe('IDOR — cross-cart access', () => {
    test('unauthenticated client can read any cart by id', async () => {
      await withoutAuthToken(async () => {
        const cartOne = await carts.getById(1);
        const cartTwo = await carts.getById(2);

        expectSuccessStatus(cartOne.status);
        expectSuccessStatus(cartTwo.status);
        expect(cartOne.data.id).toBe(1);
        expect(cartTwo.data.id).toBe(2);
        expect(cartOne.data.userId).toBeDefined();
        expect(cartTwo.data.userId).toBeDefined();
      });
    });

    test('authenticated client can read carts belonging to other users', async () => {
      const loginRes = await auth.login(API_USERS.VALID.username, API_USERS.VALID.password);

      await withAuthToken(loginRes.data.token as string, async () => {
        const foreignCart = await carts.getById(3);
        expectSuccessStatus(foreignCart.status);
        expect(foreignCart.data.id).toBe(3);
        expect(typeof foreignCart.data.userId).toBe('number');
      });
    });

    test('unauthenticated client can mutate another users cart', async () => {
      await withoutAuthToken(async () => {
        const patchRes = await carts.patch(2, { products: [{ productId: 1, quantity: 99 }] });
        expectSuccessStatus(patchRes.status);
        expect(patchRes.data.id).toBe(2);
        expect(patchRes.data.products).toEqual([{ productId: 1, quantity: 99 }]);
      });
    });
  });

  test.describe('Authorization boundary — write operations', () => {
    test('unauthenticated POST /carts creates a cart', async () => {
      await withoutAuthToken(async () => {
        const res = await carts.create(buildCart({ products: [{ productId: 4, quantity: 1 }] }));
        expectSuccessStatus(res.status);
        expect(res.data.id).toBeDefined();
      });
    });

    test('unauthenticated DELETE /carts/:id returns success', async () => {
      await withoutAuthToken(async () => {
        const res = await carts.delete(5);
        expectSuccessStatus(res.status);
        expect(res.data.id).toBe(5);
      });
    });

    test('invalid token does not block PUT /carts/:id', async () => {
      await withAuthToken('invalid.jwt.token', async () => {
        const res = await carts.update(1, buildCart({ userId: 1 }));
        expectSuccessStatus(res.status);
        expect(res.data.id).toBe(1);
      });
    });
  });

  test.describe('Strict security expectations (document gaps)', () => {
    test.fixme('GET /carts without token should return 401 when auth is enforced', async () => {
      await annotateKnownDefect('FAKESTOREAPI_NO_AUTH');

      await withoutAuthToken(async () => {
        await assertApiErrorStatus(() => carts.getAll(), 401);
      });
    });
  });
});
