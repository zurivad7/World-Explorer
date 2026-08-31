import { expect, test } from '@playwright/test';

test('Country Letters: pick a mode, start, and judge a guess', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 11–13/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Play', exact: true })
    .click();

  await page.getByText('Speed Run').click();
  await page.getByText('Country Letters').click();

  // Ready screen offers both challenge variants.
  await expect(page.getByRole('button', { name: /starts with/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /contains/i })).toBeVisible();

  await page.getByRole('button', { name: /start the clock/i }).click();

  // A single big letter and a running timer appear.
  const letter = page.locator('.letter-prompt');
  await expect(letter).toBeVisible();
  await expect(letter).toHaveText(/^[A-Z]$/);
  await expect(page.getByText(/⏱️/)).toBeVisible();
  await expect(page.getByText('✅ 0')).toBeVisible();

  // A word that is not a country is rejected (deterministic regardless of the letter).
  const input = page.getByRole('textbox', { name: /type a country name/i });
  await input.fill('Wakanda');
  await input.press('Enter');
  await expect(page.getByText(/not a country/i)).toBeVisible();
  await expect(page.getByText('✅ 0')).toBeVisible();
});
