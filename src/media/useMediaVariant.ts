import { useHeldWhileComposing } from '../policies/useHeldWhileComposing';
import { useSettledValue } from '../policies/useSettledValue';
import type { MediaVariantOptions } from '../types';
import { useMatchedVariant } from './useMatchedVariant';

export function useMediaVariant<K extends string>(
  queries: Record<K, string>,
  options: MediaVariantOptions<NoInfer<K>> = {},
): K {
  const keys = Object.keys(queries) as K[];
  const fallback = (options.ssr ?? keys[0]) as K;
  const raw = useMatchedVariant(queries, fallback);
  const settled = useSettledValue(raw, options.settleMs ?? 0);
  return useHeldWhileComposing(settled, options.deferWhileComposing ?? false);
}
