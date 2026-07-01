import * as allure from 'allure-js-commons';
import { setAllureTags } from '@helpers/allure-tags.helper';
import { test, expect } from '@fixtures/ui.fixture';
import { AUTH_FILES, PRODUCTS } from '@config/constants';

test.use({ storageState: AUTH_FILES.PERFORMANCE_GLITCH_USER });

test.describe('Verify Cart Page Loads Successfully With Delays', { tag: '@regression' }, () => {
  test('Verify Cart Page Loads Successfully With Delays', async ({ poManager }) => {
    await allure.feature('Checkout');
    await setAllureTags('Medium', 'Medium');
    await allure.step('Add products to cart from inventory page', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      await inventory.expectPageTitleVisible();
      await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
      await inventory.addToCartByName(PRODUCTS.BIKE_LIGHT.name);
      expect(await inventory.getCartBadgeCount()).toBe(2);
    });

    await allure.step('Open cart page and verify selected products are displayed', async () => {
      await poManager.getInventoryPage().goToCart();
      const cart = poManager.getCartPage();
      await cart.expectTitleVisible();
      expect(await cart.getCartItemCount()).toBe(2);
      const names = await cart.getCartItemNames();
      expect(names).toContain(PRODUCTS.BACKPACK.name);
      expect(names).toContain(PRODUCTS.BIKE_LIGHT.name);
      await cart.expectCheckoutButtonVisible();
    });
  });
});
