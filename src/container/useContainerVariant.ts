import type { RefObject } from 'react';

import { useSettledValue } from '../policies/useSettledValue';
import type { ContainerVariantOptions } from '../types';
import { resolveContainerVariant } from './resolveContainerVariant';
import { useElementWidth } from './useElementWidth';

/**
 * Like `useMediaVariant`, but selects a variant from the *container's* width (via
 * ResizeObserver) rather than the viewport. Use it when a component must render
 * structurally different trees based on the space it occupies — e.g. a card that
 * is a row in a wide column but a stack in a narrow one.
 *
 * `breakpoints` maps each variant to a minimum width; the largest threshold not
 * exceeding the measured width wins (the floor variant applies below all
 * thresholds). Before the first measurement (and on the server) the `ssr` variant,
 * or the floor, is returned.
 *
 * @example
 * const ref = useRef<HTMLDivElement>(null);
 * const variant = useContainerVariant(ref, { stack: 0, row: 480 }, { ssr: 'stack' });
 * return (
 *   <div ref={ref}>
 *     <Responsive variant={variant} variants={{ stack: () => <Stack />, row: () => <Row /> }} />
 *   </div>
 * );
 */
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
