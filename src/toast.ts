import { injectStyle } from './style';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-center';

export interface ToastOptions {
  /** Toast type. Default: 'success'. */
  type?: ToastType;
  /** Milliseconds before auto-dismiss. 0 or Infinity disables it. Default: 4000. */
  duration?: number;
  /** Corner/edge on screen. Default: 'bottom-right'. */
  position?: ToastPosition;
  /** Show a close (×) button. Default: true. */
  dismissible?: boolean;
  /** Emoji icon. Pass '' to hide it. Overrides the per-type default. */
  icon?: string;
  /** Accessible label / title. */
  title?: string;
}

export interface ToastHandle {
  /** Dismiss this toast immediately. */
  dismiss: () => void;
  /** The toast DOM element. */
  element: HTMLElement;
}

export interface HeyToasty {
  /** Show a toast. Returns a handle to dismiss it programmatically. */
  show: (message: string, options?: ToastOptions) => ToastHandle;
  success: (message: string, options?: Omit<ToastOptions, 'type'>) => ToastHandle;
  error: (message: string, options?: Omit<ToastOptions, 'type'>) => ToastHandle;
  warning: (message: string, options?: Omit<ToastOptions, 'type'>) => ToastHandle;
  info: (message: string, options?: Omit<ToastOptions, 'type'>) => ToastHandle;
  /** Dismiss all visible toasts. */
  dismissAll: () => void;
  /** Set the default position for new toasts. */
  setPosition: (position: ToastPosition) => void;
  /** Set global defaults applied to every toast. */
  configure: (defaults: ToastOptions) => void;
}

const DEFAULT_ICONS: Record<ToastType, string> = {
  success: '🎉',
  error: '🙈',
  warning: '⚠️',
  info: 'ℹ️',
};

const DEFAULTS: Required<ToastOptions> = {
  type: 'success',
  duration: 4000,
  position: 'bottom-right',
  dismissible: true,
  icon: '',
  title: '',
};

let globalDefaults: ToastOptions = {};
let currentPosition: ToastPosition = 'bottom-right';

const containers = new Map<ToastPosition, HTMLElement>();

function getContainer(position: ToastPosition): HTMLElement {
  injectStyle();
  let container = containers.get(position);
  if (container && container.isConnected) return container;

  container =
    document.querySelector<HTMLElement>(`[data-heytoasty-container="${position}"]`) ??
    (() => {
      const el = document.createElement('div');
      el.className = 'heytoasty-container';
      el.dataset.position = position;
      el.setAttribute('data-heytoasty-container', position);
      document.body.appendChild(el);
      return el;
    })();

  containers.set(position, container);
  return container;
}

function createToast(message: string, options: ToastOptions = {}): ToastHandle {
  const opts: Required<ToastOptions> = { ...DEFAULTS, ...globalDefaults, ...options };
  const position = opts.position ?? currentPosition;
  const type: ToastType = opts.type ?? 'success';
  // Honor an explicit empty string to hide the icon; fall back to per-type default only
  // when no icon option was provided at any level.
  const hasIconOption =
    options.icon !== undefined || globalDefaults.icon !== undefined;
  const resolvedIcon = hasIconOption ? (opts.icon ?? '') : DEFAULT_ICONS[type];

  const container = getContainer(position);

  const element = document.createElement('div');
  element.className = 'heytoasty-toast';
  element.dataset.type = type;
  element.setAttribute('role', 'status');
  element.setAttribute('aria-live', 'polite');
  if (opts.title) element.setAttribute('title', opts.title);

  if (resolvedIcon) {
    const iconEl = document.createElement('span');
    iconEl.className = 'heytoasty-toast__icon';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.textContent = resolvedIcon;
    element.appendChild(iconEl);
  }

  const messageEl = document.createElement('span');
  messageEl.className = 'heytoasty-toast__message';
  messageEl.textContent = message;
  element.appendChild(messageEl);

  let timer: ReturnType<typeof setTimeout> | undefined;

  const dismiss = (): void => {
    if (timer !== undefined) clearTimeout(timer);
    element.classList.remove('heytoasty-toast--visible');
    element.addEventListener(
      'transitionend',
      () => element.remove(),
      { once: true },
    );
    // Fallback in case transitionend never fires (e.g. reduced motion).
    setTimeout(() => element.remove(), 350);
  };

  if (opts.dismissible) {
    const close = document.createElement('button');
    close.className = 'heytoasty-toast__close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';
    close.addEventListener('click', dismiss);
    element.appendChild(close);
  }

  container.appendChild(element);

  // rAF so the enter transition runs from the hidden state.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => element.classList.add('heytoasty-toast--visible'));
  });

  if (opts.duration > 0 && Number.isFinite(opts.duration)) {
    timer = setTimeout(dismiss, opts.duration);
  }

  element.addEventListener('mouseenter', () => {
    if (timer !== undefined) clearTimeout(timer);
  });
  element.addEventListener('mouseleave', () => {
    if (opts.duration > 0 && Number.isFinite(opts.duration)) {
      timer = setTimeout(dismiss, opts.duration);
    }
  });

  return { dismiss, element };
}

export const toast: HeyToasty = {
  show: (message, options) => createToast(message, options),
  success: (message, options) => createToast(message, { ...options, type: 'success' }),
  error: (message, options) => createToast(message, { ...options, type: 'error' }),
  warning: (message, options) => createToast(message, { ...options, type: 'warning' }),
  info: (message, options) => createToast(message, { ...options, type: 'info' }),
  dismissAll: () => {
    document
      .querySelectorAll<HTMLElement>('.heytoasty-toast')
      .forEach((el) => el.remove());
  },
  setPosition: (position) => {
    currentPosition = position;
  },
  configure: (defaults) => {
    globalDefaults = { ...globalDefaults, ...defaults };
  },
};

export default toast;

/** Convenience top-level helpers (same as toast.success etc.). */
export const success = toast.success;
export const error = toast.error;
export const warning = toast.warning;
export const info = toast.info;
export const show = toast.show;
export const dismissAll = toast.dismissAll;
