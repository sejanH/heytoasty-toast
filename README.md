# heytoasty

A tiny vanilla JS/TS toast notification library extracted from the [HeyToasty](https://github.com/sejanH/hetoasty-toastr) admin panel. Zero dependencies — the package injects its own CSS, works in any framework (React, Vue, Svelte, Angular, plain JS), and ships as ESM + CJS with full TypeScript types.

## Install

```bash
npm install heytoasty
```

## Usage

```ts
import { toast } from 'heytoasty';

toast.success('Saved!');
toast.error('Something went wrong');
toast.warning('Heads up');
toast.info('FYI');

// Generic form
toast.show('Custom', { type: 'info', duration: 6000, position: 'top-right' });
```

CSS is injected automatically on first use — no stylesheet to import, no setup required.

## API

| Method | Description |
|---|---|
| `toast.success(message, options?)` | Green toast with 🎉 (default icon) |
| `toast.error(message, options?)` | Red toast with 🙈 |
| `toast.warning(message, options?)` | Yellow toast with ⚠️ |
| `toast.info(message, options?)` | Blue toast with ℹ️ |
| `toast.show(message, options?)` | Generic toast, type via `options.type` |
| `toast.dismissAll()` | Remove every toast |
| `toast.setPosition(position)` | Default position for future toasts |
| `toast.configure(defaults)` | Global defaults applied to every toast |

Each call returns `{ dismiss, element }` so you can dismiss a single toast programmatically.

### Options

| Option | Type | Default | Notes |
|---|---|---|---|
| `type` | `'success' \| 'error' \| 'warning' \| 'info'` | `'success'` | Color scheme + default icon. |
| `duration` | `number` (ms) | `4000` | `0` or `Infinity` = sticky (never auto-dismiss). Pauses on hover. |
| `position` | `'bottom-right' \| 'bottom-left' \| 'top-right' \| 'top-left' \| 'top-center' \| 'bottom-center'` | `'bottom-right'` | Per-toast or global via `setPosition`. |
| `dismissible` | `boolean` | `true` | Shows a × close button. |
| `icon` | `string` | per-type default | Pass `''` to hide the icon, or any emoji/string to override. |
| `title` | `string` | — | `title` attribute on the toast element. |

## Example: configure once

```ts
import { toast } from 'heytoasty';

toast.configure({ position: 'bottom-left', duration: 5000 });
toast.success('All set!');
```

## License

MIT
