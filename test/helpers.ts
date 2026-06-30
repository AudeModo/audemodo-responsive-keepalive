let iidSeq = 0;

export function nextIid(): number {
  return ++iidSeq;
}

export function resetIid(): void {
  iidSeq = 0;
}

export interface MockMatchMedia {
  mm: (q: string) => MediaQueryList;
  set: (next: Record<string, boolean>) => void;
}

export function makeMatchMedia(): MockMatchMedia {
  let state: Record<string, boolean> = {};
  const listeners = new Set<() => void>();
  const mm = (q: string) =>
    ({
      get matches() {
        return !!state[q];
      },
      media: q,
      addEventListener: (_: string, cb: () => void) => listeners.add(cb),
      removeEventListener: (_: string, cb: () => void) => listeners.delete(cb),
      addListener: (cb: () => void) => listeners.add(cb),
      removeListener: (cb: () => void) => listeners.delete(cb),
      onchange: null,
      dispatchEvent: () => false,
    }) as unknown as MediaQueryList;
  const set = (next: Record<string, boolean>) => {
    state = next;
    for (const l of listeners) l();
  };
  return { mm, set };
}

const resizeCallbacks: ResizeObserverCallback[] = [];
let resizeDisconnects = 0;
export class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallbacks.push(callback);
  }
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {
    resizeDisconnects += 1;
  }
}
export function resizeDisconnectCount(): number {
  return resizeDisconnects;
}
export function fireResize(width: number): void {
  const entry = { contentRect: { width } } as ResizeObserverEntry;
  for (const callback of resizeCallbacks) callback([entry], {} as ResizeObserver);
}
export function resetResizeObservers(): void {
  resizeCallbacks.length = 0;
  resizeDisconnects = 0;
}
