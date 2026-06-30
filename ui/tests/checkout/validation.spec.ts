import * as allure from 'allure-js-commons';
import { setAllureTags } from '../../../helpers/allure-tags.helper';
import { test, expect } from '../../../fixtures/ui.fixture';
import { PRODUCTS, AUTH_FILES } from '../../../config/constants';
import { MESSAGES } from '../../../config/messages';
import { navigateToCheckoutStepOne } from '../../helpers/flow.helper';

test.use({ storageState: AUTH_FILES.STANDARD_USER });

test.describe('Verify Mandatory Customer Information Validation', { tag: '@regression' }, () => {
  test.beforeEach(async ({ poManager }) => {
    await allure.feature('Checkout');
    await allure.story('Step 1 Validation');
    await setAllureTags('High', 'High');
    await navigateToCheckoutStepOne(poManager, [PRODUCTS.BACKPACK.name]);
    expect(await poManager.getCheckoutStepOnePage().isErrorVisible()).toBe(false);
  });

  test('missing first name shows "First Name is required" error', async ({ poManager }) => {
    const stepOne = poManager.getCheckoutStepOnePage();
    await allure.step('Submit checkout step one without first name', async () => {
      await stepOne.fillShippingInfo('', 'Doe', '12345');
      await stepOne.continue();
    });
    await allure.step('Verify first name validation error', async () => {
      expect(await stepOne.isErrorVisible()).toBe(true);
      expect(await stepOne.getErrorMessage()).toContain(MESSAGES.CHECKOUT.FIRST_NAME);
    });
  });

  test('missing last name shows "Last Name is required" error', async ({ poManager }) => {
    const stepOne = poManager.getCheckoutStepOnePage();
    await allure.step('Submit checkout step one without last name', async () => {
      await stepOne.fillShippingInfo('John', '', '12345');
      await stepOne.continue();
    });
    await allure.step('Verify last name validation error', async () => {
      expect(await stepOne.isErrorVisible()).toBe(true);
      expect(await stepOne.getErrorMessage()).toContain(MESSAGES.CHECKOUT.LAST_NAME);
    });
  });

  test('missing zip code shows "Postal Code is required" error', async ({ poManager }) => {
    const stepOne = poManager.getCheckoutStepOnePage();
    await allure.step('Submit checkout step one without postal code', async () => {
      await stepOne.fillShippingInfo('John', 'Doe', '');
      await stepOne.continue();
    });
    await allure.step('Verify postal code validation error', async () => {
      expect(await stepOne.isErrorVisible()).toBe(true);
      expect(await stepOne.getErrorMessage()).toContain(MESSAGES.CHECKOUT.POSTAL_CODE);
    });
  });

  test('all fields empty shows validation error (first name checked first)', async ({
    poManager,
  }) => {
    const stepOne = poManager.getCheckoutStepOnePage();
    await allure.step('Submit checkout step one with all fields empty', async () => {
      await stepOne.continue();
    });
    await allure.step('Verify first name validation error is shown first', async () => {
      expect(await stepOne.isErrorVisible()).toBe(true);
      expect(await stepOne.getErrorMessage()).toContain(MESSAGES.CHECKOUT.FIRST_NAME);
    });
  });
});
