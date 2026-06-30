import type { ReactNode } from 'react';

export type Strategy = 'keepAlive' | 'swap';
export type Mount = 'lazy' | 'eager';

export type VariantMap<K extends string> = Record<K, ReactNode | (() => ReactNode)>;

export interface ResponsiveProps<K extends string> {
  variant: NoInfer<K>;
  variants: VariantMap<K>;
  strategy?: Strategy;
  mount?: Mount;
}

export interface VariantRenderProps<K extends string> {
  variant: K;
  variants: VariantMap<K>;
}

export interface MediaVariantOptions<K extends string> {
  ssr?: K;
  settleMs?: number;
  deferWhileComposing?: boolean;
}

export interface ResponsiveValueOptions<K extends string> {
  ssr?: K;
  settleMs?: number;
}
