import { Locator, Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';

export class HeaderComponent extends BasePage {
  private readonly cartBadge: Locator;
  private readonly cartLink: Locator;
  private readonly burgerMenuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartBadge = this.byTestId('shopping-cart-badge');
    this.cartLink = this.byTestId('shopping-cart-link');
    this.burgerMenuButton = this.byCss('#react-burger-menu-btn');
  }

  async getCartCount(): Promise<number> {
    const visible = await this.actions.isVisible(this.cartBadge, 'cart badge');
    if (!visible) return 0;
    const text = await this.actions.getText(this.cartBadge, 'cart badge count');
    return parseInt(text ?? '0', 10);
  }

  async expectCartBadgeVisible(): Promise<void> {
    await this.actions.expectVisible(this.cartBadge, 'cart badge');
  }

  async expectCartBadgeHidden(): Promise<void> {
    await this.actions.expectHidden(this.cartBadge, 'cart badge');
  }

  async openBurgerMenu(): Promise<void> {
    await this.actions.click(this.burgerMenuButton, 'burger menu button');
  }

  async goToCart(): Promise<void> {
    await this.actions.click(this.cartLink, 'cart link');
  }
}
