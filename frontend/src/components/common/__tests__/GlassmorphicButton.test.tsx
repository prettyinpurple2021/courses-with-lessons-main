import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassmorphicButton from '../GlassmorphicButton';

describe('GlassmorphicButton', () => {
  it('renders children correctly', () => {
    render(<GlassmorphicButton>Click Me</GlassmorphicButton>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('applies primary variant classes by default', () => {
    render(<GlassmorphicButton>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-hot-pink/20');
  });

  it('applies secondary variant classes', () => {
    render(<GlassmorphicButton variant="secondary">Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-success-teal/20');
  });

  it('applies outline variant classes', () => {
    render(<GlassmorphicButton variant="outline">Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-transparent');
  });

  it('applies small size classes', () => {
    render(<GlassmorphicButton size="sm">Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
  });

  it('applies medium size classes by default', () => {
    render(<GlassmorphicButton>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-6', 'py-3', 'text-base');
  });

  it('applies large size classes', () => {
    render(<GlassmorphicButton size="lg">Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('px-8', 'py-4', 'text-lg');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<GlassmorphicButton onClick={handleClick}>Click Me</GlassmorphicButton>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <GlassmorphicButton onClick={handleClick} disabled>
        Click Me
      </GlassmorphicButton>
    );
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies disabled classes when disabled', () => {
    render(<GlassmorphicButton disabled>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(button).toBeDisabled();
  });

  it('shows loading spinner when loading', () => {
    render(<GlassmorphicButton loading>Button</GlassmorphicButton>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
    expect(screen.queryByText('Button')).not.toBeInTheDocument();
  });

  it('applies disabled classes when loading', () => {
    render(<GlassmorphicButton loading>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
    expect(button).toBeDisabled();
  });

  it('does not apply holographic class when disabled', () => {
    render(<GlassmorphicButton disabled>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('holographic');
  });

  it('does not apply holographic class when loading', () => {
    render(<GlassmorphicButton loading>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).not.toHaveClass('holographic');
  });

  it('applies holographic class when not disabled or loading', () => {
    render(<GlassmorphicButton>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('holographic');
  });

  it('sets button type to button by default', () => {
    render(<GlassmorphicButton>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'button');
  });

  it('sets button type to submit when specified', () => {
    render(<GlassmorphicButton type="submit">Submit</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('applies custom className', () => {
    render(<GlassmorphicButton className="custom-class">Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('sets aria-label when provided', () => {
    render(<GlassmorphicButton ariaLabel="Custom Label">Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Custom Label');
  });

  it('sets aria-busy to true when loading', () => {
    render(<GlassmorphicButton loading>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('sets aria-disabled when disabled', () => {
    render(<GlassmorphicButton disabled>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });

  it('sets aria-disabled when loading', () => {
    render(<GlassmorphicButton loading>Button</GlassmorphicButton>);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-disabled', 'true');
  });
});
