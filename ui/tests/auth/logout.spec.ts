import * as allure from 'allure-js-commons';
import { setAllureTags } from '@helpers/allure-tags.helper';
import { test, expect } from '@fixtures/ui.fixture';
import { AUTH_FILES } from '@config/constants';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Verify Successful Logout After Login', { tag: '@regression' }, () => {
  test.beforeEach(async () => {
    await allure.feature('Login');
  });

  test('Verify Successful Logout After Login', async ({ page, poManager }) => {
    await setAllureTags('High', 'High');
    await allure.step('Navigate to inventory as logged-in user', async () => {
      await poManager.getInventoryPage().goto();
      await poManager.getInventoryPage().expectPageTitleVisible();
    });

    await allure.step('Open burger menu and verify Logout option is visible', async () => {
      await poManager.getHeader().openBurgerMenu();
      await poManager.getBurgerMenu().expectLogoutLinkVisible();
    });

    await allure.step('Click Logout and verify redirect to login page', async () => {
      await poManager.getBurgerMenu().clickLogout();
      await expect(page).toHaveURL(/\//);
      await poManager.getLoginPage().expectErrorHidden();
    });
  });
});
