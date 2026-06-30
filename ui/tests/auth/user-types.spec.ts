import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { USERS, PASSWORD, AUTH_FILES, PRODUCT_IMAGE_SLUGS } from '../../../config/constants';

test.describe('User type behaviors', { tag: '@regression' }, () => {
  test.describe('Login-required scenarios', () => {
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Verify Inventory Page Loads Successfully With Delays', async ({ page, poManager }) => {
      await allure.feature('Checkout');
      await allure.story('User Types');
      await setAllureTags('Medium', 'Medium');
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

    test('Verify Problem User Product Images Are Mismatched', async ({ page, poManager }) => {
      await allure.feature('Authentication');
      await allure.story('User Types');
      await setAllureTags('Medium', 'Medium');
      await allure.step('Log in as problem_user and open inventory', async () => {
        const login = poManager.getLoginPage();
        await login.goto();
        await login.login(USERS.PROBLEM, PASSWORD);
        await page.waitForURL(/inventory/);
      });
      await allure.step('Verify at least one product shows the wrong image', async () => {
        const inventory = poManager.getInventoryPage();
        expect(await inventory.isPageTitleVisible()).toBe(true);
        const mismatches = await inventory.getMismatchedProductImageCount(PRODUCT_IMAGE_SLUGS);
        expect(mismatches).toBeGreaterThan(0);
      });
    });
  });

  test.describe('visual_user', () => {
    test.use({ storageState: AUTH_FILES.VISUAL_USER });

    test('Verify Visual User Can Access Inventory', async ({ poManager }) => {
      await allure.feature('Authentication');
      await allure.story('User Types');
      await setAllureTags('Low', 'Low');
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

    test('Verify Error User Can Access Inventory', async ({ poManager }) => {
      await allure.feature('Authentication');
      await allure.story('User Types');
      await setAllureTags('Low', 'Low');
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
