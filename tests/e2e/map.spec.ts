import { expect, test } from '@playwright/test';

/** Onboard, then open Explore. Verifies the map renders and country selection works. */
test('explore map renders and a country can be opened', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  // Go to Explore via the primary navigation (exact name avoids matching the
  // "World Explorer" brand link or the "Explore World" home tile).
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Explore', exact: true })
    .click();

  // The Leaflet map (lazy-loaded) mounts, with country polygons drawn. The 50m
  // geometry chunk is a few hundred KB, so allow extra time for it to download,
  // parse and render under parallel test load. We assert on the polygon *count*
  // (not the first path's visibility): the first path by id is a micro-state that
  // is sub-pixel at world zoom, so a visibility check on it would be flaky.
  const map = page.locator('.leaflet-container');
  await expect(map).toBeVisible({ timeout: 15_000 });
  await expect
    .poll(() => page.locator('.leaflet-container path').count(), { timeout: 15_000 })
    .toBeGreaterThan(10);

  // The accessible list fallback lets us open a country without the map.
  await page.getByRole('link', { name: /France/i }).click();
  await expect(page).toHaveURL(/\/country\/fr$/);
  await expect(page.getByRole('heading', { name: 'France' })).toBeVisible();
});
