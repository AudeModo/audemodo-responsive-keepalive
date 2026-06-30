import { useState } from 'react';
import { useMediaVariant, useResponsiveValue } from '@audemodo/responsive-keepalive';
import { Stage } from '../ui/Stage';
import { Control, Segmented, Toggle } from '../ui/Controls';
import { Playground } from '../ui/Playground';

const QUERIES = {
  mobile: '(max-width: 767px)',
  desktop: '(min-width: 768px)',
};

const VALUE_QUERIES = {
  mobile: '(max-width: 599px)',
  tablet: '(min-width: 600px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
};
const COLUMNS = { mobile: 1, tablet: 2, desktop: 3 };

function variantCode(ssr: string, settleMs: number, defer: boolean): string {
  const opts = [`ssr: '${ssr}'`];
  if (settleMs > 0) opts.push(`settleMs: ${settleMs}`);
  if (defer) opts.push('deferWhileComposing: true');
  return `import { useMediaVariant } from '@audemodo/responsive-keepalive';

const variant = useMediaVariant(
  {
    mobile: '(max-width: 767px)',
    desktop: '(min-width: 768px)',
  },
  { ${opts.join(', ')} },
);
// 'mobile' | 'desktop' — re-renders when the viewport crosses 768px`;
}

function MediaVariant() {
  const [ssr, setSsr] = useState<'mobile' | 'desktop'>('mobile');
  const [settleMs, setSettleMs] = useState(0);
  const [defer, setDefer] = useState(false);
  const variant = useMediaVariant(QUERIES, { ssr, settleMs, deferWhileComposing: defer });

  return (
    <Playground
      name="useMediaVariant"
      api="hook"
      desc="Resolves a variant key from the viewport. Drag the viewport ruler in the header across 768px and watch it flip; settleMs delays the commit."
      file="useMediaVariant.tsx"
      code={variantCode(ssr, settleMs, defer)}
      stage={
        <Stage>
          <div className="demo-row" style={{ justifyContent: 'center', padding: '14px 0' }}>
            <span className={`chip ${variant}`} style={{ fontSize: 15, padding: '6px 18px' }}>
              {variant}
            </span>
          </div>
        </Stage>
      }
      controls={
        <>
          <Control label="ssr (before hydration / no matchMedia)">
            <Segmented
              value={ssr}
              onChange={setSsr}
              options={[
                { value: 'mobile', label: 'mobile' },
                { value: 'desktop', label: 'desktop' },
              ]}
            />
          </Control>
          <Control label="settleMs (anti-thrash)" value={`${settleMs}ms`}>
            <input
              className="slider"
              type="range"
              min={0}
              max={500}
              step={20}
              value={settleMs}
              onChange={(e) => setSettleMs(Number(e.target.value))}
            />
          </Control>
          <Control label="deferWhileComposing (hold during IME)">
            <Toggle
              checked={defer}
              onChange={setDefer}
              label="hold switches while typing Hangul/CJK"
            />
          </Control>
          {defer && (
            <input
              className="field"
              placeholder="조합 중 전환이 보류됩니다 — 한글로 입력해 보세요"
            />
          )}
        </>
      }
    />
  );
}

function valueCode(ssr: string, settleMs: number): string {
  const opts = [`ssr: '${ssr}'`];
  if (settleMs > 0) opts.push(`settleMs: ${settleMs}`);
  return `import { useResponsiveValue } from '@audemodo/responsive-keepalive';

const columns = useResponsiveValue(
  {
    mobile: '(max-width: 599px)',
    tablet: '(min-width: 600px) and (max-width: 1023px)',
    desktop: '(min-width: 1024px)',
  },
  { mobile: 1, tablet: 2, desktop: 3 },
  { ${opts.join(', ')} },
);
// a plain number — no component tree needed`;
}

function ResponsiveValue() {
  const [ssr, setSsr] = useState<'mobile' | 'tablet' | 'desktop'>('mobile');
  const [settleMs, setSettleMs] = useState(0);
  const columns = useResponsiveValue(VALUE_QUERIES, COLUMNS, { ssr, settleMs });

  return (
    <Playground
      name="useResponsiveValue"
      api="hook"
      desc="Picks a plain value (here a column count) per breakpoint — for sizes, gaps, or copy where a whole component tree is overkill."
      file="Gallery.tsx"
      code={valueCode(ssr, settleMs)}
      stage={
        <Stage>
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 8 }}>
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                style={{
                  background: 'var(--accent-soft)',
                  borderRadius: 6,
                  height: 34,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--mono)',
                  fontSize: 12,
                  color: 'var(--accent-ink)',
                }}
              >
                {i + 1}
              </div>
            ))}
          </div>
          <div className="note" style={{ marginTop: 10 }}>
            columns = <b>{columns}</b>
          </div>
        </Stage>
      }
      controls={
        <>
          <Control label="ssr">
            <Segmented
              value={ssr}
              onChange={setSsr}
              options={[
                { value: 'mobile', label: 'mobile' },
                { value: 'tablet', label: 'tablet' },
                { value: 'desktop', label: 'desktop' },
              ]}
            />
          </Control>
          <Control label="settleMs" value={`${settleMs}ms`}>
            <input
              className="slider"
              type="range"
              min={0}
              max={500}
              step={20}
              value={settleMs}
              onChange={(e) => setSettleMs(Number(e.target.value))}
            />
          </Control>
        </>
      }
    />
  );
}

export function ViewportHooks() {
  return (
    <>
      <MediaVariant />
      <ResponsiveValue />
    </>
  );
}
