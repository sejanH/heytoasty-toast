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
  position: relative;
  overflow: hidden;
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

.heytoasty-toast__icon { flex: none; font-size: 1.1em; line-height: 1; align-self: flex-start; }
.heytoasty-toast__icon-ring {
  flex: none;
  position: relative;
  width: 2.25rem;
  height: 2.25rem;
  display: grid;
  place-items: center;
  align-self: flex-start;
}
.heytoasty-toast__icon-ring .heytoasty-toast__icon {
  position: absolute;
  inset: 0;
  display: grid;
  place-items: center;
  font-size: 1.1em;
  line-height: 1;
  align-self: center;
  text-align: center;
}
.heytoasty-toast__progress-ring {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  transform: rotate(-90deg);
  overflow: visible;
}
.heytoasty-toast__progress-track {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  opacity: 0.2;
}
.heytoasty-toast__progress-circle {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-dasharray: 100.53;
  stroke-dashoffset: 0;
  opacity: 0.9;
}
.heytoasty-toast__progress-circle.heytoasty-toast__progress--running {
  animation: heytoasty-ring linear forwards;
}
.heytoasty-toast__progress-circle.heytoasty-toast__progress--paused {
  animation-play-state: paused;
}
@keyframes heytoasty-ring {
  from { stroke-dashoffset: 0; }
  to { stroke-dashoffset: 100.53; }
}
.heytoasty-toast__body { flex: 1 1 auto; display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.heytoasty-toast__title { font-size: 0.95em; line-height: 1.3; word-break: break-word; }
.heytoasty-toast__message { word-break: break-word; font-weight: 500; }
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
/* Legacy bar progress — no longer emitted, kept for backwards-compat */
.heytoasty-toast__progress { display: none; }
.heytoasty-toast__progress--running { animation: heytoasty-progress linear forwards; }
.heytoasty-toast__progress--paused { animation-play-state: paused; }
@keyframes heytoasty-progress {
  from { transform: scaleX(1); }
  to { transform: scaleX(0); }
}`;

let injected = false;

export function injectStyle(): void {
  if (injected || typeof document === 'undefined') return;
  const el = document.createElement('style');
  el.setAttribute('data-heytoasty', '');
  el.textContent = css;
  document.head.appendChild(el);
  injected = true;
}
