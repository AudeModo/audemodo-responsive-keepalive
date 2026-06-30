import { useState } from 'react';
import {
  Responsive,
  type Mount,
  type Strategy,
  type VariantMap,
} from '@audemodo/responsive-keepalive';
import { ProbeCard, Stage } from '../ui/Stage';
import { Control, Segmented } from '../ui/Controls';
import { Playground } from '../ui/Playground';

type Variant = 'mobile' | 'desktop';
type Form = 'element' | 'function';

function buildCode(variant: Variant, strategy: Strategy, mount: Mount, form: Form): string {
  const props = [`variant="${variant}"`];
  if (strategy !== 'keepAlive') props.push(`strategy="${strategy}"`);
  if (mount !== 'lazy') props.push(`mount="${mount}"`);
  const mobile = form === 'function' ? '() => <MobileLayout />' : '<MobileLayout />';
  const desktop = form === 'function' ? '() => <DesktopLayout />' : '<DesktopLayout />';
  return `import { Responsive } from '@audemodo/responsive-keepalive';

// You control \`variant\` yourself — from a toggle, a hook, an SSR header, anything.
<Responsive
  ${props.join('\n  ')}
  variants={{
    mobile: ${mobile},
    desktop: ${desktop},
  }}
/>;`;
}

export function ControlledResponsive() {
  const [variant, setVariant] = useState<Variant>('desktop');
  const [strategy, setStrategy] = useState<Strategy>('keepAlive');
  const [mount, setMount] = useState<Mount>('lazy');
  const [form, setForm] = useState<Form>('function');

  const variants: VariantMap<Variant> =
    form === 'function'
      ? {
          mobile: () => <ProbeCard kind="mobile" title="Mobile layout" />,
          desktop: () => <ProbeCard kind="desktop" title="Desktop layout" />,
        }
      : {
          mobile: <ProbeCard kind="mobile" title="Mobile layout" />,
          desktop: <ProbeCard kind="desktop" title="Desktop layout" />,
        };

  return (
    <Playground
      name="Controlled Responsive"
      api="<Responsive />"
      desc="The primitive: you pass the active variant and a map of variants. Bump the counter or type, then switch — keep-alive preserves the instance; swap remounts it."
      file="App.tsx"
      code={buildCode(variant, strategy, mount, form)}
      stage={
        <Stage>
          <Responsive variant={variant} variants={variants} strategy={strategy} mount={mount} />
        </Stage>
      }
      controls={
        <>
          <Control label="variant (you control this)">
            <Segmented
              value={variant}
              onChange={setVariant}
              options={[
                { value: 'mobile', label: 'mobile' },
                { value: 'desktop', label: 'desktop' },
              ]}
            />
          </Control>
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
          <Control label="variant value form">
            <Segmented
              value={form}
              onChange={setForm}
              options={[
                { value: 'function', label: '() => node' },
                { value: 'element', label: 'node' },
              ]}
            />
          </Control>
          <p className="note">
            Switch variant after editing state: with <b>keepAlive</b> the instance id and state
            stay; with <b>swap</b> a new instance mounts and state resets.
          </p>
        </>
      }
    />
  );
}
