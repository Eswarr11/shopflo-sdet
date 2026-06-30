import * as allure from 'allure-js-commons';
import { test, expect } from '../../../fixtures/ui.fixture';
import { buildCheckoutInfo, pickRandomProductNames } from '../../../helpers/data.helper';
import { AUTH_FILES, PRODUCTS } from '../../../config/constants';
import { MESSAGES } from '../../../config/messages';
import { addProductFromDetailPage, navigateToCheckoutStepTwo } from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Checkout E2E', () => {
  test.beforeEach(async () => {
    await allure.feature('Checkout');
    await allure.story('E2E');
  });

  test('complete checkout happy path', { tag: '@smoke' }, async ({ page, poManager }) => {
    await allure.severity('critical');

    const productNames = Object.values(PRODUCTS).map(product => product.name);
    const numProducts = Math.floor(Math.random() * productNames.length) + 1;
    const selectedProducts = pickRandomProductNames(numProducts);
    const productPrices = new Map<string, number>();
    const [detailProduct, ...listingProducts] = selectedProducts;

    await allure.parameter('cartSize', String(selectedProducts.length));
    await allure.parameter('products', selectedProducts.join(', '));

    await allure.step('Add first product from product detail page', async () => {
      const price = await addProductFromDetailPage(poManager, detailProduct);
      productPrices.set(detailProduct, price);
    });

    await allure.step('Verify inventory page displays with cart badge showing 1', async () => {
      await expect(page).toHaveURL(/inventory\.html/);
      const inventory = poManager.getInventoryPage();
      expect(await inventory.isPageTitleVisible()).toBe(true);
      expect(await inventory.getCartBadgeCount()).toBe(1);
    });

    await allure.step('Add remaining products from inventory listing', async () => {
      const inventory = poManager.getInventoryPage();
      for (const productName of listingProducts) {
        const price = await inventory.getProductPriceByName(productName);
        productPrices.set(productName, price);
        await inventory.addToCartByName(productName);
      }
      expect(await inventory.getCartBadgeCount()).toBe(selectedProducts.length);
    });

    await allure.step('Open cart page and verify all items are present', async () => {
      await poManager.getInventoryPage().goToCart();
      const cart = poManager.getCartPage();
      expect(await cart.isTitleVisible()).toBe(true);
      expect(await cart.getCartItemCount()).toBe(selectedProducts.length);
    });

    await allure.step('Proceed to checkout and fill shipping information', async () => {
      await poManager.getCartPage().proceedToCheckout();
      expect(await poManager.getCheckoutStepOnePage().isErrorVisible()).toBe(false);
      await navigateToCheckoutStepTwo(page, poManager, [], buildCheckoutInfo());
    });

    const stepTwo = poManager.getCheckoutStepTwoPage();

    await allure.step('Verify order summary items and price totals', async () => {
      expect(await stepTwo.isFinishButtonVisible()).toBe(true);
      expect(await stepTwo.getItemCount()).toBe(selectedProducts.length);

      const itemNames = await stepTwo.getItemNames();
      const expectedSubtotal = [...productPrices.values()].reduce((sum, price) => sum + price, 0);

      for (const productName of selectedProducts) {
        expect(itemNames).toContain(productName);
        expect(await stepTwo.getItemPriceByName(productName)).toBe(
          Number(productPrices.get(productName)!),
        );
      }

      const subtotal = await stepTwo.getSubtotal();
      const tax = await stepTwo.getTax();
      const total = await stepTwo.getTotal();
      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    await allure.step('Finish checkout and complete order', async () => {
      await stepTwo.finish();
    });

    await allure.step('Verify checkout success page is displayed', async () => {
      await expect(page).toHaveURL(/checkout-complete/);
      const complete = poManager.getCheckoutCompletePage();
      expect(await complete.isSuccessHeaderVisible()).toBe(true);
      expect(await complete.getSuccessHeader()).toContain(MESSAGES.CHECKOUT_COMPLETE.THANK_YOU);
      expect(await complete.getSuccessText()).toContain(MESSAGES.CHECKOUT_COMPLETE.DISPATCHED);
      expect(await complete.isBackHomeButtonVisible()).toBe(true);
    });
  });
});
