import type { ReactNode } from 'react';

export function renderVariant(value: ReactNode | (() => ReactNode)): ReactNode {
  return typeof value === 'function' ? value() : value;
}
