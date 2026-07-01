import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class CartPage extends BasePage {
  private readonly cartItems: Locator;
  private readonly cartItemNames: Locator;
  private readonly continueShoppingButton: Locator;
  private readonly checkoutButton: Locator;
  private readonly pageTitle: Locator;
  private readonly removeButton: Locator;
  private readonly removeButtonSelector = '[data-test^="remove"]';

  constructor(page: Page) {
    super(page);
    this.cartItems = this.byCss('.cart_item');
    this.cartItemNames = this.byTestId('inventory-item-name');
    this.continueShoppingButton = this.byTestId('continue-shopping');
    this.checkoutButton = this.byTestId('checkout');
    this.pageTitle = this.byTestId('title');
    this.removeButton = this.byCss(this.removeButtonSelector);
  }

  private getCartItemByName(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  async goto(): Promise<void> {
    await this.navigate('/cart.html');
  }

  async getCartItemNames(): Promise<string[]> {
    return this.actions.getAllTexts(this.cartItemNames, 'cart item names');
  }

  async getCartItemCount(): Promise<number> {
    return this.actions.getCount(this.cartItems, 'cart items');
  }

  async removeItem(productName: string): Promise<void> {
    const item = this.getCartItemByName(productName);
    await this.actions.click(item.locator(this.removeButtonSelector), `remove — ${productName}`);
  }

  async continueShopping(): Promise<void> {
    await this.actions.click(this.continueShoppingButton, 'continue shopping button');
  }

  async expectTitleVisible(): Promise<void> {
    await this.actions.expectVisible(this.pageTitle, 'cart page title');
  }

  async expectCheckoutButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.checkoutButton, 'checkout button');
  }

  async proceedToCheckout(): Promise<void> {
    await this.actions.click(this.checkoutButton, 'checkout button');
  }
}
