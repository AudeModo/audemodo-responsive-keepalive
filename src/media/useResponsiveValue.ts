import { useSettledValue } from '../policies/useSettledValue';
import { normalizeQueries } from '../query/normalizeQueries';
import { useMatchedVariant } from './useMatchedVariant';
import type { MediaInput, ResponsiveValueOptions } from '../types';

/**
 * Selects a value per breakpoint — the scalar counterpart to `<Responsive>`. Returns
 * `values[variant]`, where `variant` is the first matching band (in object order). Handy for
 * responsive numbers, sizes, or labels (column counts, gaps, copy) where a whole component
 * tree would be overkill.
 *
 * `breakpoints` accepts integer px min-widths or raw media-query strings, just like
 * `useMediaVariant`.
 *
 * @example
 * const columns = useResponsiveValue(
 *   { mobile: 0, desktop: 768 },
 *   { mobile: 1, desktop: 3 },
 *   { ssr: 'mobile' },
 * );
 */
export function useResponsiveValue<K extends string, V>(
  breakpoints: MediaInput<K>,
  values: Record<K, V>,
  options: ResponsiveValueOptions<NoInfer<K>> = {},
): V {
  const queries = normalizeQueries(breakpoints);
  const keys = Object.keys(queries) as K[];
  const fallback = (options.ssr ?? keys[0]) as K;
  const variant = useMatchedVariant(queries, fallback);
  const settled = useSettledValue(variant, options.settleMs ?? 0);
  return values[settled];
}
