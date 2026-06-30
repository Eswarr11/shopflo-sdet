import { test } from '@playwright/test';
import { CartsService } from '../../services/carts.service';
import { assertApiErrorStatus } from '../../../helpers/api.assertions';
import { buildCart } from '../../../helpers/data.helper';
import { markKnownDefect } from '../../../helpers/known-defects.helper';

const carts = new CartsService();

test.describe('Cart — POST Validation', { tag: ['@regression', '@known-defect'] }, () => {
  test('Verify POST With Invalid ProductId Returns Validation Error', async () => {
    await markKnownDefect('FAKESTOREAPI_INVALID_PRODUCT');
    const payload = buildCart({ products: [{ productId: 99999, quantity: 1 }] });
    await assertApiErrorStatus(() => carts.create(payload), 400);
  });

  test('Verify POST With Negative Quantity Returns Validation Error', async () => {
    await markKnownDefect('FAKESTOREAPI_NEGATIVE_QTY');
    const payload = buildCart({ products: [{ productId: 1, quantity: -1 }] });
    await assertApiErrorStatus(() => carts.create(payload), 400);
  });

  test('Verify POST Without Products Field Returns Validation Error', async () => {
    await markKnownDefect('FAKESTOREAPI_MISSING_PRODUCTS');
    const payload = {
      userId: 1,
      date: new Date().toISOString().split('T')[0],
    };
    await assertApiErrorStatus(() => carts.create(payload), 400);
  });
});
