import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { markKnownDefect } from '../../../helpers/known-defects.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { buildCheckoutInfo } from '../../../helpers/data.helper';
import { AUTH_FILES, PRODUCTS } from '../../../config/constants';
import { addProductsToCart } from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.PROBLEM_USER });

test.describe(
  'Verify Checkout Completion for Problem User',
  { tag: ['@regression', '@known-defect'] },
  () => {
    test('Verify Checkout Completion for Problem User', async ({ page, poManager }) => {
      await markKnownDefect('SAUCEDEMO_PROBLEM_USER_CHECKOUT');
      await allure.feature('Checkout');
      await setAllureTags('High', 'High');
      const checkoutInfo = buildCheckoutInfo();

      await allure.step('Add products to cart from inventory page', async () => {
        await addProductsToCart(poManager, [PRODUCTS.BACKPACK.name, PRODUCTS.BIKE_LIGHT.name]);
        expect(await poManager.getInventoryPage().getCartBadgeCount()).toBe(2);
      });

      await allure.step('Open cart and proceed to checkout', async () => {
        await poManager.getInventoryPage().goToCart();
        await poManager.getCartPage().proceedToCheckout();
        await expect(page).toHaveURL(/checkout-step-one/);
      });

      const stepOne = poManager.getCheckoutStepOnePage();

      await allure.step(
        'Verify Last Name field is editable and fill checkout information',
        async () => {
          expect(await stepOne.isLastNameEditable()).toBe(true);
          await stepOne.fillShippingInfo(
            checkoutInfo.firstName,
            checkoutInfo.lastName,
            checkoutInfo.zipCode,
          );
          expect(await stepOne.getLastNameValue()).toBe(checkoutInfo.lastName);
          await stepOne.continue();
          await expect(page).toHaveURL(/checkout-step-two/);
        },
      );

      await allure.step('Complete purchase from order overview', async () => {
        const stepTwo = poManager.getCheckoutStepTwoPage();
        expect(await stepTwo.getItemCount()).toBe(2);
        await stepTwo.finish();
        await expect(page).toHaveURL(/checkout-complete/);
        expect(await poManager.getCheckoutCompletePage().isSuccessHeaderVisible()).toBe(true);
      });
    });
  },
);
