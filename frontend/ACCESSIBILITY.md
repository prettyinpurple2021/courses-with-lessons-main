# Accessibility Documentation

## Overview

SoloSuccess Intel Academy is committed to providing an accessible experience for all users, including those with disabilities. This document outlines the accessibility features implemented and how to maintain WCAG 2.1 Level AA compliance.

## WCAG 2.1 Level AA Compliance

### Perceivable

#### 1.1 Text Alternatives
- ✅ All images have appropriate alt text
- ✅ Decorative images use `role="presentation"` or empty alt text
- ✅ SVG icons include `<title>` elements for screen readers

#### 1.3 Adaptable
- ✅ Semantic HTML structure with proper heading hierarchy
- ✅ Logical tab order for keyboard navigation
- ✅ Content is meaningful without CSS
- ✅ Form inputs have associated labels

#### 1.4 Distinguishable
- ✅ Color contrast ratios meet WCAG AA standards (4.5:1 for normal text, 3:1 for large text)
- ✅ Text can be resized up to 200% without loss of functionality
- ✅ No information conveyed by color alone
- ✅ Focus indicators are clearly visible with holographic effects

### Operable

#### 2.1 Keyboard Accessible
- ✅ All functionality available via keyboard
- ✅ No keyboard traps
- ✅ Skip to main content link
- ✅ Keyboard shortcuts documented (Shift + ?)

#### 2.2 Enough Time
- ✅ No time limits on user interactions
- ✅ Auto-save functionality for notes and progress

#### 2.3 Seizures and Physical Reactions
- ✅ No content flashes more than 3 times per second
- ✅ Animations respect `prefers-reduced-motion`

#### 2.4 Navigable
- ✅ Descriptive page titles
- ✅ Logical focus order
- ✅ Clear link purposes
- ✅ Multiple navigation methods (menu, breadcrumbs, search)
- ✅ Heading hierarchy (h1 → h2 → h3)

#### 2.5 Input Modalities
- ✅ Touch targets minimum 44x44px on mobile
- ✅ Pointer gestures have keyboard alternatives
- ✅ No motion-based input required

### Understandable

#### 3.1 Readable
- ✅ Language of page specified (`lang="en"`)
- ✅ Clear, simple language used throughout

#### 3.2 Predictable
- ✅ Consistent navigation across pages
- ✅ Consistent component behavior
- ✅ No unexpected context changes

#### 3.3 Input Assistance
- ✅ Form validation with clear error messages
- ✅ Labels and instructions for all inputs
- ✅ Error prevention for critical actions

### Robust

#### 4.1 Compatible
- ✅ Valid HTML5 markup
- ✅ ARIA attributes used correctly
- ✅ Compatible with assistive technologies

## Keyboard Navigation

### Global Shortcuts
- `?` (Shift + ?) - Show keyboard shortcuts help
- `d` - Navigate to Dashboard
- `p` - Navigate to Profile
- `c` - Navigate to Community
- `/` - Focus search (when available)
- `Esc` - Close modals and menus
- `Tab` - Navigate forward through interactive elements
- `Shift + Tab` - Navigate backward through interactive elements
- `Enter` - Activate focused element
- `Space` - Activate buttons and checkboxes
- `Arrow Keys` - Navigate through lists and menus

### Focus Management
- All interactive elements have visible focus indicators with holographic effects
- Focus is trapped within modals and dialogs
- Focus is restored when modals close
- Skip to main content link appears on Tab

## Screen Reader Support

### Tested With
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)

### ARIA Landmarks
- `<header>` - Site header with navigation
- `<main>` - Main content area
- `<nav>` - Navigation menus
- `<footer>` - Site footer

### Live Regions
- Toast notifications use `aria-live="polite"`
- Critical alerts use `aria-live="assertive"`
- Loading states announced to screen readers

## Color Contrast

### Brand Colors (WCAG AA Compliant)

#### Text on Dark Backgrounds
- Primary: `#FFFFFF` (White) - 21:1 ratio
- Secondary: `#E0E0E0` (Light Grey) - 17:1 ratio
- Accent: `#FF69B4` (Light Hot Pink) - 8.2:1 ratio
- Success: `#5FFFD7` (Light Teal) - 12:1 ratio

#### Text on Light Backgrounds
- Primary: `#000000` (Black) - 21:1 ratio
- Secondary: `#4A4A4A` (Dark Grey) - 9:1 ratio
- Accent: `#C71585` (Dark Hot Pink) - 5.5:1 ratio
- Success: `#008B8B` (Dark Teal) - 4.8:1 ratio

