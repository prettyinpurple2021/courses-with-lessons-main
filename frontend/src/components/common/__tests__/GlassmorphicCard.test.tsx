import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GlassmorphicCard from '../GlassmorphicCard';

describe('GlassmorphicCard', () => {
  it('renders children correctly', () => {
    render(<GlassmorphicCard>Test Content</GlassmorphicCard>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies default variant class', () => {
    const { container } = render(<GlassmorphicCard>Content</GlassmorphicCard>);
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glassmorphic');
  });

  it('applies elevated variant class', () => {
    const { container } = render(
      <GlassmorphicCard variant="elevated">Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glassmorphic-elevated');
  });

  it('applies flat variant class', () => {
    const { container } = render(
      <GlassmorphicCard variant="flat">Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('glassmorphic-flat');
  });

  it('applies holographic border when prop is true', () => {
    const { container } = render(
      <GlassmorphicCard holographicBorder>Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('holographic-border');
  });

  it('applies camo background when prop is true', () => {
    const { container } = render(
      <GlassmorphicCard camoBackground>Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('camo-background');
  });

  it('applies custom className', () => {
    const { container } = render(
      <GlassmorphicCard className="custom-class">Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('custom-class');
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = vi.fn();
    render(<GlassmorphicCard onClick={handleClick}>Click Me</GlassmorphicCard>);
    
    fireEvent.click(screen.getByText('Click Me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('applies cursor-pointer class when onClick is provided', () => {
    const { container } = render(
      <GlassmorphicCard onClick={() => {}}>Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveClass('cursor-pointer');
  });

  it('sets role to button when onClick is provided and no role specified', () => {
    const { container } = render(
      <GlassmorphicCard onClick={() => {}}>Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('role', 'button');
  });

  it('sets custom role when provided', () => {
    const { container } = render(
      <GlassmorphicCard role="article">Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('role', 'article');
  });

  it('sets aria-label when provided', () => {
    const { container } = render(
      <GlassmorphicCard ariaLabel="Test Label">Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('aria-label', 'Test Label');
  });

  it('handles keyboard Enter key when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<GlassmorphicCard onClick={handleClick}>Content</GlassmorphicCard>);
    
    const card = screen.getByText('Content');
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('handles keyboard Space key when onClick is provided', () => {
    const handleClick = vi.fn();
    render(<GlassmorphicCard onClick={handleClick}>Content</GlassmorphicCard>);
    
    const card = screen.getByText('Content');
    fireEvent.keyDown(card, { key: ' ' });
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('does not call onClick for other keyboard keys', () => {
    const handleClick = vi.fn();
    render(<GlassmorphicCard onClick={handleClick}>Content</GlassmorphicCard>);
    
    const card = screen.getByText('Content');
    fireEvent.keyDown(card, { key: 'a' });
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('sets tabIndex to 0 when onClick is provided and no tabIndex specified', () => {
    const { container } = render(
      <GlassmorphicCard onClick={() => {}}>Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('tabIndex', '0');
  });

  it('sets custom tabIndex when provided', () => {
    const { container } = render(
      <GlassmorphicCard tabIndex={-1}>Content</GlassmorphicCard>
    );
    const card = container.firstChild as HTMLElement;
    expect(card).toHaveAttribute('tabIndex', '-1');
  });
});
