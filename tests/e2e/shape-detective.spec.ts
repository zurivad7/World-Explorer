import { expect, test } from '@playwright/test';

/** Onboard, open Shape Detective from the Game Hub, and confirm an outline is shown. */
test('shape detective shows a country outline with options', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  await page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: 'Play', exact: true }).click();
  await page.getByText('Shape Detective').click();

  await expect(page).toHaveURL(/\/play\/shape-detective$/);
  await expect(page.getByText(/which country has this shape/i)).toBeVisible();
  // The silhouette SVG renders, and there are answer options.
  await expect(page.locator('svg.country-silhouette path')).toBeVisible();
  expect(await page.locator('.quiz-options .quiz-option').count()).toBeGreaterThanOrEqual(3);
});
