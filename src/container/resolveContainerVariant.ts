export function resolveContainerVariant<K extends string>(
  width: number,
  breakpoints: Record<K, number>,
): K {
  const entries = (Object.entries(breakpoints) as [K, number][]).sort((a, b) => a[1] - b[1]);
  const floor = entries[0];
  if (!floor) {
    throw new Error('[responsive-keepalive] useContainerVariant: breakpoints must not be empty');
  }

  let matched: K = floor[0];
  for (const [key, minWidth] of entries) {
    if (width >= minWidth) matched = key;
  }
  return matched;
}
