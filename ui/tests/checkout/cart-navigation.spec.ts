import * as allure from 'allure-js-commons';
import { setAllureTags } from '@helpers/allure-tags.helper';
import { test, expect } from '@fixtures/ui.fixture';
import { buildCheckoutInfo } from '@helpers/data.helper';
import { AUTH_FILES, PRODUCTS } from '@config/constants';
import { MESSAGES } from '@config/messages';
import { navigateToCheckoutStepTwo } from '@ui/helpers/flow.helper';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Verify Cart Navigation From Order Confirmation Page', { tag: '@regression' }, () => {
  test('Verify Cart Navigation From Order Confirmation Page', async ({ page, poManager }) => {
    await allure.feature('Checkout');
    await setAllureTags('High', 'Medium');
    const productNames = [PRODUCTS.BACKPACK.name, PRODUCTS.BIKE_LIGHT.name];
    const checkoutInfo = buildCheckoutInfo();

    await allure.step('Add products and proceed to order overview', async () => {
      await navigateToCheckoutStepTwo(page, poManager, productNames, checkoutInfo);
      expect(await poManager.getCheckoutStepTwoPage().getItemCount()).toBe(2);
    });

    await allure.step('Cancel from order overview to return to inventory', async () => {
      await poManager.getCheckoutStepTwoPage().cancel();
      await expect(page).toHaveURL(/inventory\.html/);
    });

    await allure.step('Open cart from header and verify previously added products', async () => {
      await poManager.getInventoryPage().goToCart();
      const cart = poManager.getCartPage();
      expect(await cart.getCartItemCount()).toBe(2);
      const names = await cart.getCartItemNames();
      expect(names).toContain(PRODUCTS.BACKPACK.name);
      expect(names).toContain(PRODUCTS.BIKE_LIGHT.name);
    });

    await allure.step('Complete checkout and verify order confirmation page', async () => {
      await poManager.getCartPage().proceedToCheckout();
      const stepOne = poManager.getCheckoutStepOnePage();
      await stepOne.fillShippingInfo(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.zipCode,
      );
      await stepOne.continue();
      await poManager.getCheckoutStepTwoPage().finish();
      await expect(page).toHaveURL(/checkout-complete/);
      const complete = poManager.getCheckoutCompletePage();
      await complete.expectSuccessHeaderVisible();
      expect(await complete.getSuccessHeader()).toContain(MESSAGES.CHECKOUT_COMPLETE.THANK_YOU);
    });

    await allure.step('Click cart icon on order confirmation page', async () => {
      await poManager.getHeader().goToCart();
      await expect(page).toHaveURL(/cart\.html/);
      const cart = poManager.getCartPage();
      await cart.expectTitleVisible();
    });
  });
});
