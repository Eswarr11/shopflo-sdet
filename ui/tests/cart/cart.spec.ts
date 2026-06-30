import { allure } from 'allure-playwright';
import { test, expect } from '../../../fixtures/ui.fixture';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';
import { addProductsToCart } from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Cart operations', () => {
  test.beforeEach(async () => {
    await allure.feature('Cart');
  });

  test('added products appear in cart', { tag: '@smoke' }, async ({ poManager }) => {
    await allure.story('Cart Items');
    await allure.step('Add two products and open cart', async () => {
      await addProductsToCart(poManager, [PRODUCTS.BACKPACK.name, PRODUCTS.BIKE_LIGHT.name]);
      expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(2);
      await poManager.getInventoryPage().goToCart();
    });
    await allure.step('Verify both products appear in cart', async () => {
      const cart = poManager.getCartPage();
      expect(await cart.isTitleVisible()).toBe(true);
      expect(await cart.getCartItemCount()).toBe(2);
      const names = await cart.getCartItemNames();
      expect(names).toContain(PRODUCTS.BACKPACK.name);
      expect(names).toContain(PRODUCTS.BIKE_LIGHT.name);
    });
  });

  test('removing item from cart updates count', async ({ poManager }) => {
    await allure.story('Remove Item');
    await allure.step('Add two products and remove one from cart', async () => {
      await addProductsToCart(poManager, [PRODUCTS.BACKPACK.name, PRODUCTS.BOLT_TSHIRT.name]);
      await poManager.getInventoryPage().goToCart();
      const cart = poManager.getCartPage();
      expect(await cart.getCartItemCount()).toBe(2);
      await cart.removeItem(PRODUCTS.BACKPACK.name);
      expect(await cart.getCartItemCount()).toBe(1);
      const remaining = await cart.getCartItemNames();
      expect(remaining).toContain(PRODUCTS.BOLT_TSHIRT.name);
      expect(remaining).not.toContain(PRODUCTS.BACKPACK.name);
    });
  });

  test('continue shopping returns to inventory with products visible', async ({ page, poManager }) => {
    await allure.story('Continue Shopping');
    await allure.step('Open cart and click continue shopping', async () => {
      await poManager.getInventoryPage().goto();
      await poManager.getInventoryPage().goToCart();
      const cart = poManager.getCartPage();
      expect(await cart.isTitleVisible()).toBe(true);
      await cart.continueShopping();
    });
    await allure.step('Verify inventory page is displayed with all products', async () => {
      await expect(page).toHaveURL(/inventory\.html/);
      const inventory = poManager.getInventoryPage();
      expect(await inventory.isPageTitleVisible()).toBe(true);
      expect(await inventory.getProductCount()).toBe(6);
    });
  });

  test('empty cart shows title and no items', async ({ poManager }) => {
    await allure.story('Empty Cart');
    await allure.step('Navigate to empty cart page', async () => {
      await poManager.getCartPage().goto();
    });
    await allure.step('Verify cart is empty with checkout button visible', async () => {
      const cart = poManager.getCartPage();
      expect(await cart.isTitleVisible()).toBe(true);
      expect(await cart.getCartItemCount()).toBe(0);
      expect(await cart.isCheckoutButtonVisible()).toBe(true);
    });
  });
});
