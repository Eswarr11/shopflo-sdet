import { test } from '@playwright/test';
import { CartsService } from '../../services/carts.service';
import { assertApiErrorStatus } from '../../../helpers/api.assertions';
import { withoutAuthToken } from '../../../fixtures/api.fixture';
import { setAuthToken } from '../../../helpers/api.client';
import { markKnownDefect } from '../../../helpers/known-defects.helper';

const carts = new CartsService();

test.describe('Cart — Security', { tag: ['@regression', '@known-defect'] }, () => {
  test.beforeEach(async () => {
    await withoutAuthToken(async () => undefined);
  });

  test('Verify GET Carts Without Authorization Token Returns Unauthorized', async () => {
    await markKnownDefect('FAKESTOREAPI_NO_AUTH');
    await assertApiErrorStatus(() => carts.getAll(), 401);
  });

  test('Verify GET Carts With Invalid Token Returns Unauthorized', async () => {
    await markKnownDefect('FAKESTOREAPI_NO_AUTH');
    setAuthToken('invalid.jwt.token');
    try {
      await assertApiErrorStatus(() => carts.getAll(), 401);
    } finally {
      setAuthToken(null);
    }
  });
});
