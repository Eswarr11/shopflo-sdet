import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  private readonly productName: Locator;
  private readonly productDescription: Locator;
  private readonly productPrice: Locator;
  private readonly addToCartButton: Locator;
  private readonly removeButton: Locator;
  private readonly backButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productName = this.byTestId('inventory-item-name');
    this.productDescription = this.byTestId('inventory-item-desc');
    this.productPrice = this.byTestId('inventory-item-price');
    this.addToCartButton = this.byCss('[data-test^="add-to-cart"]');
    this.removeButton = this.byCss('[data-test^="remove"]');
    this.backButton = this.byTestId('back-to-products');
  }

  async getProductName(): Promise<string | null> {
    return this.actions.getText(this.productName, 'product name');
  }

  async getProductPrice(): Promise<number> {
    const text = await this.actions.getText(this.productPrice, 'product price');
    return parseFloat((text ?? '').replace('$', ''));
  }

  async addToCart(): Promise<void> {
    await this.actions.click(this.addToCartButton, 'add to cart button');
  }

  async expectDescriptionVisible(): Promise<void> {
    await this.actions.expectVisible(this.productDescription, 'product description');
  }

  async expectAddToCartButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.addToCartButton, 'add to cart button');
  }

  async expectAddToCartButtonHidden(): Promise<void> {
    await this.actions.expectHidden(this.addToCartButton, 'add to cart button');
  }

  async expectRemoveButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.removeButton, 'remove from cart button');
  }

  async goBack(): Promise<void> {
    await this.actions.click(this.backButton, 'back to products button');
  }
}
