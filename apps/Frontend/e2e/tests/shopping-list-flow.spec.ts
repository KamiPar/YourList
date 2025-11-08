import { test, expect } from '@playwright/test';
import { LoginPage } from '../page-objects/login.page';
import { ListsPage } from '../page-objects/lists.page';
import { ListDetailsPage } from '../page-objects/list-details.page';
import { CreateListModalPage } from '../page-objects/create-list-modal.page';

test.describe('Shopping List Flow', () => {
  let loginPage: LoginPage;
  let listsPage: ListsPage;
  let listDetailsPage: ListDetailsPage;
  let createListModalPage: CreateListModalPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    listsPage = new ListsPage(page);
    listDetailsPage = new ListDetailsPage(page);
    createListModalPage = new CreateListModalPage(page);
  });

  test('complete shopping list flow', async ({ page }) => {
    // 1. Login (automatically navigates to /lists)
    await loginPage.navigateToLogin();
    await loginPage.login('kamil1@gmail.com', 'Kamil123');

    // 2. Wait for lists page to load and verify we can see existing lists or empty state
    await listsPage.waitForPageToLoad();

    // Verify we're on the lists page and can see the create button
    await expect(page.getByTestId('create-list-button')).toBeVisible();

    // Check if there are existing lists
    const listsCount = await listsPage.getListsCount();

    // 3. Create new list
    await listsPage.clickCreateList();
    const newListName = `Test Shopping List ${Date.now()}`;
    await createListModalPage.createList(newListName);
    await createListModalPage.waitForModalToClose();

    // 4. Verify list was created and click on it
    await page.waitForTimeout(1000); // Wait for list to appear in the UI
    await listsPage.clickListByName(newListName);

    // 5. Wait for list details page to load
    await page.waitForSelector('[data-testid="add-item-form"]', { timeout: 5000 });

    // 6. Add an item to the list
    const itemName = 'Milk';
    const itemDescription = 'Fresh whole milk';
    await listDetailsPage.addItem(itemName, itemDescription);

    // Wait for item to appear
    await page.waitForTimeout(1000);

    // 7. Mark item as bought
    await listDetailsPage.markItemAsBought(itemName);

    // Wait for checkbox state to update
    await page.waitForTimeout(500);

    // Verify item is marked as bought
    await expect(await listDetailsPage.isItemBought(itemName)).toBeTruthy();

    // Verify item description
    const description = await listDetailsPage.getItemDescription(itemName);
    expect(description).toBe(itemDescription);
  });
});
