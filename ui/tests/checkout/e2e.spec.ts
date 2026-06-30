import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { buildCheckoutInfo, pickRandomProductNames } from '../../../helpers/data.helper';
import { AUTH_FILES, PRODUCTS } from '../../../config/constants';
import { MESSAGES } from '../../../config/messages';
import { addProductFromDetailPage, navigateToCheckoutStepTwo } from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Checkout E2E', () => {
  test('Verify Successful End-to-End Checkout for Standard User', { tag: '@smoke' }, async ({ page, poManager }) => {
    await allure.feature('Checkout');
    await allure.story('E2E');
    await setAllureTags('Critical', 'Critical');

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

  test('Verify Removed Inventory Items Do Not Appear in Checkout Flow', async ({ page, poManager }) => {
    await allure.feature('Cart');
    await allure.story('E2E');
    await setAllureTags('High', 'High');

    const addedProducts = [
      PRODUCTS.BACKPACK.name,
      PRODUCTS.BIKE_LIGHT.name,
      PRODUCTS.BOLT_TSHIRT.name,
    ];
    const removedProducts = [PRODUCTS.BACKPACK.name, PRODUCTS.BIKE_LIGHT.name];
    const remainingProduct = PRODUCTS.BOLT_TSHIRT.name;
    const checkoutInfo = buildCheckoutInfo();

    await allure.step('Add three products from inventory listing', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      for (const name of addedProducts) {
        await inventory.addToCartByName(name);
      }
      expect(await inventory.getCartBadgeCount()).toBe(3);
    });

    await allure.step('Remove two products from inventory and verify only one remains in cart state', async () => {
      const inventory = poManager.getInventoryPage();
      for (const name of removedProducts) {
        await inventory.removeFromCartByName(name);
      }
      expect(await inventory.getCartBadgeCount()).toBe(1);
      expect(await inventory.isAddToCartShownForProduct(PRODUCTS.BACKPACK.name)).toBe(true);
      expect(await inventory.isAddToCartShownForProduct(PRODUCTS.BIKE_LIGHT.name)).toBe(true);
      expect(await inventory.isRemoveShownForProduct(remainingProduct)).toBe(true);
    });

    await allure.step('Open cart and verify removed products are not listed', async () => {
      await poManager.getInventoryPage().goToCart();
      const cart = poManager.getCartPage();
      expect(await cart.isTitleVisible()).toBe(true);
      expect(await cart.getCartItemCount()).toBe(1);
      const cartNames = await cart.getCartItemNames();
      expect(cartNames).toContain(remainingProduct);
      for (const name of removedProducts) {
        expect(cartNames).not.toContain(name);
      }
    });

    await allure.step('Proceed to checkout information page', async () => {
      await poManager.getCartPage().proceedToCheckout();
      await expect(page).toHaveURL(/checkout-step-one/);
      expect(await poManager.getCheckoutStepOnePage().isErrorVisible()).toBe(false);
    });

    await allure.step('Fill shipping information and continue to order overview', async () => {
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

    await allure.step('Verify removed products are absent from order overview and totals match remaining item', async () => {
      expect(await stepTwo.isFinishButtonVisible()).toBe(true);
      expect(await stepTwo.getItemCount()).toBe(1);
      const summaryNames = await stepTwo.getItemNames();
      expect(summaryNames).toContain(remainingProduct);
      for (const name of removedProducts) {
        expect(summaryNames).not.toContain(name);
      }
      expect(await stepTwo.getSubtotal()).toBeCloseTo(PRODUCTS.BOLT_TSHIRT.price, 2);
      expect(await stepTwo.getItemPriceByName(remainingProduct)).toBe(PRODUCTS.BOLT_TSHIRT.price);
      const subtotal = await stepTwo.getSubtotal();
      const tax = await stepTwo.getTax();
      const total = await stepTwo.getTotal();
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    await allure.step('Finish checkout and complete payment', async () => {
      await stepTwo.finish();
      await expect(page).toHaveURL(/checkout-complete/);
    });

    await allure.step('Verify order confirmation page shows success without removed products', async () => {
      const complete = poManager.getCheckoutCompletePage();
      expect(await complete.isSuccessHeaderVisible()).toBe(true);
      expect(await complete.getSuccessHeader()).toContain(MESSAGES.CHECKOUT_COMPLETE.THANK_YOU);
      expect(await complete.getSuccessText()).toContain(MESSAGES.CHECKOUT_COMPLETE.DISPATCHED);
      const confirmationText = [
        await complete.getSuccessHeader(),
        await complete.getSuccessText(),
      ].join(' ');
      for (const name of removedProducts) {
        expect(confirmationText).not.toContain(name);
      }
      expect(confirmationText).not.toContain(remainingProduct);
    });
  });

  test('Verify User Can Add More Products and Complete Checkout After Reaching Order Overview', async ({ page, poManager }) => {
    await allure.feature('Checkout');
    await allure.story('E2E');
    await setAllureTags('High', 'High');

    const initialProducts = [PRODUCTS.BACKPACK.name];
    const additionalProducts = [PRODUCTS.BIKE_LIGHT.name, PRODUCTS.ONESIE.name];
    const allProducts = [...initialProducts, ...additionalProducts];
    const productPrices = new Map<string, number>([
      [PRODUCTS.BACKPACK.name, PRODUCTS.BACKPACK.price],
      [PRODUCTS.BIKE_LIGHT.name, PRODUCTS.BIKE_LIGHT.price],
      [PRODUCTS.ONESIE.name, PRODUCTS.ONESIE.price],
    ]);
    const checkoutInfo = buildCheckoutInfo();

    await allure.step('Add initial product and proceed to order overview', async () => {
      const inventory = poManager.getInventoryPage();
      await inventory.goto();
      await inventory.addToCartByName(PRODUCTS.BACKPACK.name);
      expect(await inventory.getCartBadgeCount()).toBe(1);
      await inventory.goToCart();
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

    await allure.step('Verify order overview shows only the initial product before leaving checkout', async () => {
      const stepTwo = poManager.getCheckoutStepTwoPage();
      expect(await stepTwo.isFinishButtonVisible()).toBe(true);
      expect(await stepTwo.getItemCount()).toBe(1);
      expect(await stepTwo.getItemNames()).toContain(PRODUCTS.BACKPACK.name);
      expect(await stepTwo.getSubtotal()).toBeCloseTo(PRODUCTS.BACKPACK.price, 2);
    });

    await allure.step('Cancel from order overview and return to inventory', async () => {
      await poManager.getCheckoutStepTwoPage().cancel();
      await expect(page).toHaveURL(/inventory\.html/);
      expect(await poManager.getInventoryPage().isPageTitleVisible()).toBe(true);
      expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(1);
    });

    await allure.step('Add more products from inventory listing', async () => {
      const inventory = poManager.getInventoryPage();
      for (const name of additionalProducts) {
        await inventory.addToCartByName(name);
      }
      expect(await inventory.getCartBadgeCount()).toBe(allProducts.length);
    });

    await allure.step('Open cart and verify all products including newly added items', async () => {
      await poManager.getInventoryPage().goToCart();
      const cart = poManager.getCartPage();
      expect(await cart.getCartItemCount()).toBe(allProducts.length);
      const cartNames = await cart.getCartItemNames();
      for (const name of allProducts) {
        expect(cartNames).toContain(name);
      }
    });

    await allure.step('Proceed through checkout again to order overview', async () => {
      await poManager.getCartPage().proceedToCheckout();
      await expect(page).toHaveURL(/checkout-step-one/);
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

    await allure.step('Verify updated order overview reflects all cart products and correct totals', async () => {
      expect(await stepTwo.getItemCount()).toBe(allProducts.length);
      const summaryNames = await stepTwo.getItemNames();
      for (const name of allProducts) {
        expect(summaryNames).toContain(name);
        expect(await stepTwo.getItemPriceByName(name)).toBe(productPrices.get(name)!);
      }
      const expectedSubtotal = [...productPrices.values()].reduce((sum, price) => sum + price, 0);
      const subtotal = await stepTwo.getSubtotal();
      const tax = await stepTwo.getTax();
      const total = await stepTwo.getTotal();
      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });

    await allure.step('Finish checkout and verify thank you page', async () => {
      await stepTwo.finish();
      await expect(page).toHaveURL(/checkout-complete/);
      const complete = poManager.getCheckoutCompletePage();
      expect(await complete.isSuccessHeaderVisible()).toBe(true);
      expect(await complete.getSuccessHeader()).toContain(MESSAGES.CHECKOUT_COMPLETE.THANK_YOU);
      expect(await complete.getSuccessText()).toContain(MESSAGES.CHECKOUT_COMPLETE.DISPATCHED);
    });
  });
});
