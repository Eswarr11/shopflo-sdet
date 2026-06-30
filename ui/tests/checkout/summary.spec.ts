import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { buildCheckoutInfo } from '../../../helpers/data.helper';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';
import { navigateToCheckoutStepTwo } from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Order summary accuracy', { tag: '@regression' }, () => {
  test.beforeEach(async () => {
    await allure.feature('Checkout');
    await allure.story('Order Summary');
  });

  test('Verify Order Summary Subtotal Matches Product Prices', async ({ page, poManager }) => {
    await setAllureTags('High', 'Medium');
    await allure.step('Navigate to checkout step two with two products', async () => {
      await navigateToCheckoutStepTwo(
        page,
        poManager,
        [PRODUCTS.BACKPACK.name, PRODUCTS.FLEECE_JACKET.name],
        buildCheckoutInfo(),
      );
    });
    const stepTwo = poManager.getCheckoutStepTwoPage();

    await allure.step('Verify subtotal equals sum of product prices', async () => {
      expect(await stepTwo.isFinishButtonVisible()).toBe(true);
      expect(await stepTwo.getItemCount()).toBe(2);
      const itemNames = await stepTwo.getItemNames();
      expect(itemNames).toContain(PRODUCTS.BACKPACK.name);
      expect(itemNames).toContain(PRODUCTS.FLEECE_JACKET.name);
      const subtotal = await stepTwo.getSubtotal();
      const expectedSubtotal = PRODUCTS.BACKPACK.price + PRODUCTS.FLEECE_JACKET.price;
      expect(subtotal).toBeCloseTo(expectedSubtotal, 2);
    });
  });

  test('Verify Order Total Equals Subtotal Plus Tax', async ({ page, poManager }) => {
    await setAllureTags('High', 'Medium');
    await allure.step('Navigate to checkout step two with one product', async () => {
      await navigateToCheckoutStepTwo(
        page,
        poManager,
        [PRODUCTS.ONESIE.name],
        buildCheckoutInfo(),
      );
    });
    const stepTwo = poManager.getCheckoutStepTwoPage();

    await allure.step('Verify total equals subtotal plus tax', async () => {
      expect(await stepTwo.isFinishButtonVisible()).toBe(true);
      expect(await stepTwo.getItemCount()).toBe(1);
      const itemNames = await stepTwo.getItemNames();
      expect(itemNames).toContain(PRODUCTS.ONESIE.name);
      const subtotal = await stepTwo.getSubtotal();
      const tax = await stepTwo.getTax();
      const total = await stepTwo.getTotal();
      expect(total).toBeCloseTo(subtotal + tax, 2);
    });
  });
});
