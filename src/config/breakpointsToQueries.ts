export function breakpointsToQueries<K extends string>(
  breakpoints: Record<K, number>,
): Record<K, string> {
  const entries = Object.entries(breakpoints) as [K, number][];
  if (entries.length === 0) {
    throw new Error('[responsive-keepalive] createResponsive: breakpoints must not be empty.');
  }
  for (const [key, value] of entries) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(
        `[responsive-keepalive] createResponsive: breakpoint "${key}" must be a non-negative integer of pixels, received ${String(value)}.`,
      );
    }
  }

  const sorted = entries.slice().sort((a, b) => a[1] - b[1]);
  const result = {} as Record<K, string>;
  sorted.forEach(([key, min], i) => {
    const next = sorted[i + 1];
    const parts: string[] = [];
    if (min > 0) parts.push(`(min-width: ${min}px)`);
    if (next) parts.push(`(max-width: ${next[1] - 1}px)`);
    result[key] = parts.length > 0 ? parts.join(' and ') : '(min-width: 0px)';
  });
  return result;
}
