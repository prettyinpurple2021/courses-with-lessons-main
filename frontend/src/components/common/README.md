# Visual Design System Components

This directory contains the core UI components for the SoloSuccess Intel Academy platform, implementing the unique "Girl Boss Drill Sergeant" aesthetic with glassmorphism, holographic effects, and girly camouflage patterns.

## Components

### Glassmorphic Components

#### GlassmorphicCard
A versatile card component with frosted glass effects.

**Props:**
- `variant`: 'default' | 'elevated' | 'flat' - Controls the depth and blur intensity
- `holographicBorder`: boolean - Adds animated holographic border
- `camoBackground`: boolean - Adds camo pattern overlay
- `onClick`: () => void - Optional click handler

**Usage:**
```tsx
<GlassmorphicCard variant="elevated" holographicBorder>
  <h3>Card Title</h3>
  <p>Card content</p>
</GlassmorphicCard>
```

#### GlassmorphicButton
Interactive button with holographic shimmer effects.

**Props:**
- `variant`: 'primary' | 'secondary' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean - Shows loading spinner
- `disabled`: boolean

**Usage:**
```tsx
<GlassmorphicButton variant="primary" size="md" onClick={handleClick}>
  Click Me
</GlassmorphicButton>
```

#### GlassmorphicInput
Form input with glassmorphic styling.

**Props:**
- `label`: string - Input label
- `error`: string - Error message
- `helperText`: string - Helper text
- `icon`: ReactNode - Optional icon

**Usage:**
```tsx
<GlassmorphicInput
  label="Email"
  type="email"
  placeholder="Enter your email"
  error={errors.email}
/>
```

### Holographic Components

#### HolographicBadge
Compact badge with holographic effects for achievements.

**Props:**
- `title`: string
- `icon`: string - Emoji or icon
- `unlocked`: boolean
- `rarity`: 'common' | 'rare' | 'epic' | 'legendary'
- `size`: 'sm' | 'md' | 'lg'

**Usage:**
```tsx
<HolographicBadge
  title="First Steps"
  icon="🎯"
  unlocked={true}
  rarity="common"
/>
```

#### AchievementBadge
Full-featured achievement badge with unlock animations.

**Props:**
- `title`: string
- `description`: string
- `icon`: string
- `unlocked`: boolean
- `unlockedDate`: Date
- `rarity`: 'common' | 'rare' | 'epic' | 'legendary'
- `showAnimation`: boolean

**Usage:**
```tsx
<AchievementBadge
  title="Quick Learner"
  description="Complete 3 lessons in one day"
  icon="⚡"
  unlocked={true}
  unlockedDate={new Date()}
  rarity="rare"
/>
```

### Background Components

#### CamoBackground
Wrapper component that adds girly camo pattern backgrounds.

**Props:**
- `variant`: 'subtle' | 'bold' | 'animated'
- `opacity`: number (0-1)
- `children`: ReactNode

**Usage:**
```tsx
<CamoBackground variant="animated" opacity={0.3}>
  <YourContent />
</CamoBackground>
```

### Progress & Feedback

#### ProgressTracker
Visual progress indicator with holographic effects.

**Props:**
- `current`: number
- `total`: number
- `label`: string
- `showPercentage`: boolean
- `holographicEffect`: boolean

**Usage:**
```tsx
<ProgressTracker
  current={7}
  total={12}
  label="Course Progress"
  holographicEffect={true}
/>
```

#### LoadingSpinner
Animated loading spinner with holographic effects.

**Props:**
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `holographic`: boolean
- `text`: string

**Usage:**
```tsx
<LoadingSpinner size="md" text="Loading..." />
```

### Modal & Notifications

#### Modal
Glassmorphic modal dialog with backdrop blur.

**Props:**
- `isOpen`: boolean
- `onClose`: () => void
- `title`: string
- `size`: 'sm' | 'md' | 'lg' | 'xl'
- `showCloseButton`: boolean

**Usage:**
```tsx
<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Modal content here</p>
</Modal>
```

#### Toast
Individual toast notification component.

**Props:**
- `message`: string
- `type`: 'success' | 'error' | 'warning' | 'info'
- `duration`: number (milliseconds)
- `onClose`: () => void

#### ToastContainer
Container for managing multiple toast notifications.

**Props:**
- `toasts`: ToastMessage[]
- `onRemove`: (id: string) => void
- `position`: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'

**Usage with useToast hook:**
```tsx
import { useToast } from '../hooks/useToast';
import { ToastContainer } from '../components/common';

function MyComponent() {
  const { toasts, removeToast, success, error } = useToast();

  return (
    <>
      <button onClick={() => success('Operation successful!')}>
        Show Success
      </button>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
```

## CSS Utilities

### Glassmorphism Classes
- `.glassmorphic` - Default glass effect
- `.glassmorphic-elevated` - Enhanced depth
- `.glassmorphic-flat` - Subtle effect

### Holographic Classes
- `.holographic` - Animated shimmer overlay
- `.holographic-border` - Animated rainbow border
- `.holographic-text` - Rainbow gradient text
- `.holographic-hover` - Hover effect with overlay
- `.holographic-pulse` - Pulsing glow animation
- `.holographic-glow` - Static holographic glow

### Camo Pattern Classes
- `.camo-background` - Bold camo pattern
- `.camo-background-subtle` - Subtle camo pattern
- `.camo-background-bold` - Enhanced camo pattern
- `.camo-animated` - Animated shifting pattern
- `.camo-overlay` - Overlay effect for layering

## Color Palette

The design system uses the following custom colors (defined in tailwind.config.js):

- `hot-pink`: #FF1493 - Primary actions
- `glossy-black`: #000000 - Text and borders
- `steel-grey`: #708090 - Secondary elements
- `holographic-cyan`: #00FFFF - Holographic effects
- `holographic-magenta`: #FF00FF - Holographic effects
- `holographic-yellow`: #FFFF00 - Holographic effects
- `success-teal`: #40E0D0 - Success indicators
- `girly-pink`: #FFC0CB - Camo pattern base

## Design Principles

1. **Glassmorphism**: All cards and containers use frosted glass effects with backdrop blur
2. **Holographic Accents**: Interactive elements feature rainbow shimmer effects
3. **Girly Camo**: Background patterns use pink, black, and grey camouflage
4. **Smooth Animations**: All transitions use 300ms duration for consistency
5. **Accessibility**: All components support keyboard navigation and screen readers

## Browser Support

- Chrome/Edge 88+
- Firefox 103+
- Safari 15.4+

Note: Backdrop filter effects require modern browsers. Fallbacks are provided for older browsers.
