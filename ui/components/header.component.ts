import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';

export class HeaderComponent extends BasePage {
  private readonly SEL = {
    cartBadge: 'getByTestId("shopping-cart-badge")',
    cartLink: 'getByTestId("shopping-cart-link")',
    burgerMenuButton: '#react-burger-menu-btn',
  };

  constructor(page: Page) {
    super(page);
  }

  async getCartCount(): Promise<number> {
    const visible = await this.actions.isVisible(this.SEL.cartBadge, 'cart badge');
    if (!visible) return 0;
    const text = await this.actions.getText(this.SEL.cartBadge, 'cart badge count');
    return parseInt(text ?? '0', 10);
  }

  async isCartBadgeVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.cartBadge, 'cart badge');
  }

  async openBurgerMenu(): Promise<void> {
    await this.actions.click(this.SEL.burgerMenuButton, 'burger menu button');
  }

  async goToCart(): Promise<void> {
    await this.actions.click(this.SEL.cartLink, 'cart link');
  }
}
