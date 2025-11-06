import { Page } from '@playwright/test';

export class ListDetailsPage {
  constructor(private page: Page) {}

  // Actions
  async addItem(name: string, description?: string) {
    await this.page.getByTestId('add-item-name-input').fill(name);
    if (description) {
      await this.page.getByTestId('add-item-description-input').fill(description);
    }
    await this.page.getByTestId('add-item-submit-button').click();
  }

  async markItemAsBought(itemName: string) {
    const items = this.page.getByTestId('product-item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const name = await item.getByTestId('product-name').textContent();
      if (name?.trim() === itemName) {
        await item.getByTestId('product-checkbox').click();
        break;
      }
    }
  }

  async getItemDescription(itemName: string) {
    const items = this.page.getByTestId('product-item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const name = await item.getByTestId('product-name').textContent();
      if (name?.trim() === itemName) {
        const description = await item.getByTestId('product-description').textContent();
        return description?.trim();
      }
    }
    return null;
  }

  // State
  async isItemBought(itemName: string) {
    const items = this.page.getByTestId('product-item');
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const name = await item.getByTestId('product-name').textContent();
      if (name?.trim() === itemName) {
        const checkbox = item.getByTestId('product-checkbox');
        return await checkbox.isChecked();
      }
    }
    return false;
  }

  async getItemsCount() {
    return await this.page.getByTestId('product-item').count();
  }
}
