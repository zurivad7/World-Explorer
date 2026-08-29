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

test('Border Battle lets you pick several countries then check', async ({ page }) => {
  await onboardOlder(page);
  await page.getByText('Border Battle').click();
  await expect(page).toHaveURL(/\/play\/border-battle$/);
  await expect(page.getByText(/share a border with/i)).toBeVisible();

  const options = page.locator('.quiz-options--multi .quiz-option');
  await expect(options).toHaveCount(5);

  // Check is disabled until at least one option is picked.
  const check = page.getByRole('button', { name: /check answer/i });
  await expect(check).toBeDisabled();

  // Pick two options; they become pressed.
  await options.nth(0).click();
  await options.nth(1).click();
  await expect(options.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await expect(check).toBeEnabled();

  await check.click();

  // After checking, feedback with an explanation and a Next/See results button appears.
  await expect(page.locator('.quiz-feedback')).toBeVisible();
  await expect(page.getByRole('button', { name: /next|see results/i })).toBeVisible();
});
