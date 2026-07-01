import { useSettledValue } from '../policies/useSettledValue';
import { normalizeQueries } from '../query/normalizeQueries';
import { useMatchedVariant } from './useMatchedVariant';
import type { MediaInput, ResponsiveValueOptions } from '../types';

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
