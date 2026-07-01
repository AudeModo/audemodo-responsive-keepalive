import { useHeldWhileComposing } from '../policies/useHeldWhileComposing';
import { useSettledValue } from '../policies/useSettledValue';
import { normalizeQueries } from '../query/normalizeQueries';
import type { MediaInput, MediaVariantOptions } from '../types';
import { useMatchedVariant } from './useMatchedVariant';

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
