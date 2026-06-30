import { allure } from 'allure-playwright';
import { test, expect } from '../../../fixtures/ui.fixture';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Cart persistence', () => {
  test.beforeEach(async () => {
    await allure.feature('Cart');
    await allure.story('Persistence');
  });

  test('cart items persist after page reload', async ({ page, poManager }) => {
    await allure.step('Add product to cart and reload page', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
      expect(await inventory.getCartBadgeCount()).toBe(1);
      await page.reload();
      await inventory.waitForLoad();
    });
    await allure.step('Verify cart badge still shows 1 item after reload', async () => {
      const inventory = poManager.getInventoryPage();
      expect(await inventory.isPageTitleVisible()).toBe(true);
      expect(await inventory.getCartBadgeCount()).toBe(1);
    });
  });

  test('cart is cleared after Reset App State from burger menu', async ({ poManager }) => {
    await allure.step('Add product and reset app state via burger menu', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
      expect(await inventory.getCartBadgeCount()).toBe(1);
      await poManager.getHeader().openBurgerMenu();
      await poManager.getBurgerMenu().clickResetAppState();
      await poManager.getBurgerMenu().close();
    });
    await allure.step('Verify cart badge is cleared', async () => {
      const inventory = poManager.getInventoryPage();
      expect(await inventory.isCartBadgeVisible()).toBe(false);
      expect(await inventory.getCartBadgeCount()).toBe(0);
    });
  });
});