### Checking Contrast
Use the built-in WCAG compliance checker (development mode only):
```typescript
import { getContrastRatio, meetsWCAGAA } from './utils/wcagCompliance';

const ratio = getContrastRatio('#FF1493', '#FFFFFF');
const passes = meetsWCAGAA('#FF1493', '#FFFFFF', false);
```

## Touch and Mobile Accessibility

### Touch Targets
- Minimum size: 44x44px on mobile, 48x48px recommended
- Adequate spacing between interactive elements
- Touch feedback with ripple effects

### Gestures
- Swipe gestures have keyboard alternatives
- Pinch-to-zoom supported
- No complex gestures required

### Responsive Design
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

## Testing Accessibility

### Automated Testing
Run the built-in accessibility checker (development mode):
1. Click the accessibility icon in the bottom right
2. Review errors and warnings
3. Fix issues and re-run

### Manual Testing Checklist
- [ ] Navigate entire site using only keyboard
- [ ] Test with screen reader (NVDA, JAWS, or VoiceOver)
- [ ] Verify color contrast with browser DevTools
- [ ] Test on mobile devices with touch
- [ ] Verify with browser zoom at 200%
- [ ] Check with high contrast mode enabled
- [ ] Test with animations disabled (prefers-reduced-motion)

### Browser Extensions
- axe DevTools
- WAVE Evaluation Tool
- Lighthouse (Chrome DevTools)

## Common Patterns

### Accessible Button
```tsx
<GlassmorphicButton
  onClick={handleClick}
  ariaLabel="Descriptive action"
  disabled={isDisabled}
  loading={isLoading}
>
  Button Text
</GlassmorphicButton>
```

### Accessible Card
```tsx
<GlassmorphicCard
  onClick={handleClick}
  role="button"
  ariaLabel="Card description"
  tabIndex={0}
>
  Card Content
</GlassmorphicCard>
```

### Accessible Form
```tsx
<form>
  <label htmlFor="email">Email Address</label>
  <input
    id="email"
    type="email"
    aria-required="true"
    aria-invalid={hasError}
    aria-describedby="email-error"
  />
  {hasError && (
    <span id="email-error" role="alert">
      Please enter a valid email
    </span>
  )}
</form>
```

### Accessible Modal
```tsx
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  aria-describedby="modal-description"
>
  <h2 id="modal-title">Modal Title</h2>
  <p id="modal-description">Modal description</p>
  {/* Modal content */}
</div>
```

## Utilities

### Accessibility Utilities
Located in `src/utils/accessibility.ts`:
- `announceToScreenReader()` - Announce messages to screen readers
- `trapFocus()` - Trap focus within a container
- `FocusManager` - Manage focus restoration
- `handleArrowNavigation()` - Handle arrow key navigation
- `prefersReducedMotion()` - Check user motion preferences

### WCAG Compliance Utilities
Located in `src/utils/wcagCompliance.ts`:
- `getContrastRatio()` - Calculate color contrast ratio
- `meetsWCAGAA()` - Check WCAG AA compliance
- `validateAccessibleName()` - Validate accessible names
- `validateImageAlt()` - Validate image alt text
- `runWCAGAudit()` - Run comprehensive audit

## Maintenance

### Adding New Components
1. Use semantic HTML elements
2. Add appropriate ARIA attributes
3. Ensure keyboard accessibility
4. Test with screen readers
5. Verify color contrast
6. Add to accessibility tests

### Regular Audits
- Run automated tests before each release
- Conduct manual testing quarterly
- Update documentation as needed
- Monitor user feedback

## Resources

### WCAG Guidelines
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

### Testing Tools
- [axe DevTools](https://www.deque.com/axe/devtools/)
- [WAVE Browser Extension](https://wave.webaim.org/extension/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)

### Screen Readers
- [NVDA (Free)](https://www.nvaccess.org/)
- [JAWS](https://www.freedomscientific.com/products/software/jaws/)
- [VoiceOver](https://www.apple.com/accessibility/voiceover/) (Built into macOS/iOS)

## Support

For accessibility issues or questions:
- File an issue in the project repository
- Contact the development team
- Email: accessibility@solosuccess.com

## Commitment

We are committed to maintaining and improving the accessibility of SoloSuccess Intel Academy. If you encounter any accessibility barriers, please let us know so we can address them promptly.
