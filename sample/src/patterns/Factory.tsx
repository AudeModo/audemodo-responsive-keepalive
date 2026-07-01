import type { Mount, Strategy } from '@audemodo/responsive-keepalive';
import { useState } from 'react';

import {
  Desktop,
  Mobile,
  Provider,
  Responsive,
  useResponsiveValue,
  useVariant,
} from '../responsive';
import { Control, Segmented, Toggle } from '../ui/Controls';
import { Playground } from '../ui/Playground';
import { ProbeCard, Stage } from '../ui/Stage';

const SETUP = `import { createResponsive } from '@audemodo/responsive-keepalive';

// responsive.ts — one config, keys inferred & type-checked, integer px only
export const { Responsive, Provider, Match, useVariant, useResponsiveValue } =
  createResponsive({ mobile: 0, desktop: 768 }, { ssr: 'mobile' });
export const { Mobile, Desktop } = Match;`;

function namedCode(strategy: Strategy, mount: Mount): string {
  const props: string[] = [];
  if (strategy !== 'keepAlive') props.push(`strategy="${strategy}"`);
  if (mount !== 'lazy') props.push(`mount="${mount}"`);
  const head = props.length ? `\n  ${props.join('\n  ')}` : '';
  return `${SETUP}

// Self-resolving: one prop per breakpoint, resolved internally from the viewport.
<Responsive${head}
  mobile={() => <MobileDashboard />}
  desktop={() => <DesktopDashboard />}
/>;`;
}

function NamedResponsive() {
  const [strategy, setStrategy] = useState<Strategy>('keepAlive');
  const [mount, setMount] = useState<Mount>('lazy');
  return (
    <Playground
      name="Named Responsive"
      api="createResponsive"
      desc="The factory's self-resolving component: one prop per breakpoint, no variant wiring. Responds to the viewport ruler in the header."
      file="App.tsx"
      code={namedCode(strategy, mount)}
      stage={
        <Stage>
          <Responsive
            strategy={strategy}
            mount={mount}
            mobile={() => <ProbeCard kind="mobile" title="Mobile dashboard" />}
            desktop={() => <ProbeCard kind="desktop" title="Desktop dashboard" />}
          />
        </Stage>
      }
      controls={
        <>
          <Control label="strategy">
            <Segmented
              value={strategy}
              onChange={setStrategy}
              options={[
                { value: 'keepAlive', label: 'keepAlive' },
                { value: 'swap', label: 'swap' },
              ]}
            />
          </Control>
          <Control label="mount">
            <Segmented
              value={mount}
              onChange={setMount}
              options={[
                { value: 'lazy', label: 'lazy' },
                { value: 'eager', label: 'eager' },
              ]}
            />
          </Control>
        </>
      }
    />
  );
}

function gatesCode(keepAlive: boolean): string {
  const ka = keepAlive ? '' : ' keepAlive={false}';
  return `${SETUP}

// Composable gates — mix into any tree like ordinary components.
<Provider>
  <Desktop${ka}><DesktopNav /></Desktop>
  <Mobile${ka}><MobileTabBar /></Mobile>
</Provider>;`;
}

function Gates() {
  const [keepAlive, setKeepAlive] = useState(true);
  return (
    <Playground
      name="Match gates"
      api="<Desktop /> / <Mobile />"
      desc="PascalCased gate components you compose freely. keepAlive (default) hides the inactive branch and preserves its state; turn it off to unmount instead."
      file="Shell.tsx"
      code={gatesCode(keepAlive)}
      stage={
        <Stage>
          <Provider>
            <Desktop keepAlive={keepAlive}>
              <ProbeCard kind="desktop" title="Desktop nav" />
            </Desktop>
            <Mobile keepAlive={keepAlive}>
              <ProbeCard kind="mobile" title="Mobile tab bar" />
            </Mobile>
          </Provider>
        </Stage>
      }
      controls={
        <>
          <Control label="keepAlive">
            <Toggle
              checked={keepAlive}
              onChange={setKeepAlive}
              label="keep the inactive gate mounted (preserve state)"
            />
          </Control>
          <p className="note">
            Cross 768px on the ruler. With keepAlive on, the hidden gate keeps its instance id and
            state; off, it unmounts and resets.
          </p>
        </>
      }
    />
  );
}

function hooksCode(settleMs: number): string {
  const variantOpts = settleMs > 0 ? `{ settleMs: ${settleMs} }` : '';
  return `${SETUP}

function Toolbar() {
  const variant = useVariant(${variantOpts});         // 'mobile' | 'desktop'
  const gap = useResponsiveValue({ mobile: 8, desktop: 24 });
  return <div style={{ gap }}>…{variant}…</div>;
}

<Provider><Toolbar /></Provider>;`;
}

function Toolbar({ settleMs }: { settleMs: number }) {
  const variant = useVariant(settleMs > 0 ? { settleMs } : undefined);
  const gap = useResponsiveValue({ mobile: 8, desktop: 24 });
  return (
    <div className="demo-row" style={{ gap, justifyContent: 'center', padding: '12px 0' }}>
      <span className={`chip ${variant}`}>useVariant → {variant}</span>
      <span className="chip good">useResponsiveValue → gap {gap}</span>
    </div>
  );
}

function ConfiguredHooks() {
  const [settleMs, setSettleMs] = useState(0);
  return (
    <Playground
      name="Configured hooks"
      api="useVariant / useResponsiveValue"
      desc="The factory's hooks come pre-bound to your breakpoints — no queries to repeat. Wrap the app in Provider for shared state and SSR overrides."
      file="Toolbar.tsx"
      code={hooksCode(settleMs)}
      stage={
        <Stage>
          <Provider>
            <Toolbar settleMs={settleMs} />
          </Provider>
        </Stage>
      }
      controls={
        <Control label="useVariant settleMs" value={`${settleMs}ms`}>
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
      }
    />
  );
}

export function Factory() {
  return (
    <>
      <NamedResponsive />
      <Gates />
      <ConfiguredHooks />
    </>
  );
}
