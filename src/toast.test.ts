import { afterEach, describe, expect, it, vi } from 'vitest';
import { dismissAll, toast } from './index';

afterEach(() => {
  dismissAll();
  document.body.innerHTML = '';
  vi.useRealTimers();
});

describe('heytoasty', () => {
  it('shows a success toast with message and icon', () => {
    const { element } = toast.success('Saved!');
    expect(element.textContent).toContain('Saved!');
    expect(element.dataset.type).toBe('success');
    expect(element.textContent).toContain('🎉');
  });

  it('shows an error toast with 🙈 by default', () => {
    const { element } = toast.error('Oops');
    expect(element.dataset.type).toBe('error');
    expect(element.textContent).toContain('🙈');
  });

  it('auto-dismisses after duration', async () => {
    vi.useFakeTimers();
    const { element } = toast.info('Tick', { duration: 1000 });
    expect(document.body.contains(element)).toBe(true);
    vi.advanceTimersByTime(1000);
    vi.advanceTimersByTime(400);
    expect(document.body.contains(element)).toBe(false);
  });

  it('does not auto-dismiss when duration is 0', () => {
    vi.useFakeTimers();
    const { element } = toast.success('Sticky', { duration: 0 });
    vi.advanceTimersByTime(60_000);
    expect(document.body.contains(element)).toBe(true);
  });

  it('hides the icon when icon is an empty string', () => {
    const { element } = toast.success('No icon', { icon: '' });
    expect(element.querySelector('.heytoasty-toast__icon')).toBeNull();
  });

  it('uses a custom icon', () => {
    const { element } = toast.success('Custom', { icon: '🍞' });
    expect(element.textContent).toContain('🍞');
  });

  it('dismisses via handle and via close button', () => {
    const { element, dismiss } = toast.success('Bye');
    dismiss();
    expect(element.classList.contains('heytoasty-toast--visible')).toBe(false);

    const second = toast.success('Bye 2');
    const close = second.element.querySelector<HTMLButtonElement>('.heytoasty-toast__close');
    expect(close).not.toBeNull();
    close?.click();
    expect(second.element.classList.contains('heytoasty-toast--visible')).toBe(false);
  });

  it('omits the close button when dismissible is false', () => {
    const { element } = toast.success('No close', { dismissible: false });
    expect(element.querySelector('.heytoasty-toast__close')).toBeNull();
  });

  it('stacks toasts in the same container', () => {
    toast.success('One');
    toast.error('Two');
    expect(document.querySelectorAll('.heytoasty-toast')).toHaveLength(2);
  });

  it('dismissAll removes every toast', () => {
    toast.success('A');
    toast.error('B');
    dismissAll();
    expect(document.querySelectorAll('.heytoasty-toast')).toHaveLength(0);
  });

  it('uses a different position container', () => {
    toast.info('Top', { position: 'top-left' });
    const container = document.querySelector('[data-heytoasty-container="top-left"]');
    expect(container).not.toBeNull();
    expect(container?.querySelector('.heytoasty-toast')?.textContent).toContain('Top');
  });

  it('escapes HTML in messages (textContent, not innerHTML)', () => {
    const { element } = toast.success('<script>alert(1)</script>');
    expect(element.querySelector('script')).toBeNull();
    expect(element.textContent).toContain('<script>alert(1)</script>');
  });
});
