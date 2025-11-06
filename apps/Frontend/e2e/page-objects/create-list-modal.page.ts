import { Locator, Page } from '@playwright/test';

export class CreateListModalPage {
  private readonly submitButton: Locator;

  constructor(private page: Page) {
    this.submitButton =  this.page.getByTestId('create-list-submit-button');
  }

  // Actions
  async fillListName(name: string) {
    await this.page.getByTestId('create-list-name-input').fill(name);
  }

  async clickSubmit() {
    await this.page.getByTestId('create-list-submit-button').click();
  }

  async clickCancel() {
    await this.page.getByTestId('create-list-cancel-button').click();
  }

  async createList(name: string) {
    await this.fillListName(name);

    // Trigger blur to ensure Angular form validation runs
    await this.page.getByTestId('create-list-name-input').blur();

    // Wait for the submit button to be enabled (Angular form validation)
    await this.submitButton.waitFor({ state: 'visible', timeout: 5000 });
    await this.page.waitForFunction(
      () => {
        const button = document.querySelector('[data-testid="create-list-submit-button"]') as HTMLButtonElement;
        return button && !button.disabled;
      },
      { timeout: 5000 }
    );

    await this.submitButton.click();
  }

  // State
  async isModalVisible() {
    return await this.page.getByTestId('create-list-form').isVisible();
  }

  async isSubmitButtonEnabled() {
    return await this.page.getByTestId('create-list-submit-button').isEnabled();
  }

  async waitForModalToClose() {
    // Wait for the Material Dialog backdrop to be removed from the DOM
    // This is more reliable than waiting for the form to be hidden due to dialog animations
    await this.page.waitForSelector('.cdk-overlay-backdrop', { state: 'detached', timeout: 5000 });
    // Also wait for the dialog container to be removed
    await this.page.waitForSelector('.mat-mdc-dialog-container', { state: 'detached', timeout: 5000 });
  }
}
