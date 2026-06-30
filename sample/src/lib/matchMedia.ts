// A controllable matchMedia shim for the playground. The real library hooks read
// window.matchMedia unchanged; this lets a single "simulated viewport" slider drive
// every viewport-based demo, exactly like resizing a real browser window. Install it
// once before React renders.

type ChangeListener = (event: { matches: boolean; media: string }) => void;

let currentWidth = 1024;
const active = new Set<ShimMediaQueryList>();

function evaluate(media: string, width: number): boolean {
  // Understands the queries breakpointsToQueries emits: "(min-width: Npx)",
  // "(max-width: Npx)", and the two joined by " and ".
  return media.split(' and ').every((part) => {
    const min = /min-width:\s*(\d+)px/.exec(part);
    if (min) return width >= Number(min[1]);
    const max = /max-width:\s*(\d+)px/.exec(part);
    if (max) return width <= Number(max[1]);
    return true;
  });
}

class ShimMediaQueryList {
  matches: boolean;
  onchange: ChangeListener | null = null;
  private listeners = new Set<ChangeListener>();

  constructor(public readonly media: string) {
    this.matches = evaluate(media, currentWidth);
  }

  addEventListener(_type: 'change', listener: ChangeListener): void {
    this.listeners.add(listener);
    active.add(this);
  }
  removeEventListener(_type: 'change', listener: ChangeListener): void {
    this.listeners.delete(listener);
    if (this.listeners.size === 0) active.delete(this);
  }
  dispatchEvent(): boolean {
    return true;
  }

  notify(): void {
    const next = evaluate(this.media, currentWidth);
    if (next === this.matches) return;
    this.matches = next;
    const event = { matches: next, media: this.media };
    this.onchange?.(event);
    for (const listener of this.listeners) listener(event);
  }
}

export function installMatchMedia(): void {
  window.matchMedia = ((media: string) =>
    new ShimMediaQueryList(media)) as unknown as typeof window.matchMedia;
}

export function setSimulatedWidth(width: number): void {
  currentWidth = width;
  for (const mql of active) mql.notify();
}

export function getSimulatedWidth(): number {
  return currentWidth;
}
