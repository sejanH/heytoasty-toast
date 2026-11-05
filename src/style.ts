/**
 * Injected CSS for heytoasty.
 * Recreated from the HeyToasty admin panel FlashToaster tokens
 * (crust border, shadow-pop) as plain CSS — no Tailwind required.
 */

export const css = `
.heytoasty-container {
  position: fixed;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  pointer-events: none;
  max-width: min(24rem, calc(100vw - 2rem));
}
.heytoasty-container[data-position="bottom-right"] { right: 1rem; bottom: 1rem; align-items: flex-end; }
.heytoasty-container[data-position="bottom-left"]  { left: 1rem;  bottom: 1rem; align-items: flex-start; }
.heytoasty-container[data-position="top-right"]    { right: 1rem; top: 1rem;   align-items: flex-end; }
.heytoasty-container[data-position="top-left"]     { left: 1rem;  top: 1rem;   align-items: flex-start; }
.heytoasty-container[data-position="top-center"]   { top: 1rem; left: 50%; transform: translateX(-50%); align-items: center; }
.heytoasty-container[data-position="bottom-center"]{ bottom: 1rem; left: 50%; transform: translateX(-50%); align-items: center; }

.heytoasty-toast {
  --heytoasty-bg: #e2f3cc;
  --heytoasty-fg: #3f6b1f;
  pointer-events: auto;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  max-width: 24rem;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  border: 2px solid #452d1a;
  background: var(--heytoasty-bg);
  color: var(--heytoasty-fg);
  font-weight: 700;
  font-family: ui-sans-serif, system-ui, sans-serif;
  box-shadow: 0 4px 0 0 #452d1a;
  transition: transform 300ms ease, opacity 300ms ease;
  transform: translateY(1rem);
  opacity: 0;
  line-height: 1.4;
}
.heytoasty-toast.heytoasty-toast--visible {
  transform: translateY(0);
  opacity: 1;
}
.heytoasty-toast[data-type="success"] { --heytoasty-bg: #e2f3cc; --heytoasty-fg: #3f6b1f; }
.heytoasty-toast[data-type="error"]   { --heytoasty-bg: #ffe1d6; --heytoasty-fg: #b02d0f; }
.heytoasty-toast[data-type="warning"] { --heytoasty-bg: #fff3c4; --heytoasty-fg: #b45909; }
.heytoasty-toast[data-type="info"]    { --heytoasty-bg: #d5f1fd; --heytoasty-fg: #1784b6; }

.heytoasty-toast__icon { flex: none; font-size: 1.1em; line-height: 1; }
.heytoasty-toast__message { flex: 1 1 auto; word-break: break-word; }
.heytoasty-toast__close {
  flex: none;
  appearance: none;
  border: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  font-size: 1rem;
  line-height: 1;
  padding: 0.25rem;
  border-radius: 9999px;
  opacity: 0.7;
}
.heytoasty-toast__close:hover { opacity: 1; }
`;

let injected = false;

export function injectStyle(): void {
  if (injected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.setAttribute('data-heytoasty', '');
  el.textContent = css;
  document.head.appendChild(el);
  injected = true;
}
