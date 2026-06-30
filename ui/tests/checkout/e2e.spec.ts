import { allure } from 'allure-playwright';
import { test, expect } from '../../../fixtures/ui.fixture';
import { buildCheckoutInfo } from '../../../helpers/data.helper';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';
import { MESSAGES } from '../../../config/messages';
import { addProductsToCart, navigateToCheckoutStepTwo } from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Checkout E2E', () => {
  test.beforeEach(async () => {
    await allure.feature('Checkout');
    await allure.story('E2E');
  });

  test('complete checkout happy path', { tag: '@smoke' }, async ({ page, poManager }) => {
    await allure.severity('critical');

    await allure.step('Add products to cart and open cart page', async () => {
      await addProductsToCart(poManager, [PRODUCTS.BACKPACK.name, PRODUCTS.BIKE_LIGHT.name]);
      expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(2);
      await poManager.getInventoryPage().goToCart();
      const cart = poManager.getCartPage();
      expect(await cart.isTitleVisible()).toBe(true);
      expect(await cart.getCartItemCount()).toBe(2);
    });

    await allure.step('Complete shipping info and reach order summary', async () => {
      await poManager.getCartPage().proceedToCheckout();
      expect(await poManager.getCheckoutStepOnePage().isErrorVisible()).toBe(false);
      await navigateToCheckoutStepTwo(
        page,
        poManager,
        [],
        buildCheckoutInfo(),
      );
    });
    const stepTwo = poManager.getCheckoutStepTwoPage();

    await allure.step('Verify order summary items and price totals', async () => {
      expect(await stepTwo.isFinishButtonVisible()).toBe(true);
      expect(await stepTwo.getItemCount()).toBe(2);
      const itemNames = await stepTwo.getItemNames();
      expect(itemNames).toContain(PRODUCTS.BACKPACK.name);
      expect(itemNames).toContain(PRODUCTS.BIKE_LIGHT.name);
      const subtotal = await stepTwo.getSubtotal();
      const tax = await stepTwo.getTax();
      const total = await stepTwo.getTotal();
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    await allure.step('Finish checkout and verify success page', async () => {
      await stepTwo.finish();
      await expect(page).toHaveURL(/checkout-complete/);
      const complete = poManager.getCheckoutCompletePage();
      expect(await complete.isSuccessHeaderVisible()).toBe(true);
      expect(await complete.getSuccessHeader()).toContain(MESSAGES.CHECKOUT_COMPLETE.THANK_YOU);
      expect(await complete.getSuccessText()).toContain(MESSAGES.CHECKOUT_COMPLETE.DISPATCHED);
      expect(await complete.isBackHomeButtonVisible()).toBe(true);
    });
  });
});
