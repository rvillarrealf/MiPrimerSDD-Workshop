import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

async function addTask(page, title, description = '') {
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByLabel('Title').fill(title);
  if (description) {
    await page.getByLabel('Description').fill(description);
  }
  await page.getByRole('button', { name: 'Save' }).click();
}

test('creates a task, shows app identity, and opens its detail', async ({ page }) => {
  const startedAt = Date.now();
  await addTask(page, 'Plan the day', 'Review the task list');
  const elapsed = Date.now() - startedAt;

  await expect(page).toHaveTitle('Curso-PSWE-07');
  await expect(page.getByRole('heading', { name: 'Curso-PSWE-07' })).toBeVisible();
  await expect(page.getByRole('button', { name: /Plan the day/ })).toBeVisible();
  expect(elapsed).toBeLessThan(30_000);

  await page.getByRole('button', { name: /Plan the day/ }).click();
  await expect(page.getByRole('heading', { name: 'Plan the day' })).toBeVisible();
  await expect(page.getByText('Review the task list')).toBeVisible();
});

test('rejects an empty title and shows a friendly empty state', async ({ page }) => {
  await expect(page.getByText(/no tasks|nothing here/i)).toBeVisible();
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByLabel('Title').fill('   ');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByText(/title is required/i)).toBeVisible();
  await expect(page.getByLabel('Title')).toHaveValue('   ');
});

test('shows an empty state when a selected filter has no matches', async ({ page }) => {
  await addTask(page, 'Pending task');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(page.getByText(/no done tasks match this filter/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Pending task/ })).toHaveCount(0);
});

test('supports duplicate titles as independently manageable tasks', async ({ page }) => {
  await addTask(page, 'Repeat');
  await addTask(page, 'Repeat');
  const matchingTasks = page.getByRole('button', { name: /Repeat/ });
  await expect(matchingTasks).toHaveCount(2);
  await matchingTasks.nth(1).click();
  await page.getByRole('button', { name: 'Edit' }).click();
  await page.getByLabel('Title').fill('Separate task');
  await page.getByRole('button', { name: 'Save' }).click();

  await page.getByRole('button', { name: 'Back' }).click();
  await expect(page.getByRole('button', { name: /Repeat/ })).toHaveCount(1);
  await expect(page.getByRole('button', { name: /Separate task/ })).toHaveCount(1);
});

test('sorts newest first, filters by status, and styles completed tasks', async ({ page }) => {
  await addTask(page, 'First');
  await addTask(page, 'Second');
  const second = page.getByRole('button', { name: /Second/ });
  await second.click();
  await page.getByRole('button', { name: 'Mark as done' }).click();
  await page.getByRole('button', { name: 'Back' }).click();

  const rows = page.locator('[data-task-row]');
  await expect(rows.nth(0)).toContainText('Second');
  await expect(rows.nth(0)).toHaveClass(/is-done/);
  await page.getByRole('button', { name: 'Pending', exact: true }).click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('First');
  await page.getByRole('button', { name: 'Done', exact: true }).click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Second');
  await page.getByRole('button', { name: 'All', exact: true }).click();
  await expect(rows).toHaveCount(2);
});

test('retains entered values and offers retry after a save failure', async ({ page }) => {
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
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByLabel('Title').fill('Keep this');
  await page.getByLabel('Description').fill('Retry later');
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('alert')).toContainText(/not saved/i);
  await expect(page.getByLabel('Title')).toHaveValue('Keep this');
  await expect(page.getByLabel('Description')).toHaveValue('Retry later');
  await page.evaluate(() => {
    window.__failStorageWrites = false;
  });
  await page.getByRole('button', { name: 'Save' }).click();
  await expect(page.getByRole('button', { name: /Keep this/ })).toBeVisible();
});
