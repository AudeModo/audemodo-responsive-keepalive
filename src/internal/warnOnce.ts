const seen = new Set<string>();

export function warnOnce(message: string): void {
  if (seen.has(message)) return;
  seen.add(message);
  console.warn(message);
}

export function resetWarnings(): void {
  seen.clear();
}
