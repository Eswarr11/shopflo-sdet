import { Page } from '@playwright/test';
import { POManager } from '../pages/po-manager';
import { buildCheckoutInfo } from '../../helpers/data.helper';

export async function addProductsToCart(
  poManager: POManager,
  productNames: string[],
): Promise<void> {
  const inventory = poManager.getInventoryPage();
  await inventory.goto();
  for (const name of productNames) {
    await inventory.addToCartByName(name);
  }
}

export async function addProductFromDetailPage(
  poManager: POManager,
  productName: string,
): Promise<number> {
  const inventory = poManager.getInventoryPage();
  await inventory.goto();
  await inventory.clickProduct(productName);
  const detail = poManager.getProductDetailPage();
  const price = await detail.getProductPrice();
  await detail.addToCart();
  await detail.goBack();
  return price;
}

export async function navigateToCart(
  poManager: POManager,
  productNames: string[],
): Promise<void> {
  await addProductsToCart(poManager, productNames);
  await poManager.getInventoryPage().goToCart();
}

export async function navigateToCheckoutStepOne(
  poManager: POManager,
  productNames: string[],
): Promise<void> {
  await navigateToCart(poManager, productNames);
  await poManager.getCartPage().proceedToCheckout();
}

export async function navigateToCheckoutStepTwo(
  page: Page,
  poManager: POManager,
  productNames: string[],
  checkoutInfo = buildCheckoutInfo(),
): Promise<ReturnType<POManager['getCheckoutStepTwoPage']>> {
  if (productNames.length > 0) {
    await navigateToCheckoutStepOne(poManager, productNames);
  }
  const stepOne = poManager.getCheckoutStepOnePage();
  await stepOne.fillShippingInfo(
    checkoutInfo.firstName,
    checkoutInfo.lastName,
    checkoutInfo.zipCode,
  );
  await stepOne.continue();
  await page.waitForURL(/checkout-step-two/);
  return poManager.getCheckoutStepTwoPage();
}

export async function assertInventoryLoaded(
  poManager: POManager,
  expectedCount = 6,
): Promise<void> {
  const inventory = poManager.getInventoryPage();
  await inventory.goto();
  const titleVisible = await inventory.isPageTitleVisible();
  if (!titleVisible) throw new Error('Inventory page title is not visible');
  const count = await inventory.getProductCount();
  if (count !== expectedCount) throw new Error(`Expected ${expectedCount} products, got ${count}`);
}
