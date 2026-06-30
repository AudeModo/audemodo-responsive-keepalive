import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen } from '@testing-library/react';
import { useMediaVariant } from '../../src';
import { makeMatchMedia } from '../helpers';

const DESKTOP = '(min-width:768px)';
const MOBILE = '(max-width:767px)';

function Probe({ ssr }: { ssr?: 'desktop' | 'mobile' }) {
  const v = useMediaVariant({ desktop: DESKTOP, mobile: MOBILE }, { ssr });
  return <span data-testid="v">{v}</span>;
}
const cur = () => screen.getByTestId('v').textContent;

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe('useMediaVariant (M3: raw match + fallback)', () => {
  it('defaults the fallback to the first query key when ssr is omitted', () => {
    const { mm } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    render(<Probe />);
    expect(cur()).toBe('desktop');
  });

  it('falls back to the ssr variant when nothing matches', () => {
    const { mm } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    render(<Probe ssr="mobile" />);
    expect(cur()).toBe('mobile');
  });

  it('returns the variant whose query matches', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    act(() => set({ [DESKTOP]: true }));
    render(<Probe ssr="mobile" />);
    expect(cur()).toBe('desktop');
  });

  it('reacts to media changes', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    act(() => set({ [MOBILE]: true }));
    render(<Probe ssr="mobile" />);
    expect(cur()).toBe('mobile');
    act(() => set({ [DESKTOP]: true }));
    expect(cur()).toBe('desktop');
  });
});
