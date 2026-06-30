import { useEffect, useState } from 'react';

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
