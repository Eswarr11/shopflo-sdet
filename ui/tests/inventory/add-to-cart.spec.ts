import * as allure from 'allure-js-commons';
import { test, expect } from '../../../fixtures/ui.fixture';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Inventory — Add / Remove from Cart', () => {
  test.beforeEach(async ({ poManager }) => {
    await allure.feature('Inventory');
    await allure.story('Add to Cart');
    await poManager.getInventoryPage().goto();
  });

  test.describe('Positive', () => {
    test('cart badge starts at 0 before any item is added', async ({ poManager }) => {
      await allure.step('Verify cart badge count is zero', async () => {
        expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(0);
      });
    });

    test('adding one product increments badge to 1', { tag: '@smoke' }, async ({ poManager }) => {
      await allure.severity('critical');
      await allure.step('Add backpack to cart and verify badge shows 1', async () => {
        const inventory = poManager.getInventoryPage();
        await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
        expect(await inventory.getCartBadgeCount()).toBe(1);
      });
    });

    test('adding three products shows badge count 3', async ({ poManager }) => {
      await allure.step('Add three products and verify badge shows 3', async () => {
        const inventory = poManager.getInventoryPage();
        await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
        await inventory.addToCartByName(PRODUCTS.BIKE_LIGHT.name);
        await inventory.addToCartByName(PRODUCTS.ONESIE.name);
        expect(await inventory.getCartBadgeCount()).toBe(3);
      });
    });

    test('removing a product decrements badge count', async ({ poManager }) => {
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
    test('cart badge is absent (not rendered) when zero items in cart', async ({ poManager }) => {
      await allure.step('Verify cart badge is not visible when cart is empty', async () => {
        expect(await poManager.getInventoryPage().isCartBadgeVisible()).toBe(false);
      });
    });
  });
});
