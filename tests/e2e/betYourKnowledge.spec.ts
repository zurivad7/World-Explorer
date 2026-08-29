import { expect, test } from '@playwright/test';

async function onboardOlder(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 11–13/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Play', exact: true })
    .click();
}

test('Bet Your Knowledge locks the answers until a wager is placed', async ({ page }) => {
  await onboardOlder(page);
  await page.getByText('Bet Your Knowledge').click();
  await expect(page).toHaveURL(/\/play\/bet-your-knowledge$/);

  // The running score starts at zero and a wager panel is shown.
  await expect(page.getByText(/0 points/i)).toBeVisible();
  await expect(page.getByText(/how sure are you/i)).toBeVisible();

  // Options are disabled until a bet is chosen.
  const firstOption = page.locator('.quiz-options .quiz-option').first();
  await expect(firstOption).toBeDisabled();

  // Place a wager; the options unlock.
  await page.getByRole('button', { name: /certain/i }).click();
  await expect(firstOption).toBeEnabled();

  // Answer, then see a points delta and be able to continue.
  await firstOption.click();
  await expect(page.locator('.quiz-feedback__points')).toBeVisible();
  await expect(page.getByRole('button', { name: /next|see results/i })).toBeVisible();
});
