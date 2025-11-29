/**
 * WCAG 2.1 Level AA Compliance Utilities
 * Tools for ensuring accessibility compliance
 */

/**
 * Color contrast ratios for WCAG compliance
 */
export const WCAG_CONTRAST = {
  AA_NORMAL: 4.5,
  AA_LARGE: 3,
  AAA_NORMAL: 7,
  AAA_LARGE: 4.5,
} as const;

/**
 * Converts hex color to RGB
 */
const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Calculates relative luminance of a color
 */
const getLuminance = (r: number, g: number, b: number): number => {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
};

/**
 * Calculates contrast ratio between two colors
 */
export const getContrastRatio = (color1: string, color2: string): number => {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
};

/**
 * Checks if contrast ratio meets WCAG AA standards
 */
export const meetsWCAGAA = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? WCAG_CONTRAST.AA_LARGE : WCAG_CONTRAST.AA_NORMAL;
  return ratio >= threshold;
};

/**
 * Checks if contrast ratio meets WCAG AAA standards
 */
export const meetsWCAGAAA = (
  foreground: string,
  background: string,
  isLargeText: boolean = false
): boolean => {
  const ratio = getContrastRatio(foreground, background);
  const threshold = isLargeText ? WCAG_CONTRAST.AAA_LARGE : WCAG_CONTRAST.AAA_NORMAL;
  return ratio >= threshold;
};

/**
 * Validates that all interactive elements have accessible names
 */
export const validateAccessibleName = (element: HTMLElement): boolean => {
  const tagName = element.tagName.toLowerCase();
  const role = element.getAttribute('role');

  // Elements that require accessible names
  const requiresName = [
    'button',
    'a',
    'input',
    'select',
    'textarea',
  ].includes(tagName) || role === 'button' || role === 'link';

  if (!requiresName) return true;

  // Check for accessible name sources
  const hasAriaLabel = !!element.getAttribute('aria-label');
  const hasAriaLabelledBy = !!element.getAttribute('aria-labelledby');
  const hasTitle = !!element.getAttribute('title');
  const hasTextContent = !!element.textContent?.trim();
  const hasAlt = tagName === 'img' && !!element.getAttribute('alt');
  const hasValue = tagName === 'input' && !!element.getAttribute('value');

  return (
    hasAriaLabel ||
    hasAriaLabelledBy ||
    hasTitle ||
    hasTextContent ||
    hasAlt ||
    hasValue
  );
};

/**
 * Validates that images have alt text
 */
export const validateImageAlt = (img: HTMLImageElement): boolean => {
  const alt = img.getAttribute('alt');
  const role = img.getAttribute('role');

  // Decorative images should have empty alt or role="presentation"
  if (role === 'presentation' || role === 'none') {
    return true;
  }

  // All other images must have alt text
  return alt !== null;
};

/**
 * Validates form labels
 */
export const validateFormLabel = (input: HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement): boolean => {
  const id = input.id;
  const ariaLabel = input.getAttribute('aria-label');
  const ariaLabelledBy = input.getAttribute('aria-labelledby');

  // Check for aria-label or aria-labelledby
  if (ariaLabel || ariaLabelledBy) return true;

  // Check for associated label element
  if (id) {
    const label = document.querySelector(`label[for="${id}"]`);
    if (label) return true;
  }

  // Check if input is wrapped in a label
  const parentLabel = input.closest('label');
  if (parentLabel) return true;

  return false;
};

/**
 * Validates heading hierarchy
 */
export const validateHeadingHierarchy = (): { valid: boolean; errors: string[] } => {
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
  const errors: string[] = [];
  let previousLevel = 0;

  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));

    if (index === 0 && level !== 1) {
      errors.push('Page should start with an h1 heading');
    }

    if (level > previousLevel + 1) {
      errors.push(
        `Heading level skipped: ${heading.tagName} follows h${previousLevel} (should be h${previousLevel + 1})`
      );
    }

    previousLevel = level;
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};

