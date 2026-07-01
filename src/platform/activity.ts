import * as React from 'react';

/**
 * The platform boundary for React's `<Activity>` (Dependency Inversion): the rest
 * of the library depends on this module, not on `react` directly, so the single
 * platform concretion lives in one place and is trivially mockable in tests.
 *
 * Accessed via namespace so that on React < 19.2 (where `Activity` is absent) this
 * resolves to `undefined` instead of throwing on a missing named import.
 */
export const Activity = React.Activity;

/** Whether keep-alive (`<Activity>`) is available in the current React runtime. */
export function isActivitySupported(): boolean {
  return typeof React.Activity !== 'undefined';
}
