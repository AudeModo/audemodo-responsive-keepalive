/**
 * Pure: convert integer px min-width thresholds into a non-overlapping, mobile-first
 * media-query map. Shared by `createResponsive` and the low-level media hooks.
 *
 * Breakpoints are **integers only** (pixel min-widths). Media-query strings are no
 * longer accepted: they are rejected at compile time by the `number` type and at
 * runtime by validation, because hand-written query strings are an easy source of
 * human error (typos, wrong units, overlapping ranges). Authoring plain numbers and
 * deriving the queries here keeps them correct and non-overlapping by construction.
 *
 * Entries are sorted ascending so the floor variant comes first (the natural default
 * `ssr`). A floor of `0` yields a pure `max-width` band; the top band is an open
 * `min-width`. A non-zero floor leaves a deliberate gap below it (widths under it
 * match nothing and fall back to `ssr`).
 */
export function breakpointsToQueries<K extends string>(
  breakpoints: Record<K, number>,
): Record<K, string> {
  const entries = Object.entries(breakpoints) as [K, number][];
  if (entries.length === 0) {
    throw new Error('[responsive-keepalive] breakpoints must not be empty.');
  }
  for (const [key, value] of entries) {
    if (!Number.isInteger(value) || value < 0) {
      throw new Error(
        `[responsive-keepalive] breakpoint "${key}" must be a non-negative integer of pixels, received ${String(value)}.`,
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
