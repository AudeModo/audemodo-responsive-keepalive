import type { RefObject } from 'react';
import { useSettledValue } from '../policies/useSettledValue';
import type { ContainerVariantOptions } from '../types';
import { resolveContainerVariant } from './resolveContainerVariant';
import { useElementWidth } from './useElementWidth';

export function useContainerVariant<K extends string, E extends Element = Element>(
  ref: RefObject<E | null>,
  breakpoints: Record<K, number>,
  options: ContainerVariantOptions<NoInfer<K>> = {},
): K {
  const fallback = (options.ssr ?? resolveContainerVariant(0, breakpoints)) as K;
  const width = useElementWidth(ref);
  const raw = width === null ? fallback : resolveContainerVariant(width, breakpoints);
  return useSettledValue(raw, options.settleMs ?? 0);
}
