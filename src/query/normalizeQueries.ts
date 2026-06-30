import type { MediaInput } from '../types';
import { breakpointsToQueries } from './breakpointsToQueries';

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
