import { allure } from 'allure-playwright';
import { test, expect } from '../../../fixtures/ui.fixture';
import { AUTH_FILES } from '../../../config/constants';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Product Sorting', () => {
  test.beforeEach(async ({ poManager }) => {
    await allure.feature('Inventory');
    await allure.story('Sorting');
    const inventory = poManager.getInventoryPage();
    await inventory.goto();
    expect(await inventory.isPageTitleVisible()).toBe(true);
    expect(await inventory.getProductCount()).toBe(6);
  });

  test('sort Name A to Z', async ({ poManager }) => {
    await allure.step('Sort products A to Z and verify order', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.sortBy('az');
      const names = await inventory.getProductNames();
      expect(names.length).toBe(6);
      expect(names).toEqual([...names].sort());
    });
  });

  test('sort Name Z to A', async ({ poManager }) => {
    await allure.step('Sort products Z to A and verify order', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.sortBy('za');
      const names = await inventory.getProductNames();
      expect(names.length).toBe(6);
      expect(names).toEqual([...names].sort().reverse());
    });
  });

  test('sort Price low to high', async ({ poManager }) => {
    await allure.step('Sort products by price low to high', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.sortBy('lohi');
      const prices = await inventory.getProductPrices();
      expect(prices.length).toBe(6);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeLessThanOrEqual(prices[i + 1]);
      }
    });
  });

  test('sort Price high to low', async ({ poManager }) => {
    await allure.step('Sort products by price high to low', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.sortBy('hilo');
      const prices = await inventory.getProductPrices();
      expect(prices.length).toBe(6);
      for (let i = 0; i < prices.length - 1; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i + 1]);
      }
    });
  });
});
