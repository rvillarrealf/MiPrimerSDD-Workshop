import { expect, test } from '@playwright/test';

async function startActionCount(page) {
  await page.evaluate(() => {
    window.__actionCount = 0;
    document.addEventListener('click', (event) => {
      if (event.target.closest('button')) {
        window.__actionCount += 1;
      }
    }, true);
  });
}

async function getActionCount(page) {
  return page.evaluate(() => window.__actionCount);
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByLabel('Title').fill('Original');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: /Original/ }).click();
});

test('shows detail and the empty-description label', async ({ page }) => {
  await expect(page.getByText('No description')).toBeVisible();
  await expect(page.getByText('Pending', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Back' })).toBeVisible();
});

test('edits and cancels task changes with validation', async ({ page }) => {
  await startActionCount(page);
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Title').fill('Updated');
  await page.getByLabel('Description').fill('A description');
  await page.getByRole('button', { name: 'Save' }).click();
  expect(await getActionCount(page)).toBeLessThanOrEqual(3);
  await expect(page.getByRole('heading', { name: 'Updated' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Title').fill('   ');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/title is required/i)).toBeVisible();
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Updated' })).toBeVisible();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Title').fill('Cancelled');
  await page.getByRole('button', { name: 'Cancel' }).click();
  await expect(page.getByRole('heading', { name: 'Updated' })).toBeVisible();
});

test('toggles completion and reflects the action label and active filter', async ({ page }) => {
  await startActionCount(page);
  await expect(page.getByRole('button', { name: 'Mark as done' })).toBeVisible();
  await page.getByRole('button', { name: 'Mark as done' }).click();
  expect(await getActionCount(page)).toBeLessThanOrEqual(3);
  await expect(page.getByText('Done', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Mark as not done' })).toBeVisible();
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Pending' }).click();
  await expect(page.getByRole('button', { name: /Original/ })).toHaveCount(0);
});

test('confirms deletion before removing a task', async ({ page }) => {
  const deleteButton = page.getByRole('button', { name: 'Delete' });
  await expect(deleteButton).toHaveCSS('color', 'rgb(180, 35, 24)');
  await startActionCount(page);
  page.once('dialog', (dialog) => dialog.dismiss());
  await deleteButton.click();
  expect(await getActionCount(page)).toBeLessThanOrEqual(3);
  await expect(page.getByRole('heading', { name: 'Original' })).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await deleteButton.click();
  await expect(page.getByRole('heading', { name: 'Curso-PSWE-07' })).toBeVisible();
  await expect(page.getByText(/no tasks|nothing here/i)).toBeVisible();
});

test('keeps task state and offers retry after a failed status write', async ({ page }) => {
  await page.addInitScript(() => {
    window.__failStorageWrites = true;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (window.__failStorageWrites) {
        throw new Error('Storage unavailable');
      }
      return originalSetItem.call(this, key, value);
    };
  });
  await page.reload();
  await page.getByRole('button', { name: /Original/ }).click();
  await page.getByRole('button', { name: 'Mark as done' }).click();
  await expect(page.getByRole('alert')).toContainText(/not saved/i);
  await expect(page.getByText('Pending', { exact: true })).toBeVisible();
  await page.evaluate(() => {
    window.__failStorageWrites = false;
  });
  await page.getByRole('button', { name: 'Mark as done' }).click();
  await expect(page.getByText('Done', { exact: true })).toBeVisible();
});

test('retains edited values and offers retry after a failed edit write', async ({ page }) => {
  await page.addInitScript(() => {
    window.__failStorageWrites = true;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (window.__failStorageWrites) {
        throw new Error('Storage unavailable');
      }
      return originalSetItem.call(this, key, value);
    };
  });
  await page.reload();
  await page.getByRole('button', { name: /Original/ }).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Title').fill('Unsaved edit');
  await page.getByLabel('Description').fill('Still here');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('alert')).toContainText(/not saved/i);
  await expect(page.getByLabel('Title')).toHaveValue('Unsaved edit');
  await expect(page.getByLabel('Description')).toHaveValue('Still here');
  await page.evaluate(() => {
    window.__failStorageWrites = false;
  });
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('heading', { name: 'Unsaved edit' })).toBeVisible();
});

test('keeps the task after a failed deletion and allows retry', async ({ page }) => {
  await page.addInitScript(() => {
    window.__failStorageWrites = true;
    const originalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function (key, value) {
      if (window.__failStorageWrites) {
        throw new Error('Storage unavailable');
      }
      return originalSetItem.call(this, key, value);
    };
  });
  await page.reload();
  await page.getByRole('button', { name: /Original/ }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('alert')).toContainText(/not deleted/i);
  await expect(page.getByRole('heading', { name: 'Original' })).toBeVisible();
  await page.evaluate(() => {
    window.__failStorageWrites = false;
  });
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await expect(page.getByRole('heading', { name: 'Curso-PSWE-07' })).toBeVisible();
});
