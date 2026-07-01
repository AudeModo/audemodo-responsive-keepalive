import type { ReactElement, ReactNode } from 'react';

/** Whether inactive variants stay mounted with state preserved, or are unmounted on switch. */
export type Strategy = 'keepAlive' | 'swap';

/** When a variant first mounts: on first activation (`lazy`) or all upfront (`eager`). */
export type Mount = 'lazy' | 'eager';

/**
 * Map of variant key → the content to render for that variant. Each value may be a
 * React node (`<Layout />`, the ergonomic default) or a function returning one
 * (`() => <Layout />`), which defers creating the node until the variant is mounted —
 * worth it only for heavy trees that may never be shown.
 */
export type VariantMap<K extends string> = Record<K, ReactNode | (() => ReactNode)>;

/** Props for the controlled `<Responsive>` primitive. */
export interface ResponsiveProps<K extends string> {
  /** The active variant key — caller-controlled (a viewport hook, a feature flag, an SSR header, …). */
  variant: NoInfer<K>;
  /** Map of variant key → content to render. */
  variants: VariantMap<K>;
  /**
   * - `keepAlive` (default): inactive variants stay mounted with their state preserved,
   *   hidden via React's `<Activity>`. Effects suspend while hidden.
   * - `swap`: only the active variant is mounted; switching unmounts the previous one.
   */
  strategy?: Strategy;
  /**
   * - `lazy` (default): a variant mounts on first activation, then is kept alive.
   * - `eager`: all variants mount immediately. Only affects `keepAlive`.
   */
  mount?: Mount;
}

/** @internal Shared props for the strategy renderer components (`KeepAliveVariants`, `SwapVariant`). */
export interface VariantRenderProps<K extends string> {
  variant: K;
  variants: VariantMap<K>;
}

/** Options for `useMediaVariant`. */
export interface MediaVariantOptions<K extends string> {
  /** Variant returned on the server and before hydration (avoids a mismatch). */
  ssr?: K;
  /**
   * Anti-thrash. Commit a variant change only after the new value has been stable for this
   * many milliseconds. `0` (default) commits immediately.
   */
  settleMs?: number;
  /**
   * Hold variant switches while an IME composition is active, applying the pending variant
   * once composition ends. Default `false`.
   */
  deferWhileComposing?: boolean;
}

/** Options for `useResponsiveValue`. */
export interface ResponsiveValueOptions<K extends string> {
  /** Variant whose value is returned on the server and before hydration. */
  ssr?: K;
  /** Anti-thrash: commit a change only after the matched variant is stable for N ms. */
  settleMs?: number;
}

/** Options for `useContainerVariant`. */
export interface ContainerVariantOptions<K extends string> {
  /** Variant returned before the first measurement and on the server. */
  ssr?: K;
  /** Anti-thrash: commit a change only after the width is stable for N ms. */
  settleMs?: number;
}

/**
 * Breakpoint configuration for `createResponsive`: integer pixel min-width thresholds that
 * derive non-overlapping mobile-first bands (the lowest threshold is the floor, usually `0`).
 * Media-query strings are not accepted here.
 */
export type BreakpointConfig<K extends string> = Record<K, number>;

/** Resolution options applied by a configured `<Responsive>` / `useVariant`. */
export interface CreateResponsiveOptions<K extends string> {
  ssr?: K;
  settleMs?: number;
  deferWhileComposing?: boolean;
}

/**
 * Props of a configured `<Responsive>`: one required render-function prop per variant key,
 * plus optional rendering and resolution controls. The variant keys come from the
 * `createResponsive` config, so missing or unknown keys are type errors.
 */
export type ConfiguredResponsiveProps<K extends string> = {
  [P in K]: ReactNode | (() => ReactNode);
} & {
  strategy?: Strategy;
  mount?: Mount;
  ssr?: K;
  settleMs?: number;
  deferWhileComposing?: boolean;
};

/** The configured primitives returned by `createResponsive`. */
export interface ConfiguredResponsive<K extends string> {
  /** Self-resolving `<Responsive>` with one render prop per variant. */
  Responsive: (props: ConfiguredResponsiveProps<K>) => ReactElement;
  /** Root provider: hosts the shared-state scope and an optional SSR variant override. */
  Provider: (props: ResponsiveProviderProps<K>) => ReactElement;
  /** Composable keep-alive gate components, one per variant key, PascalCased (e.g. `Match.Desktop`). */
  Match: { [P in K as Capitalize<P>]: (props: MatchProps) => ReactElement };

  /** The active variant key for the configured breakpoints. */
  useVariant: (options?: CreateResponsiveOptions<K>) => K;
  /** Pick a value per configured breakpoint (queries are pre-bound). */
  useResponsiveValue: <V>(
    values: Record<K, V>,
    options?: Omit<CreateResponsiveOptions<K>, 'deferWhileComposing'>,
  ) => V;
  /** The resolved media-query map (e.g. to reuse with the low-level hooks). */
  breakpoints: Record<K, string>;
}

/** Props for the root provider returned by `createResponsive`. */
export interface ResponsiveProviderProps<K extends string> {
  children: ReactNode;
  /** Override the SSR/initial variant for this subtree (e.g. a request-derived value in Next). */
  ssr?: K;
}

/** Props for a `Match` gate component. */
export interface MatchProps {
  children: ReactNode;
  /**
   * `true` (default): keep this branch mounted across breakpoint changes via `<Activity>`
   * (hidden when inactive), preserving its state. `false`: unmount when inactive — lighter,
   * but state is lost on switch (a plain media gate).
   */
  keepAlive?: boolean;
}

/**
 * Media input for the low-level hooks (`useMediaVariant`, `useResponsiveValue`): either
 * integer px breakpoints (converted to non-overlapping mobile-first bands, like
 * `createResponsive`) or raw media-query strings (passed through — use these for non-width
 * features like orientation). The two forms must not be mixed.
 */
export type MediaInput<K extends string> = Record<K, number> | Record<K, string>;
