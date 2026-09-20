import { expect, test } from '@playwright/test';

test('Meet the Neighbours shows two flags and four country options', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 11–13/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Play', exact: true })
    .click();

  await page.getByText('Meet the Neighbours').click();
  await expect(page).toHaveURL(/\/play\/meet-the-neighbours$/);
  await expect(page.getByText(/shares a border with both of these/i)).toBeVisible();

  // Two neighbour flags are shown, and four country options to choose from.
  expect(await page.locator('.quiz-subjects .quiz-subject').count()).toBe(2);
  expect(await page.locator('.quiz-options .quiz-option').count()).toBe(4);
});
