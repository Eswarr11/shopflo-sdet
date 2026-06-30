import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { buildCheckoutInfo } from '../../../helpers/data.helper';
import { AUTH_FILES, PRODUCTS } from '../../../config/constants';
import {
  addProductsToCart,
  navigateToCart,
  openBurgerMenuAndReset,
} from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Reset App State', () => {
  test.beforeEach(async () => {
    await allure.feature('Reset');
  });

  test('Verify Reset App State From Inventory Page', async ({ poManager }) => {
    await setAllureTags('Medium', 'High');
    const products = [PRODUCTS.BACKPACK.name, PRODUCTS.BIKE_LIGHT.name];

    await allure.step('Add products from inventory page', async () => {
      await addProductsToCart(poManager, products);
      expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(2);
      for (const name of products) {
        expect(await poManager.getInventoryPage().isRemoveShownForProduct(name)).toBe(true);
      }
    });

    await allure.step('Reset app state from burger menu', async () => {
      await openBurgerMenuAndReset(poManager);
    });

    await allure.step('Verify cart badge cleared and Add to Cart buttons restored', async () => {
      const inventory = poManager.getInventoryPage();
      expect(await inventory.isCartBadgeVisible()).toBe(false);
      expect(await inventory.getCartBadgeCount()).toBe(0);
      for (const name of products) {
        expect(await inventory.isAddToCartShownForProduct(name)).toBe(true);
        expect(await inventory.isRemoveShownForProduct(name)).toBe(false);
      }
    });
  });

  test('Verify Reset App State From Cart Page', async ({ poManager }) => {
    await setAllureTags('Medium', 'High');
    const products = [PRODUCTS.BACKPACK.name, PRODUCTS.BOLT_TSHIRT.name];

    await allure.step('Add products and open cart page', async () => {
      await navigateToCart(poManager, products);
      expect(await poManager.getCartPage().getCartItemCount()).toBe(2);
    });

    await allure.step('Reset app state from burger menu on cart page', async () => {
      await openBurgerMenuAndReset(poManager);
    });

    await allure.step('Verify cart badge cleared and cart is empty', async () => {
      expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(0);
      const cart = poManager.getCartPage();
      expect(await cart.getCartItemCount()).toBe(0);
      expect(await cart.isCheckoutButtonVisible()).toBe(true);
    });
  });

  test('Verify Reset App State During Checkout Information Step', async ({ page, poManager }) => {
    await setAllureTags('Medium', 'Medium');
    const checkoutInfo = buildCheckoutInfo();

    await allure.step('Add products and proceed to checkout information page', async () => {
      await addProductsToCart(poManager, [PRODUCTS.BACKPACK.name, PRODUCTS.ONESIE.name]);
      await poManager.getInventoryPage().goToCart();
      await poManager.getCartPage().proceedToCheckout();
      await expect(page).toHaveURL(/checkout-step-one/);
    });

    await allure.step('Reset app state during checkout information step', async () => {
      await openBurgerMenuAndReset(poManager);
      expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(0);
    });

    await allure.step('Continue to order overview and verify no products listed', async () => {
      const stepOne = poManager.getCheckoutStepOnePage();
      await stepOne.fillShippingInfo(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.zipCode,
      );
      await stepOne.continue();
      await expect(page).toHaveURL(/checkout-step-two/);
      expect(await poManager.getCheckoutStepTwoPage().getItemCount()).toBe(0);
    });
  });

  test('Verify Reset App State During Order Overview Step', async ({ page, poManager }) => {
    await setAllureTags('Medium', 'High');
    await allure.step('Add products and proceed to order overview', async () => {
      await addProductsToCart(poManager, [PRODUCTS.BACKPACK.name]);
      await poManager.getInventoryPage().goToCart();
      await poManager.getCartPage().proceedToCheckout();
      const stepOne = poManager.getCheckoutStepOnePage();
      const checkoutInfo = buildCheckoutInfo();
      await stepOne.fillShippingInfo(
        checkoutInfo.firstName,
        checkoutInfo.lastName,
        checkoutInfo.zipCode,
      );
      await stepOne.continue();
      await expect(page).toHaveURL(/checkout-step-two/);
      expect(await poManager.getCheckoutStepTwoPage().getItemCount()).toBe(1);
    });

    await allure.step('Reset app state during order overview step', async () => {
      await openBurgerMenuAndReset(poManager);
      expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(0);
    });

    await allure.step('Verify order overview has no items and purchase cannot complete with items', async () => {
      const stepTwo = poManager.getCheckoutStepTwoPage();
      expect(await stepTwo.getItemCount()).toBe(0);
      expect(await stepTwo.getItemNames()).toHaveLength(0);
      await stepTwo.finish();
      await expect(page).not.toHaveURL(/checkout-complete/);
    });
  });
});
