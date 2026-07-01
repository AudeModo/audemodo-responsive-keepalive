import { useEffect, useRef, useState } from 'react';

/**
 * Returns `value`, but while an IME composition is in progress (detected
 * document-wide via bubbling `compositionstart`/`compositionend`) holds the
 * previously committed value and applies the latest one on `compositionend`.
 * No-op, with no listeners attached, when `enabled` is `false`.
 *
 * Prevents interrupting Hangul/CJK input mid-syllable when an upstream value
 * (e.g. a layout variant) changes.
 */
export function useHeldWhileComposing<T>(value: T, enabled: boolean): T {
  const [held, setHeld] = useState(value);
  const composingRef = useRef(false);
  const latestRef = useRef(value);
  latestRef.current = value;

  useEffect(() => {
    if (!enabled || typeof document === 'undefined') return;
    const onStart = () => {
      composingRef.current = true;
    };
    const onEnd = () => {
      composingRef.current = false;
      setHeld(latestRef.current);
    };
    document.addEventListener('compositionstart', onStart);
    document.addEventListener('compositionend', onEnd);
    return () => {
      document.removeEventListener('compositionstart', onStart);
      document.removeEventListener('compositionend', onEnd);
    };
  }, [enabled]);

  useEffect(() => {
    if (!enabled) {
      setHeld(value);
      return;
    }
    if (!composingRef.current) setHeld(value);
  }, [value, enabled]);

  return enabled ? held : value;
}
