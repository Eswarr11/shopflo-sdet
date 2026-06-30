import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { USERS, PASSWORD } from '../../../config/constants';
import { MESSAGES } from '../../../config/messages';

test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Login', { tag: '@regression' }, () => {
  test.beforeEach(async ({ poManager }) => {
    await allure.feature('Authentication');
    await allure.story('Login');
    await poManager.getLoginPage().goto();
  });

  test.describe('Positive', () => {
    test('Verify Standard User Can Access Inventory After Login', { tag: '@smoke' }, async ({ page, poManager }) => {
      await setAllureTags('Critical', 'Critical');
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
    test('Verify Locked-Out User Cannot Log In', async ({ page, poManager }) => {
      await setAllureTags('High', 'Critical');
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

    test('Verify Wrong Password Shows Credentials Error', async ({ page, poManager }) => {
      await setAllureTags('High', 'High');
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

    test('Verify Empty Username Shows Required Error', async ({ page, poManager }) => {
      await setAllureTags('Medium', 'Medium');
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

    test('Verify Empty Password Shows Required Error', async ({ page, poManager }) => {
      await setAllureTags('Medium', 'Medium');
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

    test('Verify Both Fields Empty Shows Username Required First', async ({ page, poManager }) => {
      await setAllureTags('Medium', 'Low');
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
