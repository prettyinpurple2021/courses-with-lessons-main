import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText(/login|sign in/i);
  });

  test('should display registration page', async ({ page }) => {
    await page.goto('/register');
    await expect(page.locator('h1')).toContainText(/register|sign up/i);
  });

  test('should navigate between login and register', async ({ page }) => {
    await page.goto('/login');
    
    // Find and click link to register page
    const registerLink = page.locator('a[href*="register"]').first();
    await registerLink.click();
    
    await expect(page).toHaveURL(/.*register/);
  });
});

test.describe('Dashboard Access', () => {
  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*login/);
  });
});
