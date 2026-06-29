import { Fragment } from 'react';
import type { VariantRenderProps } from '../types';
import { renderVariant } from './renderVariant';

export function SwapVariant<K extends string>({ variant, variants }: VariantRenderProps<K>) {
  return <Fragment key={variant}>{renderVariant(variants[variant])}</Fragment>;
}
