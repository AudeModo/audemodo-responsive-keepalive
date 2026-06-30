import { useSettledValue } from '../policies/useSettledValue';
import type { ResponsiveValueOptions } from '../types';
import { useMatchedVariant } from './useMatchedVariant';

export function useResponsiveValue<K extends string, V>(
  queries: Record<K, string>,
  values: Record<K, V>,
  options: ResponsiveValueOptions<NoInfer<K>> = {},
): V {
  const keys = Object.keys(queries) as K[];
  const fallback = (options.ssr ?? keys[0]) as K;
  const variant = useMatchedVariant(queries, fallback);
  const settled = useSettledValue(variant, options.settleMs ?? 0);
  return values[settled];
}
