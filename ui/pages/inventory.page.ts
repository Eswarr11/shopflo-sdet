import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { HeaderComponent } from '../components/header.component';

export class InventoryPage extends BasePage {
  private readonly header: HeaderComponent;

  private readonly SEL = {
    sortDropdown: 'getByTestId("product-sort-container")',
    productItems: '.inventory_item',
    productNames: 'getByTestId("inventory-item-name")',
    productPrices: 'getByTestId("inventory-item-price")',
    pageTitle:    'getByTestId("title")',
  };

  constructor(page: Page) {
    super(page);
    this.header = new HeaderComponent(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/inventory.html');
  }

  async sortBy(option: string): Promise<void> {
    await this.actions.selectOption(this.SEL.sortDropdown, option, 'sort dropdown');
  }

  async addToCartByName(productName: string): Promise<void> {
    const item = this.page.locator('.inventory_item', { hasText: productName });
    await this.actions.click(item.locator('button'), `Add to cart — ${productName}`);
  }

  async removeFromCartByName(productName: string): Promise<void> {
    const item = this.page.locator('.inventory_item', { hasText: productName });
    await this.actions.click(item.locator('button'), `Remove from cart — ${productName}`);
  }

  async getProductNames(): Promise<string[]> {
    return this.actions.getAllTexts(this.SEL.productNames, 'product names');
  }

  async getProductPrices(): Promise<number[]> {
    const texts = await this.actions.getAllTexts(this.SEL.productPrices, 'product prices');
    return texts.map((t) => parseFloat(t.replace('$', '')));
  }

  async getCartBadgeCount(): Promise<number> {
    return this.header.getCartCount();
  }

  async isCartBadgeVisible(): Promise<boolean> {
    return this.header.isCartBadgeVisible();
  }

  async getProductImageNaturalWidths(): Promise<number[]> {
    const images = this.page.locator('.inventory_item img');
    const count = await images.count();
    const widths: number[] = [];
    for (let i = 0; i < count; i++) {
      await this.actions.getAttributeValue(images.nth(i), 'src', `product image ${i}`);
      widths.push(await images.nth(i).evaluate((img) => (img as HTMLImageElement).naturalWidth));
    }
    return widths;
  }

  async clickProduct(productName: string): Promise<void> {
    const link = this.page.locator('[data-test="inventory-item-name"]', { hasText: productName });
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
