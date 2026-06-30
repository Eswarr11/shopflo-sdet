import { allure } from 'allure-playwright';
import { test, expect } from '../../../fixtures/ui.fixture';
import { USERS, PASSWORD, AUTH_FILES } from '../../../config/constants';
import { MESSAGES } from '../../../config/messages';

test.describe('User type behaviors', () => {
  test.describe('Login-required scenarios', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('locked_out_user - sees error and cannot access inventory', async ({ page, poManager }) => {
      await allure.feature('Authentication');
      await allure.story('User Types');
      const login = poManager.getLoginPage();
      await allure.step('Attempt login as locked_out_user', async () => {
        await login.goto();
        await login.login(USERS.LOCKED, PASSWORD);
      });
      await allure.step('Verify error is shown and inventory is not accessible', async () => {
        expect(await login.isErrorVisible()).toBe(true);
        expect(await login.getErrorMessage()).toContain(MESSAGES.LOGIN.LOCKED_OUT);
        await expect(page).not.toHaveURL(/inventory/);
      });
    });

    test('performance_glitch_user - login takes longer than normal', async ({ page, poManager }) => {
      await allure.feature('Authentication');
      await allure.story('User Types');
      const login = poManager.getLoginPage();
      await allure.step('Measure login duration for performance_glitch_user', async () => {
        await login.goto();
        const start = Date.now();
        await login.login(USERS.PERFORMANCE_GLITCH, PASSWORD);
        await page.waitForURL(/inventory/);
        const elapsed = Date.now() - start;
        expect(elapsed).toBeGreaterThan(2000);
      });
      await allure.step('Verify inventory is accessible after slow login', async () => {
        const inventory = poManager.getInventoryPage();
        expect(await inventory.isPageTitleVisible()).toBe(true);
        expect(await inventory.getProductCount()).toBe(6);
      });
    });
  });

  test.describe('problem_user', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('product images are broken (naturalWidth = 0)', async ({ page, poManager }) => {
      await allure.feature('Authentication');
      await allure.story('User Types');
      await allure.step('Log in as problem_user and open inventory', async () => {
        const login = poManager.getLoginPage();
        await login.goto();
        await login.login(USERS.PROBLEM, PASSWORD);
        await page.waitForURL(/inventory/);
      });
      await allure.step('Verify at least one product image has naturalWidth = 0', async () => {
        const inventory = poManager.getInventoryPage();
        expect(await inventory.isPageTitleVisible()).toBe(true);
        await expect.poll(async () => {
          const widths = await inventory.getProductImageNaturalWidths();
          return widths.filter((w) => w === 0).length;
        }, { timeout: 10_000 }).toBeGreaterThan(0);
      });
    });
  });

  test.describe('visual_user', () => {
    test.use({ storageState: AUTH_FILES.VISUAL_USER });

    test('inventory is accessible with all products', async ({ poManager }) => {
      await allure.feature('Authentication');
      await allure.story('User Types');
      await allure.step('Navigate to inventory as visual_user', async () => {
        await poManager.getInventoryPage().goto();
      });
      await allure.step('Verify inventory page shows 6 products', async () => {
        const inventory = poManager.getInventoryPage();
        expect(await inventory.isPageTitleVisible()).toBe(true);
        expect(await inventory.getProductCount()).toBe(6);
      });
    });
  });

  test.describe('error_user', () => {
    test.use({ storageState: AUTH_FILES.ERROR_USER });

    test('lands on inventory with all products visible', async ({ poManager }) => {
      await allure.feature('Authentication');
      await allure.story('User Types');
      await allure.step('Navigate to inventory as error_user', async () => {
        await poManager.getInventoryPage().goto();
      });
      await allure.step('Verify inventory page shows 6 products', async () => {
        const inventory = poManager.getInventoryPage();
        expect(await inventory.isPageTitleVisible()).toBe(true);
        expect(await inventory.getProductCount()).toBe(6);
      });
    });
  });
});
