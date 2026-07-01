import { Fragment } from 'react';

import type { VariantRenderProps } from '../types';
import { renderVariant } from './renderVariant';

/**
 * Renders only the active variant. Keyed by `variant` so a change forces a clean
 * unmount/mount — i.e. true swap semantics, with no state preservation.
 */
export function SwapVariant<K extends string>({ variant, variants }: VariantRenderProps<K>) {
  return <Fragment key={variant}>{renderVariant(variants[variant])}</Fragment>;
}
