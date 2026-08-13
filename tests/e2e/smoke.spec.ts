import { expect, test } from '@playwright/test';

/**
 * Phase 0 smoke test. Full journeys (onboarding → game → passport, map → country
 * → game, offline play) are added in later phases per PRD §29.
 */
test('first run shows onboarding and lets you start', async ({ page }) => {
  await page.goto('/');
  // First-time users are routed to onboarding (no profile yet).
  await expect(page.getByText(/how old are you/i)).toBeVisible();

  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  // Land on Home with the primary navigation available.
  await expect(page.getByRole('navigation', { name: /primary/i })).toBeVisible();
});
