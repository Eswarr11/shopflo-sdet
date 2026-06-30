import { Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';

export class BurgerMenuComponent extends BasePage {
  private readonly SEL = {
    allItemsLink: 'getByTestId("inventory-sidebar-link")',
    aboutLink: 'getByTestId("about-sidebar-link")',
    logoutLink: 'getByTestId("logout-sidebar-link")',
    resetLink: 'getByTestId("reset-sidebar-link")',
    closeButton: '#react-burger-cross-btn',
  };

  constructor(page: Page) {
    super(page);
  }

  async clickAllItems(): Promise<void> {
    await this.actions.click(this.SEL.allItemsLink, 'All Items link');
  }

  async clickLogout(): Promise<void> {
    await this.actions.click(this.SEL.logoutLink, 'Logout link');
  }

  async clickResetAppState(): Promise<void> {
    await this.actions.click(this.SEL.resetLink, 'Reset App State link');
  }

  async close(): Promise<void> {
    await this.actions.click(this.SEL.closeButton, 'burger menu close button');
  }

  async isLogoutLinkVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.logoutLink, 'Logout link');
  }
}
