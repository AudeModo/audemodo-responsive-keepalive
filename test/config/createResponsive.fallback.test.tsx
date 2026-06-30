import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';

vi.mock('../../src/platform/activity', () => ({
  Activity: undefined,
  isActivitySupported: () => false,
}));

import { createResponsive } from '../../src/config/createResponsive';
import { resetWarnings } from '../../src/internal/warnOnce';
import { makeMatchMedia } from '../helpers';

afterEach(() => {
  cleanup();
  resetWarnings();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('createResponsive — Match gates without Activity (DIP fallback)', () => {
  it('degrades keep-alive gates to swap and warns once across gates', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Match } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    const { desktop: Desktop, mobile: Mobile } = Match;
    set({ '(min-width: 760px)': true }); // desktop active
    render(
      <>
        <Desktop>
          <span data-testid="d">D</span>
        </Desktop>
        <Mobile>
          <span data-testid="m">M</span>
        </Mobile>
      </>,
    );
    expect(screen.queryByTestId('d')).toBeTruthy();
    expect(screen.queryByTestId('m')).toBeNull(); // swap: 비활성 미마운트
    expect(warn).toHaveBeenCalledTimes(1); // warnOnce가 두 게이트에서 1회로 dedupe
  });
});
