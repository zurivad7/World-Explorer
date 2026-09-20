import { expect, test } from '@playwright/test';

test('Neighbours Blitz: 60s, two flags, typed answer, no options', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 11–13/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Play', exact: true })
    .click();

  await page.getByText('Speed Run').click();
  await page.getByText('Neighbours Blitz').click();
  await expect(page).toHaveURL(/\/play\/speed\/neighbours$/);
  await expect(page.getByText(/60 seconds/i)).toBeVisible();

  await page.getByRole('button', { name: /start the clock/i }).click();

  // Two neighbour flags, a typed input (no multiple-choice), and a running clock.
  await expect(page.getByText(/shares a border with both of these/i)).toBeVisible();
  expect(await page.locator('.quiz-subjects .quiz-subject').count()).toBe(2);
  await expect(page.getByRole('textbox', { name: /type the country that borders both/i })).toBeVisible();
  expect(await page.locator('.quiz-options .quiz-option').count()).toBe(0);
  await expect(page.getByText(/⏱️ 60s/)).toBeVisible();
});
