import { useRef } from 'react';

import { Activity } from '../platform/activity';
import type { Mount, VariantRenderProps } from '../types';
import { renderVariant } from './renderVariant';
import { resolveMountedKeys } from './resolveMountedKeys';

interface KeepAliveVariantsProps<K extends string> extends VariantRenderProps<K> {
  mount: Mount;
}

/**
 * Renders the mounted variants wrapped in `<Activity>`, keeping inactive ones
 * alive (state preserved) while hidden. Owns the lazy-mount bookkeeping; the
 * "which keys" decision is delegated to the pure {@link resolveMountedKeys}.
 *
 * Only rendered when `<Activity>` is available (see `Responsive`).
 */
export function KeepAliveVariants<K extends string>({
  variant,
  variants,
  mount,
}: KeepAliveVariantsProps<K>) {
  const activated = useRef<Set<string>>(new Set());
  activated.current.add(variant);

  const allKeys = Object.keys(variants) as K[];
  const mountedKeys = resolveMountedKeys(allKeys, mount, activated.current);

  return (
    <>
      {mountedKeys.map((key) => (
        // Stable key → stable tree position → state preserved across switches.
        <Activity key={key} mode={key === variant ? 'visible' : 'hidden'}>
          {renderVariant(variants[key])}
        </Activity>
      ))}
    </>
  );
}
