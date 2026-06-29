import type { Mount } from '../types';

export function resolveMountedKeys<K extends string>(
  allKeys: readonly K[],
  mount: Mount,
  activated: ReadonlySet<string>,
): K[] {
  if (mount === 'eager') return [...allKeys];
  return allKeys.filter((key) => activated.has(key));
}
