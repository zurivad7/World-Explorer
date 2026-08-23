import { expect, test } from '@playwright/test';

/** The footer offers a Contact Me link for feedback/suggestions/corrections. */
test('the footer has a Contact Me mailto link', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  const contact = page.getByRole('link', { name: /contact me/i });
  await expect(contact).toBeVisible();
  await expect(contact).toHaveAttribute('href', /^mailto:feedback\.worldexplorer@gmail\.com/);
});
