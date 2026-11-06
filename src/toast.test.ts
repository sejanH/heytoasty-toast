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

  it('renders title as a visible heading above the message', () => {
    const { element } = toast.success('Saved!', 'Your file is ready');
    const title = element.querySelector('.heytoasty-toast__title');
    const message = element.querySelector('.heytoasty-toast__message');
    expect(title?.textContent).toBe('Your file is ready');
    expect(message?.textContent).toBe('Saved!');
    expect(element.getAttribute('title')).toBe('Your file is ready');
  });

  it('accepts title as second arg with options on show', () => {
    const { element } = toast.show('Oops', 'Upload error', { type: 'error', duration: 0 });
    expect(element.dataset.type).toBe('error');
    expect(element.querySelector('.heytoasty-toast__title')?.textContent).toBe('Upload error');
  });

  it('renders title from options too', () => {
    const { element } = toast.info('Details here', { title: 'Heads up' });
    expect(element.querySelector('.heytoasty-toast__title')?.textContent).toBe('Heads up');
  });

  it('omits title element when no title is given', () => {
    const { element } = toast.success('Plain');
    expect(element.querySelector('.heytoasty-toast__title')).toBeNull();
  });

  it('calls onOpen when the toast becomes visible', () => {
    vi.useFakeTimers();
    const onOpen = vi.fn();
    toast.success('Hi', { duration: 0, onOpen });
    expect(onOpen).toHaveBeenCalledTimes(0);
    toast.success('Hi2', { duration: 0, onOpen });
    vi.runAllTimers();
    expect(onOpen).toHaveBeenCalledTimes(2);
  });

  it('calls onClose with manual reason via close button and handle', () => {
    const onClose = vi.fn();
    const { element } = toast.success('Bye', { duration: 0, onClose });
    element.querySelector<HTMLButtonElement>('.heytoasty-toast__close')?.click();
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith('manual');
    // Second dismiss is a no-op (guarded)
    element.querySelector<HTMLButtonElement>('.heytoasty-toast__close')?.click();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose with timeout reason on auto-dismiss', () => {
    vi.useFakeTimers();
    const onClose = vi.fn();
    toast.info('Tick', { duration: 1000, onClose });
    vi.advanceTimersByTime(1000);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledWith('timeout');
  });

  it('shows a progress bar when progress is true', () => {
    const { element } = toast.success('With progress', { duration: 3000, progress: true });
    const ring = element.querySelector('.heytoasty-toast__icon-ring');
    expect(ring).not.toBeNull();
    const circle = ring?.querySelector('.heytoasty-toast__progress-circle');
    expect(circle).not.toBeNull();
    expect((circle as SVGCircleElement).style.animationDuration).toBe('3000ms');
  });

  it('hides progress for sticky toasts', () => {
    const { element } = toast.success('Sticky', { duration: 0, progress: true });
    expect(element.querySelector('.heytoasty-toast__icon-ring')).toBeNull();
  });

  it('hides progress when progress is false', () => {
    const { element } = toast.success('No progress', { duration: 3000 });
    expect(element.querySelector('.heytoasty-toast__icon-ring')).toBeNull();
  });

  it('applies bgColor and txtColor overrides', () => {
    const { element } = toast.success('Custom colors', { bgColor: '#1e293b', txtColor: '#f8fafc' });
    expect(element.style.getPropertyValue('--heytoasty-bg')).toBe('#1e293b');
    expect(element.style.getPropertyValue('--heytoasty-fg')).toBe('#f8fafc');
  });

  it('falls back to per-type defaults when colors are not set', () => {
    const { element } = toast.error('Default colors');
    expect(element.style.getPropertyValue('--heytoasty-bg')).toBe('');
    expect(element.style.getPropertyValue('--heytoasty-fg')).toBe('');
  });

  it('applies colors via global defaults', () => {
    toast.configure({ bgColor: '#0f172a', txtColor: '#e2e8f0' });
    const { element } = toast.info('Global colors');
    expect(element.style.getPropertyValue('--heytoasty-bg')).toBe('#0f172a');
    expect(element.style.getPropertyValue('--heytoasty-fg')).toBe('#e2e8f0');
  });
});
