import { useEffect, useState } from 'react';

/**
 * Returns `value`, but when `settleMs > 0` only commits a change after the value
 * has been stable for `settleMs`. Rapid flip-flops reset the timer, so transient
 * values never surface. `settleMs <= 0` passes through immediately.
 *
 * A generic anti-thrash primitive — independent of any media-query concern.
 */
export function useSettledValue<T>(value: T, settleMs: number): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    if (settleMs <= 0) {
      setSettled(value);
      return;
    }
    const id = setTimeout(() => setSettled(value), settleMs);
    return () => clearTimeout(id);
  }, [value, settleMs]);

  return settleMs <= 0 ? value : settled;
}
