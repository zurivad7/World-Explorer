import { expect, test } from '@playwright/test';

/** Onboard, open a country, and start its own "Play this country" quiz (per-country). */
test('play this country starts a quiz for that country', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  // Open a country directly (the map's accessible list links to each one).
  await page.goto('/country/fr');
  await expect(page.getByRole('heading', { name: 'France' })).toBeVisible();

  // "Play this country" leads to a France-specific quiz, not the Game Hub.
  await page.getByRole('link', { name: /play this country/i }).click();
  await expect(page).toHaveURL(/\/play\/country\/fr$/);
  await expect(page.getByRole('heading', { name: /france quiz/i })).toBeVisible();
  await expect(page.getByText(/question 1 of/i)).toBeVisible();
});

/** A micro-state with no polygon (Tuvalu) is still shown on its map via a pin. */
test('a country without a polygon is shown by a map pin', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  await page.goto('/country/tv');
  await expect(page.getByRole('heading', { name: 'Tuvalu' })).toBeVisible();

  // The detail map mounts and drops a location pin at Tuvalu's point.
  await expect(page.locator('.leaflet-container')).toBeVisible({ timeout: 15_000 });
  await expect(page.locator('.country-pin')).toBeVisible({ timeout: 15_000 });
});

/** The "World Explorer" brand in the header returns to Home. */
test('the header brand links back to Home', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  await page.goto('/country/fr');
  await expect(page.getByRole('heading', { name: 'France' })).toBeVisible();

  await page.getByRole('link', { name: /world explorer — go to home/i }).click();
  await expect(page).toHaveURL(/\/$/);
});
