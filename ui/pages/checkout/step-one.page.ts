import { Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class CheckoutStepOnePage extends BasePage {
  private readonly SEL = {
    firstNameInput: 'getByTestId("firstName")',
    lastNameInput: 'getByTestId("lastName")',
    zipCodeInput: 'getByTestId("postalCode")',
    continueButton: 'getByTestId("continue")',
    cancelButton: 'getByTestId("cancel")',
    errorMessage: 'getByTestId("error")',
  };

  constructor(page: Page) {
    super(page);
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.actions.clearAndFill(this.SEL.firstNameInput, firstName, 'first name');
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.actions.clearAndFill(this.SEL.lastNameInput, lastName, 'last name');
  }

  async fillZipCode(zipCode: string): Promise<void> {
    await this.actions.clearAndFill(this.SEL.zipCodeInput, zipCode, 'zip code');
  }

  async fillShippingInfo(firstName: string, lastName: string, zipCode: string): Promise<void> {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillZipCode(zipCode);
  }

  async continue(): Promise<void> {
    await this.actions.click(this.SEL.continueButton, 'continue button');
  }

  async cancel(): Promise<void> {
    await this.actions.click(this.SEL.cancelButton, 'cancel button');
  }

  async getErrorMessage(): Promise<string | null> {
    return this.actions.getText(this.SEL.errorMessage, 'checkout error message');
  }

  isErrorVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.errorMessage, 'checkout error message');
  }

  async isLastNameEditable(): Promise<boolean> {
    return this.actions.isEditable(this.SEL.lastNameInput, 'last name field');
  }

  async isFirstNameVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.firstNameInput, 'first name field');
  }

  async isLastNameVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.lastNameInput, 'last name field');
  }

  async isZipCodeVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.zipCodeInput, 'zip code field');
  }

  async isContinueButtonVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.continueButton, 'continue button');
  }

  async isCancelButtonVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.cancelButton, 'cancel button');
  }
}
