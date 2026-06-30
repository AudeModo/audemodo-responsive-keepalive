import type { MediaVariantOptions } from '../types';
import { useMatchedVariant } from './useMatchedVariant';

export function useMediaVariant<K extends string>(
  queries: Record<K, string>,
  options: MediaVariantOptions<NoInfer<K>> = {},
): K {
  const keys = Object.keys(queries) as K[];
  const fallback = (options.ssr ?? keys[0]) as K;
  return useMatchedVariant(queries, fallback);
}
