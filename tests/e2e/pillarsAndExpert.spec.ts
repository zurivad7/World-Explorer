import { expect, test } from '@playwright/test';

test('the Game Hub groups games under the five pillars', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 11–13/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Play', exact: true })
    .click();

  // Pillar section headings are present, and cards sit under them.
  for (const name of [/know/i, /locate/i, /discover/i, /think/i, /compete/i]) {
    await expect(page.getByRole('heading', { name })).toBeVisible();
  }
  await expect(page.getByText('Flag Detective')).toBeVisible();
  await expect(page.getByText('Bet Your Knowledge')).toBeVisible();
});

test('the 5–7 band is not shown games it has no questions for', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 5–7/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Play', exact: true })
    .click();

  // Basics are present; the reasoning games (medium, 8+) are hidden — no dead-end cards.
  await expect(page.getByText('Flag Detective')).toBeVisible();
  await expect(page.getByText('Continent Challenge')).toBeVisible();
  await expect(page.getByText('Find the Lie')).toHaveCount(0);
  await expect(page.getByText('Border Battle')).toHaveCount(0);
});

test('an Expert (grown-up) can onboard and start a game', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: /grown-up \(expert\)/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page
    .getByRole('navigation', { name: /primary/i })
    .getByRole('link', { name: 'Play', exact: true })
    .click();

  // A grown-up still sees the games and can open one.
  await page.getByText('Flag Detective').click();
  await expect(page).toHaveURL(/\/play\/flag-detective$/);
  await expect(page.locator('.quiz-options .quiz-option').first()).toBeVisible();
});
