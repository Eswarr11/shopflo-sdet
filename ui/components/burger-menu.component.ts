import { Locator, Page } from '@playwright/test';
import { BasePage } from '../pages/base.page';

export class BurgerMenuComponent extends BasePage {
  private readonly allItemsLink: Locator;
  private readonly aboutLink: Locator;
  private readonly logoutLink: Locator;
  private readonly resetLink: Locator;
  private readonly closeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.allItemsLink = this.byTestId('inventory-sidebar-link');
    this.aboutLink = this.byTestId('about-sidebar-link');
    this.logoutLink = this.byTestId('logout-sidebar-link');
    this.resetLink = this.byTestId('reset-sidebar-link');
    this.closeButton = this.byCss('#react-burger-cross-btn');
  }

  async clickAllItems(): Promise<void> {
    await this.actions.click(this.allItemsLink, 'All Items link');
  }

  async clickLogout(): Promise<void> {
    await this.actions.click(this.logoutLink, 'Logout link');
  }

  async clickResetAppState(): Promise<void> {
    await this.actions.click(this.resetLink, 'Reset App State link');
  }

  async close(): Promise<void> {
    await this.actions.click(this.closeButton, 'burger menu close button');
  }

  async expectLogoutLinkVisible(): Promise<void> {
    await this.actions.expectVisible(this.logoutLink, 'Logout link');
  }
}
