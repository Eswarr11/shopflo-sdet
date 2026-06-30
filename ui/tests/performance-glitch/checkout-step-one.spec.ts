import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { AUTH_FILES, PRODUCTS } from '../../../config/constants';
import { navigateToCart } from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.PERFORMANCE_GLITCH_USER });

test.describe('Verify Checkout Information Page Loads With Delays', { tag: '@regression' }, () => {
  test('Verify Checkout Information Page Loads With Delays', async ({ page, poManager }) => {
    await allure.feature('Checkout');
    await setAllureTags('Medium', 'Medium');
    await allure.step('Add products and open cart page', async () => {
      await navigateToCart(poManager, [PRODUCTS.BACKPACK.name]);
      expect(await poManager.getCartPage().getCartItemCount()).toBe(1);
    });

    await allure.step('Proceed to checkout information page', async () => {
      await poManager.getCartPage().proceedToCheckout();
      await expect(page).toHaveURL(/checkout-step-one/);
    });

    const stepOne = poManager.getCheckoutStepOnePage();

    await allure.step('Verify checkout fields and action buttons are visible', async () => {
      expect(await stepOne.isFirstNameVisible()).toBe(true);
      expect(await stepOne.isLastNameVisible()).toBe(true);
      expect(await stepOne.isZipCodeVisible()).toBe(true);
      expect(await stepOne.isContinueButtonVisible()).toBe(true);
      expect(await stepOne.isCancelButtonVisible()).toBe(true);
      expect(await stepOne.isLastNameEditable()).toBe(true);
    });
  });
});
