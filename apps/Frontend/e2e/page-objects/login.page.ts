import { Page } from '@playwright/test';

export class LoginPage {
  constructor(private page: Page) {}

  // Actions
  async navigateToLogin() {
    await this.page.goto('http://localhost:4200/auth/login');
  }

  async login(email: string, password: string) {
    await this.page.getByTestId('login-email-input').fill(email);
    await this.page.getByTestId('login-password-input').fill(password);
    await this.page.getByTestId('login-submit-button').click();

    // Wait for navigation to complete after login
    await this.page.waitForURL('**/lists', { timeout: 10000 });
  }

  // State
  async isFormVisible() {
    return await this.page.getByTestId('login-form').isVisible();
  }
}
