import { test } from '@playwright/test';
import { CartsService } from '../../services/carts.service';
import { AuthService } from '../../services/auth.service';
import { assertApiErrorStatus } from '@helpers/api.assertions';
import { withoutAuthToken, withAuthToken } from '@helpers/api-auth.util';
import { markKnownDefect } from '@helpers/known-defects.helper';
import { API_USERS } from '@config/constants';
import { buildCart } from '@helpers/data.helper';

const carts = new CartsService();
const auth = new AuthService();

test.describe('Cart — Security', { tag: ['@regression', '@known-defect'] }, () => {
  test.describe('Authentication boundary', () => {
    test('Verify GET Carts Without Authorization Token Returns Unauthorized', async () => {
      await markKnownDefect('FAKESTOREAPI_NO_AUTH');

      await withoutAuthToken(async () => {
        await assertApiErrorStatus(() => carts.getAll(), 401);
      });
    });

    test('Verify GET Carts With Malformed Bearer Token Returns Unauthorized', async () => {
      await markKnownDefect('FAKESTOREAPI_NO_AUTH');
      console.log('Verify GET Carts With Malformed Bearer Token Returns Unauthorized');

      await withAuthToken('not.a.valid.jwt', async () => {
        await assertApiErrorStatus(() => carts.getAll(), 401);
      });
    });

    test('Verify GET Carts With Tampered JWT Payload Returns Unauthorized', async () => {
      await markKnownDefect('FAKESTOREAPI_NO_AUTH');

      const loginRes = await auth.login(API_USERS.VALID.username, API_USERS.VALID.password);
      const validToken = loginRes.data.token as string;
      const parts = validToken.split('.');
      const tamperedPayload = Buffer.from(
        JSON.stringify({ sub: 'attacker', role: 'admin' }),
      ).toString('base64url');
      const tamperedToken = `${parts[0]}.${tamperedPayload}.${parts[2] ?? 'invalid-signature'}`;

      await withAuthToken(tamperedToken, async () => {
        await assertApiErrorStatus(() => carts.getAll(), 401);
      });
    });

    test('Verify GET Carts With Empty Bearer Token Returns Unauthorized', async () => {
      await markKnownDefect('FAKESTOREAPI_NO_AUTH');

      await withAuthToken('', async () => {
        await assertApiErrorStatus(() => carts.getAll(), 401);
      });
    });
  });

  test.describe('IDOR — cross-cart access', () => {
    test('Verify Unauthenticated Client Cannot Read Cart By Id', async () => {
      await markKnownDefect('FAKESTOREAPI_IDOR_READ');

      await withoutAuthToken(async () => {
        await assertApiErrorStatus(() => carts.getById(1), 401);
        await assertApiErrorStatus(() => carts.getById(2), 401);
      });
    });

    test('Verify Authenticated Client Cannot Read Carts Belonging To Other Users', async () => {
      await markKnownDefect('FAKESTOREAPI_IDOR_CROSS_USER');

      const loginRes = await auth.login(API_USERS.VALID.username, API_USERS.VALID.password);

      await withAuthToken(loginRes.data.token as string, async () => {
        await assertApiErrorStatus(() => carts.getById(3), 403);
      });
    });

    test('Verify Unauthenticated Client Cannot Mutate Another Users Cart', async () => {
      await markKnownDefect('FAKESTOREAPI_IDOR_WRITE');

      await withoutAuthToken(async () => {
        await assertApiErrorStatus(
          () => carts.patch(2, { products: [{ productId: 1, quantity: 99 }] }),
          401,
        );
      });
    });
  });

  test.describe('Authorization boundary — write operations', () => {
    test('Verify Unauthenticated POST Carts Returns Unauthorized', async () => {
      await markKnownDefect('FAKESTOREAPI_WRITE_NO_AUTH');

      await withoutAuthToken(async () => {
        await assertApiErrorStatus(
          () => carts.create(buildCart({ products: [{ productId: 4, quantity: 1 }] })),
          401,
        );
      });
    });

    test('Verify Unauthenticated DELETE Carts Returns Unauthorized', async () => {
      await markKnownDefect('FAKESTOREAPI_WRITE_NO_AUTH');

      await withoutAuthToken(async () => {
        await assertApiErrorStatus(() => carts.delete(5), 401);
      });
    });

    test('Verify Invalid Token Blocks PUT Carts', async () => {
      await markKnownDefect('FAKESTOREAPI_NO_AUTH');

      await withAuthToken('invalid.jwt.token', async () => {
        await assertApiErrorStatus(() => carts.update(1, buildCart({ userId: 1 })), 401);
      });
    });
  });
});
