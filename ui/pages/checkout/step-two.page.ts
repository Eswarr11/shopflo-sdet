import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { CommonUtils } from '../../../helpers/common-utils';

export class CheckoutStepTwoPage extends BasePage {
  private readonly SEL = {
    cartItems:      '.cart_item',
    cartItemNames:  'getByTestId("inventory-item-name")',
    cartItemPrices: 'getByTestId("inventory-item-price")',
    subtotalLabel:  'getByTestId("subtotal-label")',
    taxLabel:       'getByTestId("tax-label")',
    totalLabel:     'getByTestId("total-label")',
    finishButton:   'getByTestId("finish")',
  };

  constructor(page: Page) {
    super(page);
  }

  private getSummaryItemByName(productName: string): Locator {
    return this.page.locator(this.SEL.cartItems, { hasText: productName });
  }

  async getItemNames(): Promise<string[]> {
    return this.actions.getAllTexts(this.SEL.cartItemNames, 'order summary item names');
  }

  async getItemPriceByName(productName: string): Promise<number> {
    const item = this.getSummaryItemByName(productName);
    const text = await this.actions.getText(
      item.locator(this.toScopedSelector(this.SEL.cartItemPrices)),
      `summary price — ${productName}`,
    );
    return CommonUtils.normalizePrice(text ?? '');
  }

  async getSubtotal(): Promise<number> {
    const text = await this.actions.getText(this.SEL.subtotalLabel, 'subtotal label');
    return CommonUtils.normalizePrice(text ?? '');
  }

  async getTax(): Promise<number> {
    const text = await this.actions.getText(this.SEL.taxLabel, 'tax label');
    return CommonUtils.normalizePrice(text ?? '');
  }

  async getTotal(): Promise<number> {
    const text = await this.actions.getText(this.SEL.totalLabel, 'total label');
    return CommonUtils.normalizePrice(text ?? '');
  }

  async finish(): Promise<void> {
    await this.actions.click(this.SEL.finishButton, 'finish button');
  }

  async isFinishButtonVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.finishButton, 'finish button');
  }

  async getItemCount(): Promise<number> {
    return this.actions.getCount(this.SEL.cartItems, 'summary items');
  }
}
