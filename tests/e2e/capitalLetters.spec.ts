import { expect, test } from '@playwright/test';

test('Capital Letters: start, see a letter and 2-minute clock, judge a guess', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 11–13/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Play', exact: true })
    .click();

  await page.getByText('Speed Run').click();
  await page.getByText('Capital Letters').click();
  await expect(page).toHaveURL(/\/play\/speed\/capitals\/game$/);

  await page.getByRole('button', { name: /start the clock/i }).click();

  // A single big letter, a two-minute clock, and a running score appear.
  const letter = page.locator('.letter-prompt');
  await expect(letter).toBeVisible();
  await expect(letter).toHaveText(/^[A-Z]$/);
  await expect(page.getByText(/⏱️ 120s/)).toBeVisible();
  await expect(page.getByText('✅ 0')).toBeVisible();

  // A word that is not a capital is rejected (deterministic regardless of the letter).
  const input = page.getByRole('textbox', { name: /type a capital city/i });
  await input.fill('Gotham');
  await input.press('Enter');
  await expect(page.getByText(/not a capital/i)).toBeVisible();
  await expect(page.getByText('✅ 0')).toBeVisible();
});
