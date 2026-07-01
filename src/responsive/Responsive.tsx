import type { ReactNode } from 'react';
import { isActivitySupported } from '../platform/activity';
import { warnOnce } from '../internal/warnOnce';
import type { ResponsiveProps } from '../types';
import { SharedStateScope } from '../shared/SharedStateScope';
import { KeepAliveVariants } from './KeepAliveVariants';
import { SwapVariant } from './SwapVariant';

const ACTIVITY_FALLBACK_WARNING =
  '[responsive-keepalive] React.Activity is unavailable (needs React 19.2+). ' +
  'Falling back to "swap"; state is NOT preserved across variants.';

/**
 * Render genuinely different component trees per breakpoint/variant without losing
 * state when the active variant changes.
 *
 * State local to a branch (scroll, open/closed, selection, an in-progress edit) is
 * preserved automatically by keep-alive. State that must be shared across variants
 * should be lifted above `<Responsive>` and passed into the render functions — the
 * two compose.
 *
 * This component is a thin dispatcher: it selects the keep-alive or swap renderer
 * and degrades gracefully when `<Activity>` is unavailable.
 *
 * @example
 * const variant = useMediaVariant({ desktop: '(min-width:768px)', mobile: '(max-width:767px)' });
 * return (
 *   <Responsive
 *     variant={variant}
 *     variants={{
 *       mobile: () => <MobileLayout value={value} onChange={setValue} />,
 *       desktop: () => <DesktopLayout value={value} onChange={setValue} />,
 *     }}
 *   />
 * );
 */
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

  return (
    <SharedStateScope>
      {keepAlive ? (
        <KeepAliveVariants variant={variant} variants={variants} mount={mount} />
      ) : (
        <SwapVariant variant={variant} variants={variants} />
      )}
    </SharedStateScope>
  );
}
