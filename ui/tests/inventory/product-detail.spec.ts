import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Product detail page', { tag: '@regression' }, () => {
  test.beforeEach(async () => {
    await allure.feature('Inventory');
    await allure.story('Product Detail');
  });

  test('Verify Product Detail Page Elements Visible', { tag: '@smoke' }, async ({ page, poManager }) => {
    await setAllureTags('High', 'High');
    await allure.step('Open product detail page from inventory', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      await inventory.clickProduct(PRODUCTS.BACKPACK.name);
      await expect(page).toHaveURL(/inventory-item/);
    });
    await allure.step('Verify description and add-to-cart button are visible', async () => {
      const detail = poManager.getProductDetailPage();
      expect(await detail.isDescriptionVisible()).toBe(true);
      expect(await detail.isAddToCartButtonVisible()).toBe(true);
    });
  });

  test('Verify Product Detail Shows Correct Name and Price', async ({ poManager }) => {
    await setAllureTags('High', 'Medium');
    await allure.step('Verify product name, price, and description on detail page', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      await inventory.clickProduct(PRODUCTS.BACKPACK.name);
      const detail = poManager.getProductDetailPage();
      expect(await detail.getProductName()).toContain(PRODUCTS.BACKPACK.name);
      expect(await detail.getProductPrice()).toBe(PRODUCTS.BACKPACK.price);
      expect(await detail.isDescriptionVisible()).toBe(true);
    });
  });

  test('Verify Add to Cart From Product Detail Page', async ({ poManager }) => {
    await setAllureTags('High', 'High');
    await allure.step('Add product from detail page and verify cart state', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      await inventory.clickProduct(PRODUCTS.FLEECE_JACKET.name);
      const detail = poManager.getProductDetailPage();
      expect(await detail.isAddToCartButtonVisible()).toBe(true);
      await detail.addToCart();
      expect(await detail.isRemoveButtonVisible()).toBe(true);
      expect(await detail.isAddToCartButtonVisible()).toBe(false);
      expect(await inventory.getCartBadgeCount()).toBe(1);
    });
  });

  test('Verify Back Button Returns to Inventory', async ({ page, poManager }) => {
    await setAllureTags('Medium', 'Medium');
    await allure.step('Navigate back from detail page to inventory', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      await inventory.clickProduct(PRODUCTS.ONESIE.name);
      await poManager.getProductDetailPage().goBack();
      await expect(page).toHaveURL(/inventory\.html/);
    });
    await allure.step('Verify all 6 products are visible on inventory', async () => {
      const inventory = poManager.getInventoryPage();
      expect(await inventory.isPageTitleVisible()).toBe(true);
      expect(await inventory.getProductCount()).toBe(6);
    });
  });
});
