export function breakpointsToQueries<K extends string>(
  config: Record<K, string | number>,
): Record<K, string> {
  const entries = Object.entries(config) as [K, string | number][];
  const numeric = entries.filter((e): e is [K, number] => typeof e[1] === 'number');
  const textual = entries.filter((e): e is [K, string] => typeof e[1] === 'string');

  if (numeric.length > 0 && textual.length > 0) {
    throw new Error(
      '[responsive-keepalive] createResponsive: breakpoints must be all media-query strings or all numbers, not a mix.',
    );
  }
  if (numeric.length === 0) {
    return Object.fromEntries(textual) as Record<K, string>;
  }

  const sorted = numeric.slice().sort((a, b) => a[1] - b[1]);
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
