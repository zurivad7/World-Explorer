import { expect, test } from '@playwright/test';

async function onboardOlder(page: import('@playwright/test').Page) {
  await page.goto('/');
  await page.getByRole('button', { name: /ages 11–13/i }).click();
  await page.getByRole('button', { name: /start exploring/i }).click();
  await page.getByRole('navigation', { name: /primary/i }).getByRole('link', { name: 'Play', exact: true }).click();
}

test('Find the Lie presents three statements to judge', async ({ page }) => {
  await onboardOlder(page);
  await page.getByText('Find the Lie').click();
  await expect(page).toHaveURL(/\/play\/find-the-lie$/);
  await expect(page.getByText(/which one is the lie/i)).toBeVisible();
  expect(await page.locator('.quiz-options .quiz-option').count()).toBe(3);
});

test('Odd One Out presents four countries to compare', async ({ page }) => {
  await onboardOlder(page);
  await page.getByText('Odd One Out').click();
  await expect(page).toHaveURL(/\/play\/odd-one-out$/);
  await expect(page.getByText(/odd one out/i).first()).toBeVisible();
  expect(await page.locator('.quiz-options .quiz-option').count()).toBe(4);
});

test('Closest Country asks which of four is nearest', async ({ page }) => {
  await onboardOlder(page);
  await page.getByText('Closest Country').click();
  await expect(page).toHaveURL(/\/play\/closest-country$/);
  await expect(page.getByText(/closest to/i)).toBeVisible();
  expect(await page.locator('.quiz-options .quiz-option').count()).toBe(4);
});
