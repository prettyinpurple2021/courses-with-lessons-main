import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import GlassmorphicCard from '../GlassmorphicCard';
import GlassmorphicButton from '../GlassmorphicButton';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  describe('GlassmorphicCard', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <GlassmorphicCard ariaLabel="Test card">
          <h2>Card Title</h2>
          <p>Card content</p>
        </GlassmorphicCard>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be keyboard accessible when clickable', async () => {
      const { container } = render(
        <GlassmorphicCard onClick={() => {}} ariaLabel="Clickable card">
          Content
        </GlassmorphicCard>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  describe('GlassmorphicButton', () => {
    it('should not have accessibility violations', async () => {
      const { container } = render(
        <GlassmorphicButton ariaLabel="Test button">
          Click Me
        </GlassmorphicButton>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible when disabled', async () => {
      const { container } = render(
        <GlassmorphicButton disabled ariaLabel="Disabled button">
          Disabled
        </GlassmorphicButton>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should be accessible when loading', async () => {
      const { container } = render(
        <GlassmorphicButton loading ariaLabel="Loading button">
          Loading
        </GlassmorphicButton>
      );
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });
});
