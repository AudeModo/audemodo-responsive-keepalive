# responsive-keepalive

**Render genuinely different component trees per breakpoint — without losing state.**
Powered by React 19.2's `<Activity>`, with anti-thrash and IME-safe switching.

[![npm version](https://img.shields.io/npm/v/@audemodo%2Fresponsive-keepalive.svg)](https://www.npmjs.com/package/@audemodo%2Fresponsive-keepalive)
[![license](https://img.shields.io/npm/l/@audemodo%2Fresponsive-keepalive.svg)](./LICENSE)
[![types included](https://img.shields.io/npm/types/@audemodo%2Fresponsive-keepalive.svg)](https://www.npmjs.com/package/@audemodo%2Fresponsive-keepalive)

When your mobile and desktop views are **different component trees**, switching between
them at a breakpoint normally unmounts one and mounts the other — wiping scroll position,
form input, open menus, and any local state. `responsive-keepalive` keeps the inactive
tree **mounted but hidden** via React's `<Activity>`, so state survives every switch.

```tsx
// The same counter's value survives switching mobile ⇄ desktop.
<Responsive
  variant={variant}
  variants={{
    mobile: () => <MobileLayout />,
    desktop: () => <DesktopLayout />,
  }}
/>
```

## Features

- 🌳 **Structural** responsiveness — swap whole trees per breakpoint, not just CSS.
- 💾 **State preserved** across switches (scroll, input, selection) — keep-alive by default.
- 📐 Viewport, **container** (ResizeObserver), and **value-level** responsiveness.
- 🧩 A typed **factory** (`createResponsive`) — one config, inferred keys, composable gates.
- 🔁 **Shared state** across layouts without lifting (`useSharedState`).
- 🖥️ **SSR-safe** (`useSyncExternalStore`) with an `ssr` fallback variant.
- ⌨️ **IME-safe** switching (`deferWhileComposing`) and **anti-thrash** (`settleMs`).
- 🪶 Zero runtime deps, tree-shakeable, dual **ESM/CJS + types**.
- 🛟 Graceful fallback to `swap` on React &lt; 19.2.

## Install

```bash
npm i @audemodo/responsive-keepalive
```

Requires **React 19.2+** (peer dependency) — `<Activity>` is a React 19.2 feature.

## Quick start

Define your breakpoints once with the factory:

```tsx
// responsive.ts
import { createResponsive } from '@audemodo/responsive-keepalive';

export const { Responsive, Provider } = createResponsive(
  { mobile: 0, desktop: 768 }, // integer px breakpoints
  { ssr: 'mobile' },
);
```

Then render one prop per breakpoint — the active view is resolved from the viewport:

```tsx
// App.tsx
import { Provider, Responsive } from './responsive';

export function App() {
  return (
    <Provider>
      <Responsive mobile={() => <MobileLayout />} desktop={() => <DesktopLayout />} />
    </Provider>
  );
}
```

Resize across `768px`: the layout switches, but each layout keeps its state.

## Core concepts

| Term         | Meaning                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| **variant**  | The active breakpoint key, e.g. `'mobile' \| 'desktop'`.                         |
| **variants** | A map of key → the tree (or `() => tree`) to render.                             |
| **strategy** | `keepAlive` (default, state preserved via Activity) or `swap` (unmount → reset). |
| **mount**    | `lazy` (default, mount on first activation) or `eager` (mount all upfront).      |
| **ssr**      | The variant rendered on the server and before hydration.                         |

## API

### `createResponsive(breakpoints, defaults?)`

Builds a self-resolving `<Responsive>`, a root `Provider`, composable `Match` gates, and
pre-bound hooks — all typed to your config. Breakpoints are **integer px min-widths**.

```tsx
export const { Responsive, Provider, Match, useVariant, useResponsiveValue } = createResponsive(
  { mobile: 0, desktop: 768 },
  { ssr: 'mobile' },
);

export const { Mobile, Desktop } = Match;
```

```tsx
// Composable gates — drop them anywhere under <Provider>.
<Provider>
  <Desktop>
    <DesktopNav />
  </Desktop>
  <Mobile>
    <MobileTabBar />
  </Mobile>
</Provider>;

// Pre-bound hooks — no queries to repeat.
function Toolbar() {
  const variant = useVariant(); // 'mobile' | 'desktop'
  const gap = useResponsiveValue({ mobile: 8, desktop: 24 });
  return <div style={{ gap }}>…</div>;
}
```

Returns `{ Responsive, Provider, Match, useVariant, useResponsiveValue, breakpoints }`.

### `<Responsive>`

The controlled primitive — you supply the active `variant` and a `variants` map.

```tsx
import { Responsive, useMediaVariant } from '@audemodo/responsive-keepalive';

const variant = useMediaVariant({ mobile: 0, desktop: 768 }, { ssr: 'mobile' });

<Responsive
  variant={variant}
  variants={{
    mobile: () => <MobileLayout />,
    desktop: () => <DesktopLayout />,
  }}
  strategy="keepAlive" // default
  mount="lazy" // default
/>;
```

| Prop       | Type                                      | Default       | Description                                    |
| ---------- | ----------------------------------------- | ------------- | ---------------------------------------------- |
| `variant`  | `K`                                       | —             | The active variant key (you control this).     |
| `variants` | `Record<K, ReactNode \| () => ReactNode>` | —             | Map of key → content. `() =>` defers creation. |
| `strategy` | `'keepAlive' \| 'swap'`                   | `'keepAlive'` | Preserve inactive state, or unmount it.        |
| `mount`    | `'lazy' \| 'eager'`                       | `'lazy'`      | Mount on first activation, or all upfront.     |

### `useMediaVariant(breakpoints, options?)`

Resolves a variant key from the **viewport**. Accepts integer px breakpoints (recommended)
or raw media-query strings (for non-width features like orientation).

```tsx
const variant = useMediaVariant(
  { mobile: 0, desktop: 768 },
  { ssr: 'mobile', settleMs: 150, deferWhileComposing: true },
);

// raw queries for non-width features
const scheme = useMediaVariant({
  light: '(prefers-color-scheme: light)',
  dark: '(prefers-color-scheme: dark)',
});
```

### `useResponsiveValue(breakpoints, values, options?)`

Picks a **plain value** per breakpoint — for column counts, gaps, or copy where a whole
tree is overkill.

```tsx
const columns = useResponsiveValue(
  { mobile: 0, tablet: 600, desktop: 1024 },
  { mobile: 1, tablet: 2, desktop: 3 },
  { ssr: 'mobile' },
);
```

### `useContainerVariant(ref, breakpoints, options?)`

Like `useMediaVariant`, but resolves from the **element's own width** (via ResizeObserver)
— so the same card can be a row in a wide column and a stack in a narrow one. Breakpoints
are integer min content-widths.

```tsx
const ref = useRef<HTMLDivElement>(null);
const variant = useContainerVariant(ref, { stack: 0, row: 420, wide: 680 }, { ssr: 'stack' });

return <div ref={ref}>{/* branch on variant */}</div>;
```

### `useSharedState(key, initialValue)` & `<SharedStateScope>`

Share state by key across sibling layouts **without lifting it to a parent**. Because the
store lives in a scope ancestor, the value also survives `swap` and remounts.

```tsx
function SearchField() {
  const [query, setQuery] = useSharedState('search', '');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}
```

> `<Responsive>` and the factory `<Provider>` mount a scope automatically, so inside them
> you can call `useSharedState` directly. Use `<SharedStateScope>` only for siblings that
> are under neither.

### Options

All resolution hooks accept:

| Option                | Type      | Description                                                    |
| --------------------- | --------- | -------------------------------------------------------------- |
| `ssr`                 | `K`       | Variant returned on the server and before hydration.           |
| `settleMs`            | `number`  | Anti-thrash: commit a change only after it is stable for N ms. |
| `deferWhileComposing` | `boolean` | Hold switches during IME composition (media hooks only).       |

### Exported types

`Strategy`, `Mount`, `VariantMap`, `ResponsiveProps`, `MediaInput`, `MediaVariantOptions`,
`ResponsiveValueOptions`, `ContainerVariantOptions`, `BreakpointConfig`,
`CreateResponsiveOptions`, `ConfiguredResponsive`, `ConfiguredResponsiveProps`,
`ResponsiveProviderProps`, `MatchProps`, `SetSharedState`.

## Recipes

**Next.js / SSR** — feed a request-derived variant so the server renders the right tree:

```tsx
// app/layout.tsx (server)
<Provider ssr={isMobileUA(headers()) ? 'mobile' : 'desktop'}>{children}</Provider>
```

**Shared search across layouts** — the mobile and desktop search boxes stay in sync:

```tsx
<Provider>
  <Mobile>
    <SearchField />
  </Mobile>
  <Desktop>
    <SearchField />
  </Desktop>
</Provider>
```

## Behavior notes

- **SSR** renders the `ssr` variant on the server; after hydration it resolves to the real
  viewport, which may cause a **one-time** layout shift (not continuous flicker).
- **React &lt; 19.2** has no `<Activity>`, so the library falls back to `swap` (state is not
  preserved) and warns once in development.
- `strategy` and `mount` are independent: `mount="eager"` only matters under `keepAlive`.

## License

[MIT](./LICENSE) © vi-wolhwa
