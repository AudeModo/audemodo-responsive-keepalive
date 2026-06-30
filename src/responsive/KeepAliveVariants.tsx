import { useRef } from 'react';
import { Activity } from '../platform/activity';
import type { Mount, VariantRenderProps } from '../types';
import { renderVariant } from './renderVariant';
import { resolveMountedKeys } from './resolveMountedKeys';

interface KeepAliveVariantsProps<K extends string> extends VariantRenderProps<K> {
  mount: Mount;
}

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
        <Activity key={key} mode={key === variant ? 'visible' : 'hidden'}>
          {renderVariant(variants[key])}
        </Activity>
      ))}
    </>
  );
}
