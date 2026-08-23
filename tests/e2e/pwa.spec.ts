import { expect, test } from '@playwright/test';

async function onboard(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
}

/** Settings offers platform-specific installation help (PRD §19, S11). */
test('settings shows installation help', async ({ page }) => {
  await onboard(page);
  await page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: 'Settings', exact: true }).click();
  await expect(page.getByRole('heading', { name: /install on this device/i })).toBeVisible();
  await expect(page.getByText(/On this device:/i)).toBeVisible();
});

/** Going offline shows a reassuring banner; coming back online clears it (PRD §18/§20). */
test('offline banner appears when offline and clears when back online', async ({ page, context }) => {
  await onboard(page);
  await expect(page.getByRole('status')).toHaveCount(0);

  await context.setOffline(true);
  await expect(page.getByText(/you’re offline/i)).toBeVisible();

  await context.setOffline(false);
  await expect(page.getByText(/you’re offline/i)).toHaveCount(0);
});
