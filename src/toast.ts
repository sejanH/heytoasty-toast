import { injectStyle } from './style';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'top-center'
  | 'bottom-center';

/** Reason a toast was dismissed. */
export type DismissReason = 'timeout' | 'manual';

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
  /** Optional toast title (heading shown above the message). */
  title?: string;
  /** Background color override. Any valid CSS color (hex, rgb, etc.). Falls back to the per-type default. */
  bgColor?: string;
  /** Text color override. Any valid CSS color. Falls back to the per-type default. */
  txtColor?: string;
  /** Show a thin progress bar showing time-to-dismiss. Default: false. Sticky toasts hide it. */
  progress?: boolean;
  /** Called when the toast becomes visible. */
  onOpen?: () => void;
  /** Called when the toast is dismissed, with the reason. */
  onClose?: (reason: DismissReason) => void;
}

export interface ToastHandle {
  /** Dismiss this toast immediately. */
  dismiss: (reason?: DismissReason) => void;
  /** The toast DOM element. */
  element: HTMLElement;
}

export interface HeyToasty {
  /** Show a toast. Returns a handle to dismiss it programmatically. */
  show(message: string, options?: ToastOptions): ToastHandle;
  show(message: string, title: string, options?: ToastOptions): ToastHandle;
  success(message: string, options?: Omit<ToastOptions, 'type'>): ToastHandle;
  success(message: string, title: string, options?: Omit<ToastOptions, 'type'>): ToastHandle;
  error(message: string, options?: Omit<ToastOptions, 'type'>): ToastHandle;
  error(message: string, title: string, options?: Omit<ToastOptions, 'type'>): ToastHandle;
  warning(message: string, options?: Omit<ToastOptions, 'type'>): ToastHandle;
  warning(message: string, title: string, options?: Omit<ToastOptions, 'type'>): ToastHandle;
  info(message: string, options?: Omit<ToastOptions, 'type'>): ToastHandle;
  info(message: string, title: string, options?: Omit<ToastOptions, 'type'>): ToastHandle;
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

const DEFAULTS: Required<Omit<ToastOptions, 'onOpen' | 'onClose' | 'bgColor' | 'txtColor'>> & Pick<ToastOptions, 'onOpen' | 'onClose' | 'bgColor' | 'txtColor'> = {
  type: 'success',
  duration: 4000,
  position: 'bottom-right',
  dismissible: true,
  icon: '',
  title: '',
  progress: false,
  bgColor: undefined,
  txtColor: undefined,
  onOpen: undefined,
  onClose: undefined,
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

function makeToast(message: string, titleOrOptions?: string | ToastOptions, options?: ToastOptions): ToastHandle {
  let title: string | undefined;
  let opts: ToastOptions | undefined;
  if (typeof titleOrOptions === 'string') {
    title = titleOrOptions;
    opts = options ?? {};
  } else {
    opts = titleOrOptions ?? {};
    if (!opts.title) opts = { ...opts, title: '' };
  }
  if (title !== undefined) {
    // Title takes precedence over any title in options
    opts = { ...(opts ?? {}), title };
  }
  return createToast(message, opts);
}

function withType(type: ToastType): (message: string, titleOrOptions?: string | Omit<ToastOptions, 'type'>, options?: Omit<ToastOptions, 'type'>) => ToastHandle {
  return (message, titleOrOptions, options) => {
    if (typeof titleOrOptions === 'string') {
      return createToast(message, { ...(options ?? {}), type, title: titleOrOptions });
    }
    return createToast(message, { ...(titleOrOptions ?? {}), type });
  };
}

function createToast(message: string, options: ToastOptions = {}): ToastHandle {
  const opts = { ...DEFAULTS, ...globalDefaults, ...options } as Required<Omit<ToastOptions, 'onOpen' | 'onClose' | 'bgColor' | 'txtColor'>> & Pick<ToastOptions, 'onOpen' | 'onClose' | 'bgColor' | 'txtColor'>;
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
  if (opts.bgColor) element.style.setProperty('--heytoasty-bg', opts.bgColor);
  if (opts.txtColor) element.style.setProperty('--heytoasty-fg', opts.txtColor);

  const showProgress = opts.progress && !!resolvedIcon && opts.duration > 0 && Number.isFinite(opts.duration);
  let progressEl: SVGCircleElement | undefined;

  if (resolvedIcon) {
    const iconEl = document.createElement('span');
    iconEl.className = 'heytoasty-toast__icon';
    iconEl.setAttribute('aria-hidden', 'true');
    iconEl.textContent = resolvedIcon;

    if (showProgress) {
      const wrapper = document.createElement('span');
      wrapper.className = 'heytoasty-toast__icon-ring';
      wrapper.setAttribute('aria-hidden', 'true');
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('viewBox', '0 0 36 36');
      svg.setAttribute('class', 'heytoasty-toast__progress-ring');
      const track = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      track.setAttribute('cx', '18');
      track.setAttribute('cy', '18');
      track.setAttribute('r', '16');
      track.setAttribute('class', 'heytoasty-toast__progress-track');
      progressEl = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      progressEl.setAttribute('cx', '18');
      progressEl.setAttribute('cy', '18');
      progressEl.setAttribute('r', '16');
      progressEl.setAttribute('class', 'heytoasty-toast__progress-circle');
      svg.appendChild(track);
      svg.appendChild(progressEl);
      wrapper.appendChild(svg);
      wrapper.appendChild(iconEl);
      element.appendChild(wrapper);
    } else {
      element.appendChild(iconEl);
    }
  }

  const body = document.createElement('div');
  body.className = 'heytoasty-toast__body';
  if (opts.title) {
    const titleEl = document.createElement('div');
    titleEl.className = 'heytoasty-toast__title';
    titleEl.textContent = opts.title;
    body.appendChild(titleEl);
  }
  const messageEl = document.createElement('div');
  messageEl.className = 'heytoasty-toast__message';
  messageEl.textContent = message;
  body.appendChild(messageEl);
  element.appendChild(body);

  let timer: ReturnType<typeof setTimeout> | undefined;
  let dismissed = false;

  const dismiss = (reason: DismissReason = 'manual'): void => {
    if (dismissed) return;
    dismissed = true;
    if (timer !== undefined) clearTimeout(timer);
    element.classList.remove('heytoasty-toast--visible');
    element.addEventListener(
      'transitionend',
      () => element.remove(),
      { once: true },
    );
    // Fallback in case transitionend never fires (e.g. reduced motion).
    setTimeout(() => element.remove(), 350);
    opts.onClose?.(reason);
  };

  if (opts.dismissible) {
    const close = document.createElement('button');
    close.className = 'heytoasty-toast__close';
    close.type = 'button';
    close.setAttribute('aria-label', 'Dismiss');
    close.textContent = '×';
    close.addEventListener('click', () => dismiss('manual'));
    element.appendChild(close);
  }

  container.appendChild(element);

  // rAF so the enter transition runs from the hidden state.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      element.classList.add('heytoasty-toast--visible');
      opts.onOpen?.();
    });
  });

  if (opts.duration > 0 && Number.isFinite(opts.duration)) {
    timer = setTimeout(() => dismiss('timeout'), opts.duration);
    if (progressEl) {
      progressEl.style.animationDuration = `${opts.duration}ms`;
      requestAnimationFrame(() => progressEl.classList.add('heytoasty-toast__progress--running'));
    }
  }

  const pauseProgress = (): void => {
    if (!progressEl) return;
    progressEl.classList.add('heytoasty-toast__progress--paused');
  };
  const resumeProgress = (): void => {
    if (!progressEl) return;
    progressEl.classList.remove('heytoasty-toast__progress--paused');
  };

  element.addEventListener('mouseenter', () => {
    if (timer !== undefined) clearTimeout(timer);
    pauseProgress();
  });
  element.addEventListener('mouseleave', () => {
    if (opts.duration > 0 && Number.isFinite(opts.duration)) {
      timer = setTimeout(() => dismiss('timeout'), opts.duration);
      resumeProgress();
    }
  });

  return { dismiss: () => dismiss('manual'), element };
}

export const toast: HeyToasty = {
  show: function (message: string, titleOrOptions?: string | ToastOptions, options?: ToastOptions): ToastHandle {
    return makeToast(message, titleOrOptions, options);
  },
  success: withType('success') as HeyToasty['success'],
  error: withType('error') as HeyToasty['error'],
  warning: withType('warning') as HeyToasty['warning'],
  info: withType('info') as HeyToasty['info'],
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
