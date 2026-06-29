import type { ReactNode } from 'react';
import { isActivitySupported } from '../platform/activity';
import { warnOnce } from '../internal/warnOnce';
import type { ResponsiveProps } from '../types';
import { KeepAliveVariants } from './KeepAliveVariants';
import { SwapVariant } from './SwapVariant';

const ACTIVITY_FALLBACK_WARNING =
  '[responsive-keepalive] React.Activity is unavailable (needs React 19.2+). ' +
  'Falling back to "swap"; state is NOT preserved across variants.';

export function Responsive<K extends string>({
  variant,
  variants,
  strategy = 'keepAlive',
  mount = 'lazy',
}: ResponsiveProps<K>): ReactNode {
  const keepAlive = strategy === 'keepAlive' && isActivitySupported();

  if (strategy === 'keepAlive' && !keepAlive) {
    warnOnce(ACTIVITY_FALLBACK_WARNING);
  }

  return keepAlive ? (
    <KeepAliveVariants variant={variant} variants={variants} mount={mount} />
  ) : (
    <SwapVariant variant={variant} variants={variants} />
  );
}
