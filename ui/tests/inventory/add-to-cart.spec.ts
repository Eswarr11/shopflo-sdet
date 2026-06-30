import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Inventory — Add / Remove from Cart', { tag: '@regression' }, () => {
  test.beforeEach(async ({ poManager }) => {
    await allure.feature('Inventory');
    await allure.story('Add to Cart');
    await poManager.getInventoryPage().goto();
  });

  test.describe('Positive', () => {
    test('Verify Cart Badge Starts at Zero', async ({ poManager }) => {
      await setAllureTags('Medium', 'Medium');
      await allure.step('Verify cart badge count is zero', async () => {
        expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(0);
      });
    });

    test(
      'Verify Adding One Product Updates Cart Badge',
      { tag: '@smoke' },
      async ({ poManager }) => {
        await setAllureTags('Critical', 'Critical');
        await allure.step('Add backpack to cart and verify badge shows 1', async () => {
          const inventory = poManager.getInventoryPage();
          await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
          expect(await inventory.getCartBadgeCount()).toBe(1);
        });
      },
    );

    test('Verify Adding Three Products Updates Cart Badge', async ({ poManager }) => {
      await setAllureTags('High', 'Medium');
      await allure.step('Add three products and verify badge shows 3', async () => {
        const inventory = poManager.getInventoryPage();
        await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
        await inventory.addToCartByName(PRODUCTS.BIKE_LIGHT.name);
        await inventory.addToCartByName(PRODUCTS.ONESIE.name);
        expect(await inventory.getCartBadgeCount()).toBe(3);
      });
    });

    test('Verify Removing Product Decrements Cart Badge', async ({ poManager }) => {
      await setAllureTags('High', 'Medium');
      await allure.step('Add two products, remove one, verify badge shows 1', async () => {
        const inventory = poManager.getInventoryPage();
        await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
        await inventory.addToCartByName(PRODUCTS.BIKE_LIGHT.name);
        await inventory.removeFromCartByName(PRODUCTS.BACKPACK.name);
        expect(await inventory.getCartBadgeCount()).toBe(1);
      });
    });
  });

  test.describe('Negative', () => {
    test('Verify Cart Badge Hidden When Cart Empty', async ({ poManager }) => {
      await setAllureTags('Medium', 'Low');
      await allure.step('Verify cart badge is not visible when cart is empty', async () => {
        expect(await poManager.getInventoryPage().isCartBadgeVisible()).toBe(false);
      });
    });
  });
});
