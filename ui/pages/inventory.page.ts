import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';
import { CommonUtils } from '../../helpers/common-utils';

export class InventoryPage extends BasePage {
  private readonly header: HeaderComponent;

  private readonly SEL = {
    sortDropdown: 'getByTestId("product-sort-container")',
    productItems: '.inventory_item',
    productNames: 'getByTestId("inventory-item-name")',
    productPrices: 'getByTestId("inventory-item-price")',
    pageTitle:    'getByTestId("title")',
    itemActionButton: 'button',
    productImage: 'img',
  };

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
  }

  private getProductItemByName(productName: string): Locator {
    return this.page.locator(this.SEL.productItems, { hasText: productName });
  }

  async goto(): Promise<void> {
    await this.navigate('/inventory.html');
  }

  async sortBy(option: string): Promise<void> {
    await this.actions.selectOption(this.SEL.sortDropdown, option, 'sort dropdown');
  }

  async addToCartByName(productName: string): Promise<void> {
    const item = this.getProductItemByName(productName);
    await this.actions.click(item.locator(this.SEL.itemActionButton), `Add to cart — ${productName}`);
  }

  async removeFromCartByName(productName: string): Promise<void> {
    const item = this.getProductItemByName(productName);
    await this.actions.click(item.locator(this.SEL.itemActionButton), `Remove from cart — ${productName}`);
  }

  async getProductNames(): Promise<string[]> {
    return this.actions.getAllTexts(this.SEL.productNames, 'product names');
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.actions.getAllTexts(this.SEL.productPrices, 'product prices');
    return texts.map((t) => CommonUtils.normalizePrice(t));
  }

  async getProductPriceByName(productName: string): Promise<number> {
    const item = this.getProductItemByName(productName);
    const text = await this.actions.getText(
      item.locator(this.toScopedSelector(this.SEL.productPrices)),
      `price — ${productName}`,
    );
    return CommonUtils.normalizePrice(text ?? '');
  }

  async getCartBadgeCount(): Promise<number> {
    return this.header.getCartCount();
  }

  async isCartBadgeVisible(): Promise<boolean> {
    return this.header.isCartBadgeVisible();
  }

  async getMismatchedProductImageCount(expectedSlugByName: Record<string, string>): Promise<number> {
    const items = this.page.locator(this.SEL.productItems);
    const count = await items.count();
    let mismatches = 0;

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const name = (await this.actions.getText(
        item.locator(this.toScopedSelector(this.SEL.productNames)),
        `product name ${i}`,
      ))?.trim() ?? '';
      const src = await this.actions.getAttributeValue(
        item.locator(this.SEL.productImage),
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
    const link = this.page.locator(
      this.toScopedSelector(this.SEL.productNames),
      { hasText: productName },
    );
    await this.actions.click(link, `product link — ${productName}`);
  }

  async getProductCount(): Promise<number> {
    return this.actions.getCount(this.SEL.productItems, 'inventory items');
  }

  async isPageTitleVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.pageTitle, 'inventory page title');
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
    await this.actions.waitForVisible(this.SEL.pageTitle, 'inventory page title');
  }

  async goToCart(): Promise<void> {
    await this.header.goToCart();
  }
}
