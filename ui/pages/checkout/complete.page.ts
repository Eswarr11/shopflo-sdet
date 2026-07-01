import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class CheckoutCompletePage extends BasePage {
  private readonly SEL = {
    successHeader: 'getByTestId("complete-header")',
    successText: 'getByTestId("complete-text")',
    backHomeButton: 'getByTestId("back-to-products")',
  };

  constructor(page: Page) {
    super(page);
  }

  async getSuccessHeader(): Promise<string | null> {
    return this.actions.getText(this.SEL.successHeader, 'success header');
  }

  async expectSuccessHeaderVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.successHeader, 'success header');
  }

  async getSuccessText(): Promise<string | null> {
    return this.actions.getText(this.SEL.successText, 'success text');
  }

  async expectBackHomeButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.backHomeButton, 'back home button');
  }
}
