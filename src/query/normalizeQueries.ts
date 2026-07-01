import type { MediaInput } from '../types';
import { breakpointsToQueries } from './breakpointsToQueries';

/**
 * Normalizes a low-level hook's media input to query strings. Integer px breakpoints
 * are converted to non-overlapping mobile-first bands (identical to `createResponsive`);
 * raw media-query strings pass through unchanged, so non-width features (orientation,
 * prefers-color-scheme, min-height, …) remain expressible at the low level. The two
 * forms must not be mixed.
 */
export function normalizeQueries<K extends string>(input: MediaInput<K>): Record<K, string> {
  const values = Object.values(input);
  const numberCount = values.filter((v) => typeof v === 'number').length;
  if (numberCount > 0 && numberCount < values.length) {
    throw new Error(
      '[responsive-keepalive] media input must be all integer breakpoints or all media-query strings, not a mix.',
    );
  }
  return numberCount > 0
    ? breakpointsToQueries(input as Record<K, number>)
    : (input as Record<K, string>);
}
