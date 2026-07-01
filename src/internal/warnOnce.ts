const seen = new Set<string>();

/** Emits a `console.warn` at most once per distinct message. */
export function warnOnce(message: string): void {
  if (seen.has(message)) return;
  seen.add(message);
  console.warn(message);
}

/** @internal Test hook: clears the dedupe set so a message can warn again. */
export function resetWarnings(): void {
  seen.clear();
}
