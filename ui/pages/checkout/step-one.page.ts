import { Locator, Page } from '@playwright/test';
import { BasePage } from '../base.page';

export class CheckoutStepOnePage extends BasePage {
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly zipCodeInput: Locator;
  private readonly continueButton: Locator;
  private readonly cancelButton: Locator;
  private readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = this.byTestId('firstName');
    this.lastNameInput = this.byTestId('lastName');
    this.zipCodeInput = this.byTestId('postalCode');
    this.continueButton = this.byTestId('continue');
    this.cancelButton = this.byTestId('cancel');
    this.errorMessage = this.byTestId('error');
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.actions.clearAndFill(this.firstNameInput, firstName, 'first name');
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.actions.clearAndFill(this.lastNameInput, lastName, 'last name');
  }

  async fillZipCode(zipCode: string): Promise<void> {
    await this.actions.clearAndFill(this.zipCodeInput, zipCode, 'zip code');
  }

  async fillShippingInfo(firstName: string, lastName: string, zipCode: string): Promise<void> {
    await this.fillFirstName(firstName);
    await this.fillLastName(lastName);
    await this.fillZipCode(zipCode);
  }

  async continue(): Promise<void> {
    await this.actions.click(this.continueButton, 'continue button');
  }

  async cancel(): Promise<void> {
    await this.actions.click(this.cancelButton, 'cancel button');
  }

  async getErrorMessage(): Promise<string | null> {
    return this.actions.getText(this.errorMessage, 'checkout error message');
  }

  async expectErrorVisible(): Promise<void> {
    await this.actions.expectVisible(this.errorMessage, 'checkout error message');
  }

  async expectErrorHidden(): Promise<void> {
    await this.actions.expectHidden(this.errorMessage, 'checkout error message');
  }

  async expectLastNameEditable(): Promise<void> {
    await this.actions.expectEditable(this.lastNameInput, 'last name field');
  }

  async getLastNameValue(): Promise<string> {
    return this.actions.getInputValue(this.lastNameInput, 'last name field');
  }

  async expectFirstNameVisible(): Promise<void> {
    await this.actions.expectVisible(this.firstNameInput, 'first name field');
  }

  async expectLastNameVisible(): Promise<void> {
    await this.actions.expectVisible(this.lastNameInput, 'last name field');
  }

  async expectZipCodeVisible(): Promise<void> {
    await this.actions.expectVisible(this.zipCodeInput, 'zip code field');
  }

  async expectContinueButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.continueButton, 'continue button');
  }

  async expectCancelButtonVisible(): Promise<void> {
    await this.actions.expectVisible(this.cancelButton, 'cancel button');
  }
}
