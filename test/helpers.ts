let iidSeq = 0;
export function nextIid(): number {
  return ++iidSeq;
}
export function resetIid(): void {
  iidSeq = 0;
}
