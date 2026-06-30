import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class ProductDetailPage extends BasePage {
  private readonly SEL = {
    productName:        'getByTestId("inventory-item-name")',
    productDescription: 'getByTestId("inventory-item-desc")',
    productPrice:       'getByTestId("inventory-item-price")',
    addToCartButton:    '[data-test^="add-to-cart"]',
    removeButton:       '[data-test^="remove"]',
    backButton:         'getByTestId("back-to-products")',
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

  async isDescriptionVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.productDescription, 'product description');
  }

  async isAddToCartButtonVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.addToCartButton, 'add to cart button');
  }

  async isRemoveButtonVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.removeButton, 'remove from cart button');
  }

  async goBack(): Promise<void> {
    await this.actions.click(this.SEL.backButton, 'back to products button');
  }
}
