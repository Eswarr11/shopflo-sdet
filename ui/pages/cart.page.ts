import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  private readonly SEL = {
    cartItems: '.cart_item',
    cartItemNames: 'getByTestId("inventory-item-name")',
    continueShoppingButton: 'getByTestId("continue-shopping")',
    checkoutButton: 'getByTestId("checkout")',
    pageTitle: 'getByTestId("title")',
    removeButton: '[data-test^="remove"]',
  };

  constructor(page: Page) {
    super(page);
  }

  private getCartItemByName(productName: string): Locator {
    return this.page.locator(this.SEL.cartItems, { hasText: productName });
  }

  async goto(): Promise<void> {
    await this.navigate('/cart.html');
  }

  async getCartItemNames(): Promise<string[]> {
    return this.actions.getAllTexts(this.SEL.cartItemNames, 'cart item names');
  }

  async getCartItemCount(): Promise<number> {
    return this.actions.getCount(this.SEL.cartItems, 'cart items');
  }

  async removeItem(productName: string): Promise<void> {
    const item = this.getCartItemByName(productName);
    await this.actions.click(item.locator(this.SEL.removeButton), `remove — ${productName}`);
  }

  async continueShopping(): Promise<void> {
    await this.actions.click(this.SEL.continueShoppingButton, 'continue shopping button');
  }

  async isTitleVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.pageTitle, 'cart page title');
  }

  async isCheckoutButtonVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.checkoutButton, 'checkout button');
  }

  async proceedToCheckout(): Promise<void> {
    await this.actions.click(this.SEL.checkoutButton, 'checkout button');
  }
}
