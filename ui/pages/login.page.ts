import { Page } from '@playwright/test';
import { BasePage } from './base.page';

export class LoginPage extends BasePage {
  private readonly SEL = {
    username: 'getByTestId("username")',
    password: 'getByTestId("password")',
    loginButton: 'getByTestId("login-button")',
    error: 'getByTestId("error")',
  };

  constructor(page: Page) {
    super(page);
  }

  async goto(): Promise<void> {
    await this.navigate('/');
  }

  async login(username: string, password: string): Promise<void> {
    await this.actions.clearAndFill(this.SEL.username, username, 'username field');
    await this.actions.clearAndFill(this.SEL.password, password, 'password field');
    await this.actions.click(this.SEL.loginButton, 'login button');
  }

  async getErrorMessage(): Promise<string | null> {
    return this.actions.getText(this.SEL.error, 'login error message');
  }

  async isErrorVisible(): Promise<boolean> {
    return this.actions.isVisible(this.SEL.error, 'login error message');
  }
}
