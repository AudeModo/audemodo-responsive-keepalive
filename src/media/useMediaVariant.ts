import { useHeldWhileComposing } from '../policies/useHeldWhileComposing';
import { useSettledValue } from '../policies/useSettledValue';
import { normalizeQueries } from '../query/normalizeQueries';
import type { MediaInput, MediaVariantOptions } from '../types';
import { useMatchedVariant } from './useMatchedVariant';

/**
 * Maps a set of breakpoints to a variant key, suitable for `<Responsive variant>`.
 *
 * `breakpoints` may be **integer px min-widths** — converted to non-overlapping
 * mobile-first bands, exactly like `createResponsive` — or **raw media-query strings**,
 * which stay available for non-width features (orientation, prefers-color-scheme, …).
 *
 * A thin composition of three single-purpose hooks (switch policy applied
 * outermost-wins): `useMatchedVariant` (raw match) → `useSettledValue` (anti-thrash) →
 * `useHeldWhileComposing` (IME hold).
 *
 * @example
 * // integer breakpoints (recommended for width bands)
 * const variant = useMediaVariant({ mobile: 0, desktop: 768 }, { ssr: 'mobile', settleMs: 150 });
 *
 * @example
 * // raw queries for non-width features
 * const orientation = useMediaVariant({
 *   portrait: '(orientation: portrait)',
 *   landscape: '(orientation: landscape)',
 * });
 */
export function useMediaVariant<K extends string>(
  breakpoints: MediaInput<K>,
  options: MediaVariantOptions<NoInfer<K>> = {},
): K {
  const queries = normalizeQueries(breakpoints);
  const keys = Object.keys(queries) as K[];
  const fallback = (options.ssr ?? keys[0]) as K;
  const raw = useMatchedVariant(queries, fallback);
  const settled = useSettledValue(raw, options.settleMs ?? 0);
  return useHeldWhileComposing(settled, options.deferWhileComposing ?? false);
}
