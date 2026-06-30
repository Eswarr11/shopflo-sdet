import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';
import { addProductsToCart } from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Cart operations', { tag: '@regression' }, () => {
  test.beforeEach(async () => {
    await allure.feature('Cart');
  });

  test('Verify Added Products Appear in Cart', { tag: '@smoke' }, async ({ poManager }) => {
    await allure.story('Cart Items');
    await setAllureTags('High', 'Critical');
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

  test('Verify Removing Item Updates Cart Count', async ({ poManager }) => {
    await allure.story('Remove Item');
    await setAllureTags('High', 'Medium');
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

  test('Verify Continue Shopping Returns to Inventory', async ({ page, poManager }) => {
    await allure.story('Continue Shopping');
    await setAllureTags('Medium', 'Medium');
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

  test('Verify Empty Cart Shows No Items', async ({ poManager }) => {
    await allure.story('Empty Cart');
    await setAllureTags('Medium', 'Medium');
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
