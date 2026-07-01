import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';
import { CommonUtils } from '@helpers/common-utils';

export class InventoryPage extends BasePage {
  private readonly header: HeaderComponent;

  private readonly sortDropdown: Locator;
  private readonly productItems: Locator;
  private readonly productNames: Locator;
  private readonly productPrices: Locator;
  private readonly pageTitle: Locator;
  private readonly itemActionButtonSelector = 'button';
  private readonly addToCartButtonSelector = '[data-test^="add-to-cart"]';
  private readonly removeButtonSelector = '[data-test^="remove"]';
  private readonly productImageSelector = 'img';

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
    this.sortDropdown = this.byTestId('product-sort-container');
    this.productItems = this.byCss('.inventory_item');
    this.productNames = this.byTestId('inventory-item-name');
    this.productPrices = this.byTestId('inventory-item-price');
    this.pageTitle = this.byTestId('title');
  }

  private getProductItemByName(productName: string): Locator {
    return this.productItems.filter({ hasText: productName });
  }

  async goto(): Promise<void> {
    await this.navigate('/inventory.html');
  }

  async sortBy(option: string): Promise<void> {
    await this.actions.selectOption(this.sortDropdown, option, 'sort dropdown');
  }

  async addToCartByName(productName: string): Promise<void> {
    const item = this.getProductItemByName(productName);
    await this.actions.click(
      item.locator(this.itemActionButtonSelector),
      `Add to cart — ${productName}`,
    );
  }

  async removeFromCartByName(productName: string): Promise<void> {
    const item = this.getProductItemByName(productName);
    await this.actions.click(
      item.locator(this.itemActionButtonSelector),
      `Remove from cart — ${productName}`,
    );
  }

  async getProductNames(): Promise<string[]> {
    return this.actions.getAllTexts(this.productNames, 'product names');
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.actions.getAllTexts(this.productPrices, 'product prices');
    return texts.map((t) => CommonUtils.normalizePrice(t));
  }

  async getProductPriceByName(productName: string): Promise<number> {
    const item = this.getProductItemByName(productName);
    const text = await this.actions.getText(
      item.getByTestId('inventory-item-price'),
      `price — ${productName}`,
    );
    return CommonUtils.normalizePrice(text ?? '');
  }

  async getCartBadgeCount(): Promise<number> {
    return this.header.getCartCount();
  }

  async expectCartBadgeVisible(): Promise<void> {
    await this.header.expectCartBadgeVisible();
  }

  async expectCartBadgeHidden(): Promise<void> {
    await this.header.expectCartBadgeHidden();
  }

  async getMismatchedProductImageCount(
    expectedSlugByName: Record<string, string>,
  ): Promise<number> {
    const count = await this.productItems.count();
    let mismatches = 0;

    for (let i = 0; i < count; i++) {
      const item = this.productItems.nth(i);
      const name =
        (await this.actions.getText(item.getByTestId('inventory-item-name'), `product name ${i}`))
          ?.trim() ?? '';
      const src = await this.actions.getAttributeValue(
        item.locator(this.productImageSelector),
        'src',
        `product image for ${name}`,
      );
      const expectedSlug = expectedSlugByName[name];
      if (expectedSlug && src && !src.includes(expectedSlug)) {
        mismatches++;
      }
    }

    return mismatches;
  }

  async clickProduct(productName: string): Promise<void> {
    const link = this.productNames.filter({ hasText: productName });
    await this.actions.click(link, `product link — ${productName}`);
  }

  async getProductCount(): Promise<number> {
    return this.actions.getCount(this.productItems, 'inventory items');
  }

  async expectPageTitleVisible(): Promise<void> {
    await this.actions.expectVisible(this.pageTitle, 'inventory page title');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.actions.waitForVisible(this.pageTitle, 'inventory page title');
  }

  async goToCart(): Promise<void> {
    await this.header.goToCart();
  }

  async expectAddToCartShownForProduct(productName: string): Promise<void> {
    const item = this.getProductItemByName(productName);
    await this.actions.expectVisible(
      item.locator(this.addToCartButtonSelector),
      `add to cart — ${productName}`,
    );
  }

  async expectRemoveShownForProduct(productName: string): Promise<void> {
    const item = this.getProductItemByName(productName);
    await this.actions.expectVisible(
      item.locator(this.removeButtonSelector),
      `remove — ${productName}`,
    );
  }

  async expectRemoveHiddenForProduct(productName: string): Promise<void> {
    const item = this.getProductItemByName(productName);
    await this.actions.expectHidden(
      item.locator(this.removeButtonSelector),
      `remove — ${productName}`,
    );
  }
}
