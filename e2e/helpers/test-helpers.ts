import { Page, expect } from '@playwright/test';

/**
 * Test helper utilities for E2E tests
 */

export interface TestUser {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * Generate a unique test user
 */
export function generateTestUser(prefix: string = 'test'): TestUser {
  return {
    email: `${prefix}-${Date.now()}@example.com`,
    password: 'TestPassword123!',
    firstName: 'Test',
    lastName: 'User',
  };
}

/**
 * Register a new user
 */
export async function registerUser(page: Page, user: TestUser): Promise<void> {
  await page.goto('/register');
  
  // Wait for registration form to load
  await page.waitForSelector('input[name="firstName"], input[name="email"]', { timeout: 10000 });
  
  await page.fill('input[name="firstName"]', user.firstName);
  await page.fill('input[name="lastName"]', user.lastName);
  await page.fill('input[name="email"]', user.email);
  await page.fill('input[name="password"]', user.password);
  await page.fill('input[name="confirmPassword"]', user.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for successful registration (redirect to dashboard or login)
  await page.waitForURL(/\/(dashboard|login)/, { timeout: 10000 });
  
  // If redirected to login, login with new credentials
  if (page.url().includes('/login')) {
    await loginUser(page, user.email, user.password);
  }
}

/**
 * Login with existing credentials
 */
export async function loginUser(page: Page, email: string, password: string): Promise<void> {
  await page.goto('/login');
  
  // Wait for login form to load
  await page.waitForSelector('input[name="email"], input[name="password"]', { timeout: 10000 });
  
  await page.fill('input[name="email"]', email);
  await page.fill('input[name="password"]', password);
  
  await page.click('button[type="submit"]');
  
  // Wait for successful login (redirect to dashboard)
  await page.waitForURL(/\/dashboard/, { timeout: 10000 });
}

/**
 * Logout current user
 */
export async function logoutUser(page: Page): Promise<void> {
  const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout"), button:has-text("Sign Out"), a:has-text("Sign Out")');
  
  if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await logoutButton.click();
    await page.waitForURL(/\/(login|home|\/)/, { timeout: 5000 });
  }
}

/**
 * Navigate to a specific course
 */
export async function navigateToCourse(page: Page, courseNumber: number = 1): Promise<void> {
  await page.goto('/dashboard');
  
  // Wait for courses to load
  await page.waitForSelector('[data-testid="course-card"], .course-card, [class*="course"]', { 
    timeout: 10000 
  });
  
  // Find and click the course
  const courseLink = page.locator(`a[href*="/courses/"]:has-text("Course ${courseNumber}"), a[href*="/courses/"]:has-text("Course One")`).first();
  
  if (await courseLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await courseLink.click();
  } else {
    // Fallback: click first course link
    await page.click('a[href*="/courses/"]');
  }
  
  await page.waitForURL(/\/courses?\//, { timeout: 10000 });
}

/**
 * Navigate to a specific lesson
 */
export async function navigateToLesson(page: Page, lessonNumber: number = 1): Promise<void> {
  // Wait for lessons to load
  await page.waitForSelector('[data-testid="lesson"], .lesson, a[href*="/lessons/"]', {
    timeout: 10000
  });
  
  // Find and click the lesson
  const lessonLink = page.locator(`a[href*="/lessons/"]:has-text("Lesson ${lessonNumber}")`).first();
  
  if (await lessonLink.isVisible({ timeout: 5000 }).catch(() => false)) {
    await lessonLink.click();
  } else {
    // Fallback: click first lesson link
    await page.click('a[href*="/lessons/"]');
  }
  
  await page.waitForURL(/\/lessons?\//, { timeout: 10000 });
}

/**
 * Submit an activity
 */
export async function submitActivity(page: Page, activityIndex: number = 0): Promise<boolean> {
  // Wait for activities to load
  await page.waitForSelector('[data-testid="activity"], .activity, [class*="activity"]', {
    timeout: 10000
  });
  
  // Find the activity
  const activity = page.locator('[data-testid="activity"], .activity, [class*="activity"]').nth(activityIndex);
  await expect(activity).toBeVisible();
  
  // Check if activity has a form or submission button
  const submitButton = activity.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Complete")').first();
  
  if (await submitButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    // Fill activity form if present
    const textInputs = activity.locator('input[type="text"], textarea').first();
    if (await textInputs.isVisible({ timeout: 2000 }).catch(() => false)) {
      await textInputs.fill('This is my test activity submission.');
    }
    
    // Check for radio buttons or checkboxes
    const radioButtons = activity.locator('input[type="radio"]');
    const radioCount = await radioButtons.count();
    if (radioCount > 0) {
      await radioButtons.first().check();
    }
    
    // Submit activity
    await submitButton.click();
    
    // Wait for submission confirmation
    await page.waitForTimeout(2000);
    
    return true;
  }
  
  return false;
}

/**
 * Check if a course is locked
 */
export async function isCourseLocked(page: Page, courseNumber: number): Promise<boolean> {
  const numberWord = numberToWord(courseNumber);
  const courseElement = page.locator(`text=/Course (${courseNumber}|${numberWord})/i`).first();
  
  if (await courseElement.isVisible({ timeout: 5000 }).catch(() => false)) {
    const parent = courseElement.locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "course")]').first();
    const lockedIndicator = parent.locator('[data-testid="locked"], .locked, [class*="lock"]');
    
    return await lockedIndicator.isVisible({ timeout: 2000 }).catch(() => false);
  }
  
  return true;
}

/**
 * Check if a lesson is locked
 */
export async function isLessonLocked(page: Page, lessonNumber: number): Promise<boolean> {
  const lessonElement = page.locator(`text=/Lesson ${lessonNumber}/i`).first();
  
  if (await lessonElement.isVisible({ timeout: 5000 }).catch(() => false)) {
    const parent = lessonElement.locator('xpath=ancestor::*[contains(@class, "card") or contains(@class, "lesson")]').first();
    const lockedIndicator = parent.locator('[data-testid="locked"], .locked, [class*="lock"]');
    
    return await lockedIndicator.isVisible({ timeout: 2000 }).catch(() => false);
  }
  
  return true;
}

/**
 * Wait for API response
 */
export async function waitForApiResponse(page: Page, urlPattern: string | RegExp, status: number = 200) {
  return page.waitForResponse(
    response => {
      const url = response.url();
      const matches = typeof urlPattern === 'string' 
        ? url.includes(urlPattern)
        : urlPattern.test(url);
      return matches && response.status() === status;
    },
    { timeout: 10000 }
  );
}

/**
 * Convert number to word (1-7)
 */
function numberToWord(num: number): string {
  const words = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
  return words[num] || num.toString();
}

/**
 * Take a screenshot with a descriptive name
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `test-results/${name}-${Date.now()}.png`, fullPage: true });
}

/**
 * Verify success message appears
 */
export async function verifySuccessMessage(page: Page): Promise<void> {
  const successIndicator = page.locator('text=/success|submitted|complete/i, [data-testid="success"], .success, [role="alert"]');
  await expect(successIndicator.first()).toBeVisible({ timeout: 5000 });
}

/**
 * Verify error message appears
 */
export async function verifyErrorMessage(page: Page): Promise<void> {
  const errorIndicator = page.locator('text=/error|invalid|incorrect|failed/i, [role="alert"], .error');
  await expect(errorIndicator.first()).toBeVisible({ timeout: 5000 });
}
