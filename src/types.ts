import type { ReactElement, ReactNode } from 'react';

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

export interface ContainerVariantOptions<K extends string> {
  ssr?: K;
  settleMs?: number;
}

export type BreakpointConfig<K extends string> = Record<K, number>;

export interface CreateResponsiveOptions<K extends string> {
  ssr?: K;
  settleMs?: number;
  deferWhileComposing?: boolean;
}

export type ConfiguredResponsiveProps<K extends string> = {
  [P in K]: ReactNode | (() => ReactNode);
} & {
  strategy?: Strategy;
  mount?: Mount;
  ssr?: K;
  settleMs?: number;
  deferWhileComposing?: boolean;
};

export interface ConfiguredResponsive<K extends string> {
  Responsive: (props: ConfiguredResponsiveProps<K>) => ReactElement;
  Provider: (props: ResponsiveProviderProps<K>) => ReactElement;
  Match: { [P in K]: (props: MatchProps) => ReactElement };
  useVariant: (options?: CreateResponsiveOptions<K>) => K;
  useResponsiveValue: <V>(
    values: Record<K, V>,
    options?: Omit<CreateResponsiveOptions<K>, 'deferWhileComposing'>,
  ) => V;
  breakpoints: Record<K, string>;
}

export interface ResponsiveProviderProps<K extends string> {
  children: ReactNode;
  ssr?: K;
}

export interface MatchProps {
  children: ReactNode;
  keepAlive?: boolean;
}