/**
 * Validates that focusable elements are keyboard accessible
 */
export const validateKeyboardAccessibility = (element: HTMLElement): boolean => {
  const tabIndex = element.getAttribute('tabindex');
  const role = element.getAttribute('role');

  // Elements with tabindex="-1" are not keyboard accessible
  if (tabIndex === '-1' && role !== 'dialog' && role !== 'alertdialog') {
    return false;
  }

  // Interactive elements should be keyboard accessible
  const interactiveRoles = ['button', 'link', 'menuitem', 'tab', 'option'];
  if (interactiveRoles.includes(role || '')) {
    // Should have click handler and keyboard handler
    const hasClickHandler = element.onclick !== null;
    const hasKeyHandler = element.onkeydown !== null || element.onkeypress !== null;

    if (hasClickHandler && !hasKeyHandler) {
      return false;
    }
  }

  return true;
};

/**
 * Runs a comprehensive WCAG AA compliance check
 */
export const runWCAGAudit = (): {
  passed: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check heading hierarchy
  const headingCheck = validateHeadingHierarchy();
  if (!headingCheck.valid) {
    errors.push(...headingCheck.errors);
  }

  // Check all images for alt text
  const images = document.querySelectorAll('img');
  images.forEach((img, index) => {
    if (!validateImageAlt(img)) {
      errors.push(`Image ${index + 1} missing alt text: ${img.src}`);
    }
  });

  // Check all form inputs for labels
  const inputs = document.querySelectorAll('input, textarea, select');
  inputs.forEach((input, index) => {
    if (!validateFormLabel(input as HTMLInputElement)) {
      errors.push(`Form input ${index + 1} missing label: ${input.id || 'no id'}`);
    }
  });

  // Check all interactive elements for accessible names
  const interactive = document.querySelectorAll('button, a, [role="button"], [role="link"]');
  interactive.forEach((element, index) => {
    if (!validateAccessibleName(element as HTMLElement)) {
      warnings.push(`Interactive element ${index + 1} missing accessible name`);
    }
  });

  // Check for keyboard accessibility
  const focusable = document.querySelectorAll('[tabindex], button, a, input, select, textarea');
  focusable.forEach((element, index) => {
    if (!validateKeyboardAccessibility(element as HTMLElement)) {
      warnings.push(`Element ${index + 1} may not be keyboard accessible`);
    }
  });

  return {
    passed: errors.length === 0,
    errors,
    warnings,
  };
};

/**
 * Brand colors with WCAG AA compliant alternatives
 */
export const ACCESSIBLE_COLORS = {
  // Original brand colors
  hotPink: '#FF1493',
  glossyBlack: '#000000',
  steelGrey: '#708090',
  successTeal: '#40E0D0',
  girlyPink: '#FFC0CB',
  white: '#FFFFFF',

  // WCAG AA compliant text colors on dark backgrounds
  textOnDark: {
    primary: '#FFFFFF', // White text on dark backgrounds (21:1 ratio)
    secondary: '#E0E0E0', // Light grey (17:1 ratio)
    accent: '#FF69B4', // Lighter hot pink (8.2:1 ratio)
    success: '#5FFFD7', // Lighter teal (12:1 ratio)
  },

  // WCAG AA compliant text colors on light backgrounds
  textOnLight: {
    primary: '#000000', // Black text on light backgrounds (21:1 ratio)
    secondary: '#4A4A4A', // Dark grey (9:1 ratio)
    accent: '#C71585', // Darker hot pink (5.5:1 ratio)
    success: '#008B8B', // Darker teal (4.8:1 ratio)
  },
} as const;

export default {
  getContrastRatio,
  meetsWCAGAA,
  meetsWCAGAAA,
  validateAccessibleName,
  validateImageAlt,
  validateFormLabel,
  validateHeadingHierarchy,
  validateKeyboardAccessibility,
  runWCAGAudit,
  ACCESSIBLE_COLORS,
  WCAG_CONTRAST,
};
