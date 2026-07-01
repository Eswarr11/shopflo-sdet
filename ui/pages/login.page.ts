import { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly username: Locator;
  private readonly password: Locator;
  private readonly loginButton: Locator;
  private readonly error: Locator;

  constructor(page: Page) {
    super(page);
    this.username = this.byTestId('username');
    this.password = this.byTestId('password');
    this.loginButton = this.byTestId('login-button');
    this.error = this.byTestId('error');
  }

  async goto(): Promise<void> {
    await this.navigate('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.actions.clearAndFill(this.username, username, 'username field');
    await this.actions.clearAndFill(this.password, password, 'password field');
    await this.actions.click(this.loginButton, 'login button');
  }

  async getErrorMessage(): Promise<string | null> {
    return this.actions.getText(this.error, 'login error message');
  }

  async expectErrorVisible(): Promise<void> {
    await this.actions.expectVisible(this.error, 'login error message');
  }

  async expectErrorHidden(): Promise<void> {
    await this.actions.expectHidden(this.error, 'login error message');
  }
}
