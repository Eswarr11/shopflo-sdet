import { test } from '@playwright/test';
import { CartsService } from '../../services/carts.service';
import { assertApiErrorStatus } from '../../../helpers/api.assertions';
import { withoutAuthToken } from '../../../fixtures/api.fixture';
import { setAuthToken } from '../../../helpers/api.client';

const carts = new CartsService();

test.describe('Cart — Security', { tag: '@regression' }, () => {
  test.beforeEach(async () => {
    await withoutAuthToken(async () => undefined);
  });

  test('Verify GET Carts Without Authorization Token Returns Unauthorized', async () => {
    await assertApiErrorStatus(() => carts.getAll(), 401);
  });

  test('Verify GET Carts With Invalid Token Returns Unauthorized', async () => {
    setAuthToken('invalid.jwt.token');
    try {
      await assertApiErrorStatus(() => carts.getAll(), 401);
    } finally {
      setAuthToken(null);
    }
  });
});
