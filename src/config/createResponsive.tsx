import { createContext, type ReactElement, useContext } from 'react';

import { warnOnce } from '../internal/warnOnce';
import { useMediaVariant } from '../media/useMediaVariant';
import { useResponsiveValue as baseUseResponsiveValue } from '../media/useResponsiveValue';
import { Activity, isActivitySupported } from '../platform/activity';
import { breakpointsToQueries } from '../query/breakpointsToQueries';
import { Responsive as ControlledResponsive } from '../responsive/Responsive';
import { SharedStateScope } from '../shared/SharedStateScope';
import type {
  ConfiguredResponsive,
  ConfiguredResponsiveProps,
  CreateResponsiveOptions,
  MatchProps,
  ResponsiveProviderProps,
  VariantMap,
} from '../types';

const ACTIVITY_GATE_WARNING =
  '[responsive-keepalive] <Activity> is unavailable; ' +
  'Match gates fall back to swap (inactive branches unmount and lose state). ' +
  'Upgrade to React 19.2+ for keep-alive.';

/** Prop names owned by the configured components; a breakpoint key must not collide with these. */
const RESERVED = ['strategy', 'mount', 'ssr', 'settleMs', 'deferWhileComposing'];

/** PascalCase a breakpoint key so `const { Desktop } = Match` works without renaming. */
const toGateName = (key: string): string => key.charAt(0).toUpperCase() + key.slice(1);

/**
 * Builds a `<Responsive>` plus a root `Provider` and composable `Match` gates, all bound to a
 * breakpoint config kept in its own file. Variant keys are inferred from the config and
 * type-checked, so missing or unknown keys are compile errors. This is an assembly of the
 * low-level primitives, not a new mechanism.
 *
 * @example
 * // responsive.ts
 * export const { Provider, Match, useVariant } = createResponsive(
 *   { mobile: 0, desktop: 768 },
 *   { ssr: 'mobile' },
 * );
 * export const { Mobile, Desktop } = Match;
 *
 * // App root (or Next app/layout.tsx)
 * <Provider>{children}</Provider>;
 *
 * // anywhere — composable like ordinary components, with keep-alive + shared state
 * <Desktop><DesktopNav /></Desktop>
 * <Mobile><MobileTabBar /></Mobile>
 */
export function createResponsive<const K extends string>(
  breakpoints: Record<K, number>,
  defaults: CreateResponsiveOptions<NoInfer<K>> = {},
): ConfiguredResponsive<K> {
  for (const key of Object.keys(breakpoints)) {
    if (RESERVED.includes(key)) {
      throw new Error(
        `[responsive-keepalive] createResponsive: breakpoint key "${key}" collides with a reserved prop (${RESERVED.join(', ')}).`,
      );
    }
  }
  // Derived once, then shared by every returned primitive (component, gates, and hooks).
  const queries = breakpointsToQueries(breakpoints);

  /**
   * Merge resolution options with the factory's three-level precedence:
   * per-call `options` → the nearest Provider's SSR override → the factory `defaults`.
   */
  const resolveOptions = (options: CreateResponsiveOptions<K>, ssrOverride: K | undefined) => ({
    ssr: options.ssr ?? ssrOverride ?? defaults.ssr,
    settleMs: options.settleMs ?? defaults.settleMs,
    deferWhileComposing: options.deferWhileComposing ?? defaults.deferWhileComposing,
  });

  // Per-instance context: a Provider can override the SSR/initial variant for its subtree.
  const SsrContext = createContext<K | undefined>(undefined);

  function Provider({ children, ssr }: ResponsiveProviderProps<K>): ReactElement {
    return (
      <SsrContext.Provider value={ssr}>
        <SharedStateScope>{children}</SharedStateScope>
      </SsrContext.Provider>
    );
  }
  Provider.displayName = 'ResponsiveProvider';

  /** The active variant key for the configured breakpoints (queries are pre-bound). */
  const useVariant = (options: CreateResponsiveOptions<K> = {}): K => {
    return useMediaVariant(queries, resolveOptions(options, useContext(SsrContext)));
  };

  function Responsive(props: ConfiguredResponsiveProps<K>): ReactElement {
    // Reserved props are split off here; everything else is a per-variant render prop.
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

  /** Build a gate for one breakpoint: renders its children only while that breakpoint is active. */
  const makeGate = (key: K) => {
    function Gate({ children, keepAlive = true }: MatchProps): ReactElement {
      const active = useVariant() === key;
      if (keepAlive) {
        // Keep the inactive branch mounted (state preserved) via Activity when available.
        if (isActivitySupported()) {
          return <Activity mode={active ? 'visible' : 'hidden'}>{children}</Activity>;
        }
        warnOnce(ACTIVITY_GATE_WARNING);
      }
      return <>{active ? children : null}</>;
    }
    Gate.displayName = `Match.${toGateName(key)}`;
    return Gate;
  };

  // PascalCased gate map, e.g. `{ Mobile, Desktop }`, so gates destructure by name.
  const Match = Object.fromEntries(
    (Object.keys(queries) as K[]).map((key) => [toGateName(key), makeGate(key)]),
  ) as unknown as { [P in K as Capitalize<P>]: (props: MatchProps) => ReactElement };

  /** Pick a value per configured breakpoint; delegates to the low-level hook with bound queries. */
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
