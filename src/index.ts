/**
 * Public entry point for `responsive-keepalive`. Re-exports the consumer-facing API only;
 * internal modules (policies, platform, query, …) are intentionally not exposed, keeping the
 * package surface small and stable.
 */

// Components & hooks
export { createResponsive } from './config/createResponsive';
export { useContainerVariant } from './container/useContainerVariant';
export { useMediaVariant } from './media/useMediaVariant';
export { useResponsiveValue } from './media/useResponsiveValue';
export { Responsive } from './responsive/Responsive';
export { SharedStateScope } from './shared/SharedStateScope';
export { type SetSharedState, useSharedState } from './shared/useSharedState';

// Public types
export type {
  BreakpointConfig,
  ConfiguredResponsive,
  ConfiguredResponsiveProps,
  ContainerVariantOptions,
  CreateResponsiveOptions,
  MatchProps,
  MediaInput,
  MediaVariantOptions,
  Mount,
  ResponsiveProps,
  ResponsiveProviderProps,
  ResponsiveValueOptions,
  Strategy,
  VariantMap,
} from './types';
