import { createResponsive } from '@audemodo/responsive-keepalive';

// One config, kept in its own module — the recommended consumer setup. Breakpoint
// keys are inferred and type-checked; values are integer px min-widths.
export const DESKTOP_MIN = 768;

export const { Responsive, Provider, Match, useVariant, useResponsiveValue } = createResponsive(
  { mobile: 0, desktop: DESKTOP_MIN },
  { ssr: 'mobile' },
);

// Match gates are PascalCased, so destructure them by name.
export const { Mobile, Desktop } = Match;
