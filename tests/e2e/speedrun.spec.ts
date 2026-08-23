import { expect, test } from '@playwright/test';

/** Onboard (8–10), open Speed Run from the Game Hub, and start a Capital Blitz. */
test('speed run is available for 8+ and a blitz starts', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  await page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: 'Play', exact: true }).click();

  // The Speed Run entry is offered on the Game Hub.
  await page.getByRole('link', { name: /speed run/i }).click();
  await expect(page).toHaveURL(/\/play\/speed$/);

  // Pick the typed-capital blitz and start the clock.
  await page.getByRole('link', { name: /capital blitz/i }).click();
  await expect(page).toHaveURL(/\/play\/speed\/capital$/);
  await page.getByRole('button', { name: /start the clock/i }).click();

  // The timer and a capital prompt are shown.
  await expect(page.getByText(/what is the capital of/i)).toBeVisible();
  await expect(page.getByText(/\d+s/)).toBeVisible();
  await expect(page.getByRole('textbox')).toBeVisible();
});
