import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Cart persistence', { tag: '@regression' }, () => {
  test.beforeEach(async () => {
    await allure.feature('Cart');
    await allure.story('Persistence');
  });

  test('Verify Cart Persists After Page Reload', async ({ page, poManager }) => {
    await setAllureTags('High', 'Medium');
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
});
