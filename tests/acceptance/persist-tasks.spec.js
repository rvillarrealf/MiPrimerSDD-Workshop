import { expect, test } from '@playwright/test';

test('persists task fields and status after reload and keeps confirmed deletions absent', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Add task' }).click();
  await page.getByLabel('Title').fill('Persisted');
  await page.getByLabel('Description').fill('Saved description');
  await page.getByRole('button', { name: 'Save' }).click();
  await page.getByRole('button', { name: /Persisted/ }).click();
  await page.getByRole('button', { name: 'Mark as done' }).click();
  await page.reload();
  await page.getByRole('button', { name: /Persisted/ }).click();
  await expect(page.getByText('Saved description')).toBeVisible();
  await expect(page.getByText('Done', { exact: true })).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete' }).click();
  await page.reload();
  await expect(page.getByRole('button', { name: /Persisted/ })).toHaveCount(0);
});

test('shows a read error instead of an empty list and allows retry without overwriting data', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('curso-pswe-07.tasks', JSON.stringify([
      { id: 'kept', title: 'Preserved', description: '', status: 'pending', createdAt: '2026-10-29T12:00:00.000Z' },
    ]));
  });
  await page.addInitScript(() => {
    window.__failStorageReads = true;
    const originalGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (key) {
      if (window.__failStorageReads && key === 'curso-pswe-07.tasks') {
        throw new Error('Storage unavailable');
      }
      return originalGetItem.call(this, key);
    };
  });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText(/could not load/i);
  await expect(page.getByRole('button', { name: /Preserved/ })).toHaveCount(0);
  await page.evaluate(() => {
    window.__failStorageReads = false;
  });
  const savedValue = await page.evaluate(() => localStorage.getItem('curso-pswe-07.tasks'));
  expect(JSON.parse(savedValue)).toEqual([
    { id: 'kept', title: 'Preserved', description: '', status: 'pending', createdAt: '2026-10-29T12:00:00.000Z' },
  ]);
  await page.getByRole('button', { name: 'Retry' }).click();
  await expect(page.getByRole('button', { name: /Preserved/ })).toBeVisible();
});
