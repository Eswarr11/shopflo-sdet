import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  private readonly SEL = {
    productName: 'getByTestId("inventory-item-name")',
    productDescription: 'getByTestId("inventory-item-desc")',
    productPrice: 'getByTestId("inventory-item-price")',
    addToCartButton: '[data-test^="add-to-cart"]',
    removeButton: '[data-test^="remove"]',
    backButton: 'getByTestId("back-to-products")',
  };

  constructor(page: Page) {
    super(page);
  }

  async getProductName(): Promise<string | null> {
    return this.actions.getText(this.SEL.productName, 'product name');
  }

  async getProductPrice(): Promise<number> {
    const text = await this.actions.getText(this.SEL.productPrice, 'product price');
    return parseFloat((text ?? '').replace('$', ''));
  }

  async addToCart(): Promise<void> {
    await this.actions.click(this.SEL.addToCartButton, 'add to cart button');
  }

  async expectDescriptionVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.productDescription, 'product description');
  }

  async expectAddToCartButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.addToCartButton, 'add to cart button');
  }

  async expectAddToCartButtonHidden(): Promise<void> {
    await this.actions.expectHidden(this.SEL.addToCartButton, 'add to cart button');
  }

  async expectRemoveButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.removeButton, 'remove from cart button');
  }

  async goBack(): Promise<void> {
    await this.actions.click(this.SEL.backButton, 'back to products button');
  }
}
