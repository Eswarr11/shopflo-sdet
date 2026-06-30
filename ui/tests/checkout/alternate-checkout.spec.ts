import * as allure from 'allure-js-commons';
import { test, expect } from '../../../fixtures/ui.fixture';
import { buildCheckoutInfo } from '../../../helpers/data.helper';
import { AUTH_FILES, PRODUCTS } from '../../../config/constants';
import { MESSAGES } from '../../../config/messages';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Verify Alternate Checkout Flow for Standard User', () => {
  test('Verify Alternate Checkout Flow for Standard User', async ({ page, poManager }) => {
    await allure.feature('Checkout');
    const checkoutInfo = buildCheckoutInfo();

    await allure.step('Open product detail page and add product to cart', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      await inventory.clickProduct(PRODUCTS.BACKPACK.name);
      await expect(page).toHaveURL(/inventory-item/);
      const detail = poManager.getProductDetailPage();
      expect(await detail.isAddToCartButtonVisible()).toBe(true);
      await detail.addToCart();
      expect(await detail.isRemoveButtonVisible()).toBe(true);
    });

    await allure.step('Open cart and verify selected product is listed', async () => {
      await poManager.getProductDetailPage().goBack();
      await poManager.getInventoryPage().goToCart();
      const cart = poManager.getCartPage();
      expect(await cart.isTitleVisible()).toBe(true);
      expect(await cart.getCartItemCount()).toBe(1);
      expect(await cart.getCartItemNames()).toContain(PRODUCTS.BACKPACK.name);
    });

    await allure.step('Proceed to checkout and fill customer information', async () => {
      await poManager.getCartPage().proceedToCheckout();
      const stepOne = poManager.getCheckoutStepOnePage();
      await stepOne.fillShippingInfo(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.zipCode,
      );
      await stepOne.continue();
      await expect(page).toHaveURL(/checkout-step-two/);
    });

    const stepTwo = poManager.getCheckoutStepTwoPage();

    await allure.step('Verify order summary and complete purchase', async () => {
      expect(await stepTwo.getItemCount()).toBe(1);
      expect(await stepTwo.getItemNames()).toContain(PRODUCTS.BACKPACK.name);
      expect(await stepTwo.getSubtotal()).toBeCloseTo(PRODUCTS.BACKPACK.price, 2);
      await stepTwo.finish();
    });

    await allure.step('Verify Thank you for your order page is displayed', async () => {
      await expect(page).toHaveURL(/checkout-complete/);
      const complete = poManager.getCheckoutCompletePage();
      expect(await complete.isSuccessHeaderVisible()).toBe(true);
      expect(await complete.getSuccessHeader()).toContain(MESSAGES.CHECKOUT_COMPLETE.THANK_YOU);
    });
  });
});
