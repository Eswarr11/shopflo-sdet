import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class CheckoutCompletePage extends BasePage {
  private readonly successHeader: Locator;
  private readonly successText: Locator;
  private readonly backHomeButton: Locator;

  constructor(page: Page) {
    super(page);
    this.successHeader = this.byTestId('complete-header');
    this.successText = this.byTestId('complete-text');
    this.backHomeButton = this.byTestId('back-to-products');
  }

  async getSuccessHeader(): Promise<string | null> {
    return this.actions.getText(this.successHeader, 'success header');
  }

  async expectSuccessHeaderVisible(): Promise<void> {
    await this.actions.expectVisible(this.successHeader, 'success header');
  }

  async getSuccessText(): Promise<string | null> {
    return this.actions.getText(this.successText, 'success text');
  }

  async expectBackHomeButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.backHomeButton, 'back home button');
  }
}
