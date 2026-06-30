import { test, expect } from '@playwright/test';
import { CartsService } from '../../services/carts.service';
import { CommonUtils } from '../../../helpers/common-utils';
import { buildCart } from '../../../helpers/data.helper';
import { expectSuccessStatus } from '../../../helpers/api.assertions';

interface ProductTestCase {
  productId: number;
  quantity: number;
  description: string;
}

const carts = new CartsService();

const productTestData: ProductTestCase[] = [
  { productId: 1, quantity: 1, description: 'electronics – Fjallraven backpack' },
  { productId: 5, quantity: 2, description: "men's clothing – John Hardy bracelet" },
  { productId: 8, quantity: 1, description: "women's clothing – Pierced Owl ring" },
  { productId: 12, quantity: 3, description: 'jewelery – White Gold Diamond Ring' },
  { productId: 20, quantity: 1, description: 'electronics – SanDisk SSD' },
];

test.describe(
  'Cart — Data-driven: create cart for multiple product IDs',
  { tag: '@regression' },
  () => {
    for (const { productId, quantity, description } of productTestData) {
      test(`POST /carts with productId=${productId} (${description}) returns a valid cart id`, async () => {
        const payload = buildCart({
          date: CommonUtils.generateDateFromToday(),
          products: [{ productId, quantity }],
        });

        const res = await carts.create(payload);

        expectSuccessStatus(res.status);
        expect(res.data.id).toBeDefined();
        expect(typeof res.data.id).toBe('number');
        expect(res.data.id).toBeGreaterThan(0);
      });
    }
  },
);
