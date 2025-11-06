import { Page } from '@playwright/test';

export class ListsPage {
  constructor(private page: Page) {}

  // Actions
  async navigateToLists() {
    await this.page.goto('http://localhost:4200/lists');
    await this.waitForPageToLoad();
  }

  async waitForPageToLoad() {
    // Wait for the skeleton loader to disappear (loading state to finish)
    await this.page.waitForSelector('[data-testid="skeleton-loader"]', {
      state: 'hidden',
      timeout: 10000
    }).catch(() => {
      // If skeleton loader doesn't exist, that's fine - page might have loaded quickly
    });

    // Wait for either lists to appear or empty state to show
    await Promise.race([
      this.page.waitForSelector('[data-testid="shopping-list-item"]', { timeout: 5000 }).catch(() => {}),
      this.page.waitForSelector('[data-testid="empty-state"]', { timeout: 5000 }).catch(() => {})
    ]);
  }

  async clickCreateList() {
    await this.page.getByTestId('create-list-button').click();
  }

  async clickListByName(name: string) {
    const listItems = this.page.getByTestId('shopping-list-item');
    const count = await listItems.count();

    for (let i = 0; i < count; i++) {
      const listItem = listItems.nth(i);
      const listName = await listItem.getByTestId('shopping-list-name').textContent();
      if (listName?.trim() === name) {
        await listItem.click();
        break;
      }
    }
  }

  // State
  async isListPresent(name: string) {
    const listNames = this.page.getByTestId('shopping-list-name');
    const count = await listNames.count();

    for (let i = 0; i < count; i++) {
      const text = await listNames.nth(i).textContent();
      if (text?.trim() === name) {
        return true;
      }
    }
    return false;
  }

  async getListsCount() {
    return await this.page.getByTestId('shopping-list-item').count();
  }
}
