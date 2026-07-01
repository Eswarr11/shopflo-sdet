import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { CommonUtils } from '@helpers/common-utils';

export class CheckoutStepTwoPage extends BasePage {
  private readonly cartItems: Locator;
  private readonly cartItemNames: Locator;
  private readonly subtotalLabel: Locator;
  private readonly taxLabel: Locator;
  private readonly totalLabel: Locator;
  private readonly finishButton: Locator;
  private readonly cancelButton: Locator;

  constructor(page: Page) {
    super(page);
    this.cartItems = this.byCss('.cart_item');
    this.cartItemNames = this.byTestId('inventory-item-name');
    this.subtotalLabel = this.byTestId('subtotal-label');
    this.taxLabel = this.byTestId('tax-label');
    this.totalLabel = this.byTestId('total-label');
    this.finishButton = this.byTestId('finish');
    this.cancelButton = this.byTestId('cancel');
  }

  private getSummaryItemByName(productName: string): Locator {
    return this.cartItems.filter({ hasText: productName });
  }

  async getItemNames(): Promise<string[]> {
    return this.actions.getAllTexts(this.cartItemNames, 'order summary item names');
  }

  async getItemPriceByName(productName: string): Promise<number> {
    const item = this.getSummaryItemByName(productName);
    const text = await this.actions.getText(
      item.getByTestId('inventory-item-price'),
      `summary price — ${productName}`,
    );
    return CommonUtils.normalizePrice(text ?? '');
  }

  async getSubtotal(): Promise<number> {
    const text = await this.actions.getText(this.subtotalLabel, 'subtotal label');
    return CommonUtils.normalizePrice(text ?? '');
  }

  async getTax(): Promise<number> {
    const text = await this.actions.getText(this.taxLabel, 'tax label');
    return CommonUtils.normalizePrice(text ?? '');
  }

  async getTotal(): Promise<number> {
    const text = await this.actions.getText(this.totalLabel, 'total label');
    return CommonUtils.normalizePrice(text ?? '');
  }

  async finish(): Promise<void> {
    await this.actions.click(this.finishButton, 'finish button');
  }

  async cancel(): Promise<void> {
    await this.actions.click(this.cancelButton, 'cancel button');
  }

  async expectFinishButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.finishButton, 'finish button');
  }

  async getItemCount(): Promise<number> {
    return this.actions.getCount(this.cartItems, 'summary items');
  }
}
