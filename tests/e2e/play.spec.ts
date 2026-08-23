import { expect, test } from '@playwright/test';

/** Onboard, play a full Flag Detective round, and reach the results screen. */
test('play a full game to the results screen', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 8–10/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();

  await page.getByRole('link', { name: /play/i }).first().click();
  await page.getByText(/choose a game/i).waitFor();
  await page.getByText('Flag Detective').click();

  await expect(page.getByText(/question 1 of/i)).toBeVisible();

  // Answer each question (first option) until the results screen appears.
  for (let i = 0; i < 12; i++) {
    if (await page.getByText(/out of/i).isVisible().catch(() => false)) break;
    const option = page.locator('.quiz-options .quiz-option').first();
    await option.click();
    await expect(page.getByRole('status')).toBeVisible();
    await page.getByRole('button', { name: /next|see results/i }).click();
  }

  await expect(page.getByText(/out of/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /play again/i })).toBeVisible();
});
