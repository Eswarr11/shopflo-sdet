import { allure } from 'allure-playwright';
import { test, expect } from '../../../fixtures/ui.fixture';
import { USERS, PASSWORD } from '../../../config/constants';
import { MESSAGES } from '../../../config/messages';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', () => {
  test.beforeEach(async ({ poManager }) => {
    await allure.feature('Authentication');
    await allure.story('Login');
    await poManager.getLoginPage().goto();
  });

  test.describe('Positive', () => {
    test('standard_user with valid credentials lands on inventory page', { tag: '@smoke' }, async ({ page, poManager }) => {
      await allure.severity('critical');
      await allure.step('Log in with standard_user credentials', async () => {
        await poManager.getLoginPage().login(USERS.STANDARD, PASSWORD);
      });
      await allure.step('Verify inventory page is displayed with 6 products', async () => {
        await expect(page).toHaveURL(/inventory/);
        const inventory = poManager.getInventoryPage();
        expect(await inventory.isPageTitleVisible()).toBe(true);
        expect(await inventory.getProductCount()).toBe(6);
      });
    });
  });

  test.describe('Negative', () => {
    test('locked_out_user sees locked-out error and stays on login page', async ({ page, poManager }) => {
      await allure.severity('normal');
      const loginPage = poManager.getLoginPage();
      await allure.step('Attempt login with locked_out_user', async () => {
        await loginPage.login(USERS.LOCKED, PASSWORD);
      });
      await allure.step('Verify locked-out error is shown and user stays on login page', async () => {
        await expect(page).not.toHaveURL(/inventory/);
        expect(await loginPage.isErrorVisible()).toBe(true);
        expect(await loginPage.getErrorMessage()).toContain(MESSAGES.LOGIN.LOCKED_OUT);
      });
    });

    test('wrong password shows credentials-mismatch error', async ({ page, poManager }) => {
      const loginPage = poManager.getLoginPage();
      await allure.step('Attempt login with wrong password', async () => {
        await loginPage.login(USERS.STANDARD, 'wrong_password');
      });
      await allure.step('Verify credentials mismatch error', async () => {
        await expect(page).not.toHaveURL(/inventory/);
        expect(await loginPage.isErrorVisible()).toBe(true);
        expect(await loginPage.getErrorMessage()).toContain(MESSAGES.LOGIN.CREDENTIALS_MISMATCH);
      });
    });

    test('empty username field shows "Username is required" error', async ({ page, poManager }) => {
      const loginPage = poManager.getLoginPage();
      await allure.step('Submit login with empty username', async () => {
        await loginPage.login('', PASSWORD);
      });
      await allure.step('Verify username required error', async () => {
        await expect(page).not.toHaveURL(/inventory/);
        expect(await loginPage.isErrorVisible()).toBe(true);
        expect(await loginPage.getErrorMessage()).toContain(MESSAGES.LOGIN.USERNAME_REQUIRED);
      });
    });

    test('empty password field shows "Password is required" error', async ({ page, poManager }) => {
      const loginPage = poManager.getLoginPage();
      await allure.step('Submit login with empty password', async () => {
        await loginPage.login(USERS.STANDARD, '');
      });
      await allure.step('Verify password required error', async () => {
        await expect(page).not.toHaveURL(/inventory/);
        expect(await loginPage.isErrorVisible()).toBe(true);
        expect(await loginPage.getErrorMessage()).toContain(MESSAGES.LOGIN.PASSWORD_REQUIRED);
      });
    });

    test('both fields empty shows username-required error (username validated first)', async ({ page, poManager }) => {
      const loginPage = poManager.getLoginPage();
      await allure.step('Submit login with both fields empty', async () => {
        await loginPage.login('', '');
      });
      await allure.step('Verify username required error is shown first', async () => {
        await expect(page).not.toHaveURL(/inventory/);
        expect(await loginPage.isErrorVisible()).toBe(true);
        expect(await loginPage.getErrorMessage()).toContain(MESSAGES.LOGIN.USERNAME_REQUIRED);
      });
    });
  });
});
