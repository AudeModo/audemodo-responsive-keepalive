import { useContainerVariant } from '@audemodo/responsive-keepalive';
import { useRef, useState } from 'react';

import { Control, Segmented } from '../ui/Controls';
import { Playground } from '../ui/Playground';
import { Stage } from '../ui/Stage';

type CVariant = 'stack' | 'row' | 'wide';

function buildCode(ssr: CVariant, settleMs: number): string {
  const opts = [`ssr: '${ssr}'`];
  if (settleMs > 0) opts.push(`settleMs: ${settleMs}`);
  return `import { useRef } from 'react';
import { useContainerVariant } from '@audemodo/responsive-keepalive';

const ref = useRef<HTMLDivElement>(null);
const variant = useContainerVariant(
  ref,
  { stack: 0, row: 420, wide: 680 }, // variant → min content width (px)
  { ${opts.join(', ')} },
);

return (
  <div ref={ref}>
    {/* relayout from the element's OWN width, not the viewport */}
  </div>
);`;
}

export function ContainerQueries() {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(360);
  const [ssr, setSsr] = useState<CVariant>('stack');
  const [settleMs, setSettleMs] = useState(0);
  const variant = useContainerVariant(ref, { stack: 0, row: 420, wide: 680 }, { ssr, settleMs });

  return (
    <Playground
      name="useContainerVariant"
      api="hook"
      desc="Relayouts from the element's own width via ResizeObserver — the same card is a stack in a narrow column and a row in a wide one. Drag the width slider."
      file="ProductCard.tsx"
      code={buildCode(ssr, settleMs)}
      stage={
        <Stage>
          {/* Outer is measured (no padding → contentRect ≈ slider width); padding lives on the inner box. */}
          <div ref={ref} style={{ width, maxWidth: '100%' }}>
            <div
              className={`flip ${variant}`}
              style={{
                padding: 12,
                border: '1px solid var(--border)',
                borderRadius: 8,
                background: 'var(--surface)',
              }}
            >
              <div className="cell lead">image</div>
              <div className="cell">title &amp; price</div>
              <div className="cell">buy</div>
              <div className="cell extra">reviews</div>
            </div>
          </div>
          <div className="demo-row" style={{ marginTop: 10 }}>
            <span className="chip good">{variant}</span>
            <span className="note">measured width ≈ {width}px</span>
          </div>
        </Stage>
      }
      controls={
        <>
          <Control label="container width" value={`${width}px`}>
            <input
              className="slider"
              type="range"
              min={200}
              max={820}
              step={10}
              value={width}
              onChange={(e) => setWidth(Number(e.target.value))}
            />
          </Control>
          <Control label="ssr (before first measurement)">
            <Segmented
              value={ssr}
              onChange={setSsr}
              options={[
                { value: 'stack', label: 'stack' },
                { value: 'row', label: 'row' },
                { value: 'wide', label: 'wide' },
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
          <p className="note">
            Thresholds are <b>min content widths</b>: ≥680 → wide, ≥420 → row, otherwise stack.
          </p>
        </>
      }
    />
  );
}
