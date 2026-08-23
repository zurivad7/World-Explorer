import { expect, test } from '@playwright/test';

/**
 * Play a game, then confirm the recorded progress survives a full page reload
 * (PRD FR-016 / AC-08 — progress persists on the same device).
 */
test('progress persists across a reload', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  // Play a full Flag Detective round.
  await page.getByRole('link', { name: /play/i }).first().click();
  await page.getByText('Flag Detective').click();
  await expect(page.getByText(/question 1 of/i)).toBeVisible();
  for (let i = 0; i < 12; i++) {
    if (await page.getByText(/out of/i).isVisible().catch(() => false)) break;
    await page.locator('.quiz-options .quiz-option').first().click();
    await expect(page.getByRole('status')).toBeVisible();
    await page.getByRole('button', { name: /next|see results/i }).click();
  }
  await expect(page.getByText(/out of/i)).toBeVisible();

  // The completed game shows in My Progress → Recent activity.
  const openProgress = async () => {
    await page.getByRole('link', { name: /passport/i }).first().click();
    await page.getByRole('link', { name: /my progress/i }).click();
    await expect(page.getByRole('heading', { name: /recent activity/i })).toBeVisible();
    await expect(page.getByText('Flag Detective')).toBeVisible();
  };
  await openProgress();

  // Reload the app from scratch — the profile + progress come back from IndexedDB.
  await page.goto('/');
  await expect(page.getByText(/how old are you/i)).toHaveCount(0); // not sent back to onboarding
  await openProgress();
});
