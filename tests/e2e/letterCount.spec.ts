import { expect, test } from '@playwright/test';

test('Letter Count Blitz: start, see a target number, judge a guess', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 11–13/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Play', exact: true })
    .click();

  await page.getByText('Speed Run').click();
  await page.getByText('Letter Count Blitz').click();

  await page.getByRole('button', { name: /start the clock/i }).click();

  // A single big number, a one-minute clock, and a running score appear.
  const number = page.locator('.letter-prompt');
  await expect(number).toBeVisible();
  await expect(number).toHaveText(/^\d+$/);
  await expect(page.getByText(/⏱️ 60s/)).toBeVisible();
  await expect(page.getByText('✅ 0')).toBeVisible();

  // A word that is not a country is rejected (deterministic regardless of the number).
  const input = page.getByRole('textbox', { name: /type a country name/i });
  await input.fill('Wakanda');
  await input.press('Enter');
  await expect(page.getByText(/not a country/i)).toBeVisible();
  await expect(page.getByText('✅ 0')).toBeVisible();
});
