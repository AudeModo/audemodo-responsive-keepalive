import { createContext, useContext, type ReactElement } from 'react';
import { Responsive as ControlledResponsive } from '../responsive/Responsive';
import { useMediaVariant } from '../media/useMediaVariant';
import { useResponsiveValue as baseUseResponsiveValue } from '../media/useResponsiveValue';
import { Activity, isActivitySupported } from '../platform/activity';
import { warnOnce } from '../internal/warnOnce';
import { SharedStateScope } from '../shared/SharedStateScope';
import type {
  ConfiguredResponsive,
  ConfiguredResponsiveProps,
  CreateResponsiveOptions,
  MatchProps,
  ResponsiveProviderProps,
  VariantMap,
} from '../types';
import { breakpointsToQueries } from './breakpointsToQueries';

const RESERVED = ['strategy', 'mount', 'ssr', 'settleMs', 'deferWhileComposing'];

export function createResponsive<const K extends string>(
  breakpoints: Record<K, string | number>,
  defaults: CreateResponsiveOptions<NoInfer<K>> = {},
): ConfiguredResponsive<K> {
  for (const key of Object.keys(breakpoints)) {
    if (RESERVED.includes(key)) {
      throw new Error(
        `[responsive-keepalive] createResponsive: breakpoint key "${key}" collides with a reserved prop (${RESERVED.join(', ')}).`,
      );
    }
  }
  const queries = breakpointsToQueries(breakpoints);

  const resolveOptions = (options: CreateResponsiveOptions<K>, ssrOverride: K | undefined) => ({
    ssr: options.ssr ?? ssrOverride ?? defaults.ssr,
    settleMs: options.settleMs ?? defaults.settleMs,
    deferWhileComposing: options.deferWhileComposing ?? defaults.deferWhileComposing,
  });

  const SsrContext = createContext<K | undefined>(undefined);

  function Provider({ children, ssr }: ResponsiveProviderProps<K>): ReactElement {
    return (
      <SsrContext.Provider value={ssr}>
        <SharedStateScope>{children}</SharedStateScope>
      </SsrContext.Provider>
    );
  }
  Provider.displayName = 'ResponsiveProvider';

  const useVariant = (options: CreateResponsiveOptions<K> = {}): K => {
    return useMediaVariant(queries, resolveOptions(options, useContext(SsrContext)));
  };

  function Responsive(props: ConfiguredResponsiveProps<K>): ReactElement {
    const { strategy, mount, ssr, settleMs, deferWhileComposing, ...variants } = props;
    const variant = useMediaVariant(
      queries,
      resolveOptions({ ssr, settleMs, deferWhileComposing }, useContext(SsrContext)),
    );
    return (
      <ControlledResponsive
        variant={variant}
        variants={variants as unknown as VariantMap<K>}
        strategy={strategy}
        mount={mount}
      />
    );
  }
  Responsive.displayName = 'ConfiguredResponsive';

  const makeGate = (key: K) => {
    function Gate({ children, keepAlive = true }: MatchProps): ReactElement {
      const active = useVariant() === key;
      if (keepAlive) {
        if (isActivitySupported()) {
          return <Activity mode={active ? 'visible' : 'hidden'}>{children}</Activity>;
        }
        warnOnce(
          '[responsive-keepalive] <Activity> is unavailable; Match gates fall back to swap (inactive branches unmount and lose state). Upgrade to React 19.2+ for keep-alive.',
        );
      }
      return <>{active ? children : null}</>;
    }
    Gate.displayName = `Match.${key}`;
    return Gate;
  };

  const Match = Object.fromEntries(
    (Object.keys(queries) as K[]).map((key) => [key, makeGate(key)]),
  ) as unknown as { [P in K]: (props: MatchProps) => ReactElement };

  const useResponsiveValue = <V,>(
    values: Record<K, V>,
    options: Omit<CreateResponsiveOptions<K>, 'deferWhileComposing'> = {},
  ): V => {
    const resolved = resolveOptions(options, useContext(SsrContext));
    return baseUseResponsiveValue(queries, values, {
      ssr: resolved.ssr,
      settleMs: resolved.settleMs,
    });
  };

  return { Responsive, Provider, Match, useVariant, useResponsiveValue, breakpoints: queries };
}
