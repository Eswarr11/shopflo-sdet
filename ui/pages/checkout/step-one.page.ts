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

  async expectErrorVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.errorMessage, 'checkout error message');
  }

  async expectErrorHidden(): Promise<void> {
    await this.actions.expectHidden(this.SEL.errorMessage, 'checkout error message');
  }

  async expectLastNameEditable(): Promise<void> {
    await this.actions.expectEditable(this.SEL.lastNameInput, 'last name field');
  }

  async getLastNameValue(): Promise<string> {
    return this.actions.getInputValue(this.SEL.lastNameInput, 'last name field');
  }

  async expectFirstNameVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.firstNameInput, 'first name field');
  }

  async expectLastNameVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.lastNameInput, 'last name field');
  }

  async expectZipCodeVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.zipCodeInput, 'zip code field');
  }

  async expectContinueButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.continueButton, 'continue button');
  }

  async expectCancelButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.SEL.cancelButton, 'cancel button');
  }
}
