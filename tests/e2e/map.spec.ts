import { expect, test } from '@playwright/test';

/** Onboard, then open Explore. Verifies the map renders and country selection works. */
test('explore map renders and a country can be opened', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  // Go to Explore.
  await page.getByRole('link', { name: /explore/i }).first().click();

  // The Leaflet map (lazy-loaded) mounts, with country polygons drawn.
  const map = page.locator('.leaflet-container');
  await expect(map).toBeVisible();
  await expect(page.locator('.leaflet-container path').first()).toBeVisible();

  // The accessible list fallback lets us open a country without the map.
  await page.getByRole('link', { name: /France/i }).click();
  await expect(page).toHaveURL(/\/country\/fr$/);
  await expect(page.getByRole('heading', { name: 'France' })).toBeVisible();
});
