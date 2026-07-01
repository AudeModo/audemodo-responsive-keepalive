import { type ReactElement, useState } from 'react';

import { setSimulatedWidth } from './lib/matchMedia';
import { ContainerQueries } from './patterns/ContainerQueries';
import { ControlledResponsive } from './patterns/ControlledResponsive';
import { Factory } from './patterns/Factory';
import { SharedState } from './patterns/SharedState';
import { ViewportHooks } from './patterns/ViewportHooks';

const MIN = 320;
const MAX = 1440;
const TICKS = [
  { v: 320, major: true },
  { v: 480, major: false },
  { v: 640, major: false },
  { v: 768, major: true },
  { v: 1024, major: true },
  { v: 1280, major: false },
  { v: 1440, major: true },
];
const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;

interface Category {
  id: string;
  n: string;
  label: string;
  eyebrow: string;
  title: string;
  desc: string;
  imports: string;
  usesViewport: boolean;
  Component: () => ReactElement;
}

const CATEGORIES: Category[] = [
  {
    id: 'controlled',
    n: '01',
    label: 'Controlled',
    eyebrow: 'The primitive',
    title: 'Controlled <Responsive>',
    desc: 'The low-level building block. You decide the active variant from any source and hand it a map of variants; the library handles keep-alive vs swap and lazy vs eager mounting.',
    imports: "import { Responsive } from '@audemodo/responsive-keepalive';",
    usesViewport: false,
    Component: ControlledResponsive,
  },
  {
    id: 'viewport',
    n: '02',
    label: 'Viewport hooks',
    eyebrow: 'Read the viewport',
    title: 'Viewport hooks',
    desc: 'Resolve a variant key or a plain value from media queries. These respond to the simulated viewport ruler in the header — drag it to cross a breakpoint.',
    imports:
      "import { useMediaVariant, useResponsiveValue } from '@audemodo/responsive-keepalive';",
    usesViewport: true,
    Component: ViewportHooks,
  },
  {
    id: 'container',
    n: '03',
    label: 'Container',
    eyebrow: 'Read the element',
    title: 'Container queries',
    desc: "Relayout from the element's own width via a real ResizeObserver — independent of the viewport. The width slider drives an actual measured element.",
    imports: "import { useContainerVariant } from '@audemodo/responsive-keepalive';",
    usesViewport: false,
    Component: ContainerQueries,
  },
  {
    id: 'factory',
    n: '04',
    label: 'Factory',
    eyebrow: 'Recommended',
    title: 'createResponsive factory',
    desc: 'One config, inferred and type-checked keys, integer-px breakpoints. Get a self-resolving component, composable gates, a Provider, and pre-bound hooks. Responds to the viewport ruler.',
    imports: "import { createResponsive } from '@audemodo/responsive-keepalive';",
    usesViewport: true,
    Component: Factory,
  },
  {
    id: 'shared',
    n: '05',
    label: 'Shared state',
    eyebrow: 'Compose state',
    title: 'Shared state',
    desc: 'Synchronize state by key across siblings without lifting it to a parent — and keep it across a swap, because the store lives in the scope above the variants.',
    imports: "import { useSharedState, SharedStateScope } from '@audemodo/responsive-keepalive';",
    usesViewport: false,
    Component: SharedState,
  },
];

function Ruler({ width, onChange }: { width: number; onChange: (w: number) => void }) {
  const variant = width < 768 ? 'mobile' : 'desktop';
  return (
    <div className="ruler">
      <div className="ruler-track">
        <div className="ruler-ticks">
          {TICKS.map((t) => (
            <span key={t.v}>
              <span
                className={`ruler-tick ${t.major ? 'major' : ''}`}
                style={{ left: `${pct(t.v)}%` }}
              />
              {t.major && (
                <span className="ruler-tick-label" style={{ left: `${pct(t.v)}%` }}>
                  {t.v}
                </span>
              )}
            </span>
          ))}
        </div>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={8}
          value={width}
          aria-label="Simulated viewport width"
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
      <div className="ruler-readout">
        <b>{width}px</b>
        <span className={`chip ${variant}`}>{variant}</span>
      </div>
    </div>
  );
}

export function App() {
  const [activeId, setActiveId] = useState('controlled');
  const [width, setWidth] = useState(1024);
  const active = CATEGORIES.find((c) => c.id === activeId);

  const onWidth = (w: number) => {
    setWidth(w);
    setSimulatedWidth(w);
  };

  if (!active) return null; // unreachable: activeId is always a known category id
  const Active = active.Component;

  return (
    <div className="app">
      <header className="appbar">
        <div className="appbar-inner">
          <div className="brand">
            <span className="brand-mark">
              responsive-<span className="moon">keepalive</span>
            </span>
            <span className="brand-sub">interactive patterns</span>
          </div>
          {active.usesViewport ? (
            <Ruler width={width} onChange={onWidth} />
          ) : (
            <span className="brand-sub" style={{ marginLeft: 'auto' }}>
              {active.id === 'container'
                ? 'this category measures its own element →'
                : 'this category is driven by its own form →'}
            </span>
          )}
        </div>
      </header>

      <div className="layout">
        <nav className="sidenav" aria-label="Patterns">
          <span className="sidenav-eyebrow">Patterns</span>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              className={`navitem ${c.id === activeId ? 'active' : ''}`}
              onClick={() => setActiveId(c.id)}
            >
              <span className="n">{c.n}</span>
              {c.label}
            </button>
          ))}
        </nav>

        <main>
          <div className="cat-head">
            <div className="cat-eyebrow">
              {active.n} · {active.eyebrow}
            </div>
            <h1 className="cat-title">{active.title}</h1>
            <p className="cat-desc">{active.desc}</p>
            <div className="cat-imports">
              <b>{active.imports}</b>
            </div>
          </div>
          <Active />
        </main>
      </div>
    </div>
  );
}
