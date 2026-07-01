import { Page } from '@playwright/test';
import { PwActions } from '@helpers/pw-actions';

export class BasePage {
  protected page: Page;
  protected actions: PwActions;

  constructor(page: Page) {
    this.page = page;
    this.actions = new PwActions(page);
  }

  async navigate(path = ''): Promise<void> {
    await this.actions.goto(path);
  }

  async waitForLoad(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }

  protected toScopedSelector(selector: string): string {
    const match = selector.match(/^getByTestId\(['"](.+)['"]\)$/);
    return match ? `[data-test="${match[1]}"]` : selector;
  }
}
