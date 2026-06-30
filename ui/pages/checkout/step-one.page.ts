import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class CheckoutStepOnePage extends BasePage {
  private readonly SEL = {
    firstNameInput: 'getByTestId("firstName")',
    lastNameInput:  'getByTestId("lastName")',
    zipCodeInput:   'getByTestId("postalCode")',
    continueButton: 'getByTestId("continue")',
    errorMessage:   'getByTestId("error")',
  };

  constructor(page: Page) {
    super(page);
  }

  async fillShippingInfo(firstName: string, lastName: string, zipCode: string): Promise<void> {
    await this.actions.clearAndFill(this.SEL.firstNameInput, firstName, 'first name');
    await this.actions.clearAndFill(this.SEL.lastNameInput, lastName, 'last name');
    await this.actions.clearAndFill(this.SEL.zipCodeInput, zipCode, 'zip code');
  }

  async continue(): Promise<void> {
    await this.actions.click(this.SEL.continueButton, 'continue button');
  }

  async getErrorMessage(): Promise<string | null> {
    return this.actions.getText(this.SEL.errorMessage, 'checkout error message');
  }

  isErrorVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.errorMessage, 'checkout error message');
  }
}
