import type { Mount } from '../types';

/**
 * Pure: decides which variant keys should be mounted.
 *
 * - `eager` → all keys.
 * - `lazy`  → only keys that have been activated at least once (kept alive after),
 *   preserving the original key order.
 */
export function resolveMountedKeys<K extends string>(
  allKeys: readonly K[],
  mount: Mount,
  activated: ReadonlySet<string>,
): K[] {
  if (mount === 'eager') return [...allKeys];
  return allKeys.filter((key) => activated.has(key));
}
