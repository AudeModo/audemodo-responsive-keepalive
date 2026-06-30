import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { createResponsive } from '../../src/config/createResponsive';
import { useSharedState } from '../../src/shared/useSharedState';
import { makeMatchMedia } from '../helpers';

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

const d = () => <div data-testid="d">D</div>;
const m = () => <div data-testid="m">M</div>;

describe('createResponsive', () => {
  it('renders the named variant the config selects (active mounted, lazy keeps the other out)', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Responsive } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    set({ '(max-width: 759px)': true });
    render(<Responsive desktop={d} mobile={m} />);
    expect(screen.queryByTestId('m')).toBeTruthy();
    expect(screen.queryByTestId('d')).toBeNull();
  });

  it('accepts React elements for named variants, not only functions', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Responsive } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    set({ '(max-width: 759px)': true });
    render(
      <Responsive desktop={<div data-testid="d">D</div>} mobile={<div data-testid="m">M</div>} />,
    );
    expect(screen.queryByTestId('m')).toBeTruthy();
    expect(screen.queryByTestId('d')).toBeNull();
  });

  it('with mount="eager", keep-alive mounts every named variant up front', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Responsive } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    set({ '(max-width: 759px)': true });
    render(<Responsive mount="eager" desktop={d} mobile={m} />);
    expect(screen.queryByTestId('m')).toBeTruthy();
    expect(screen.queryByTestId('d')).toBeTruthy();
  });

  it('with strategy="swap", mounts only the variant the config selects', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Responsive } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    set({ '(min-width: 760px)': true });
    render(<Responsive strategy="swap" desktop={d} mobile={m} />);
    expect(screen.queryByTestId('d')).toBeTruthy();
    expect(screen.queryByTestId('m')).toBeNull();
  });

  it('useVariant returns the configured active variant and reacts to media changes', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { useVariant } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    function Probe() {
      return <span data-testid="v">{useVariant()}</span>;
    }
    set({ '(min-width: 760px)': true });
    render(<Probe />);
    expect(screen.getByTestId('v').textContent).toBe('desktop');
    act(() => set({ '(max-width: 759px)': true }));
    expect(screen.getByTestId('v').textContent).toBe('mobile');
  });

  it('configured useResponsiveValue returns the value for the active variant', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { useResponsiveValue } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    function Probe() {
      return <span data-testid="v">{useResponsiveValue({ mobile: 1, desktop: 3 })}</span>;
    }
    set({ '(min-width: 760px)': true });
    render(<Probe />);
    expect(screen.getByTestId('v').textContent).toBe('3');
  });

  it('throws if a breakpoint key collides with a reserved prop', () => {
    expect(() => createResponsive({ strategy: 0, mobile: 1 } as never)).toThrow();
  });

  it('Match gate renders the active variant and keeps both branches mounted (keep-alive)', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Match } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    const { desktop: Desktop, mobile: Mobile } = Match;
    set({ '(min-width: 760px)': true });
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
    expect(screen.queryByTestId('m')).toBeTruthy();
  });

  it('keep-alive preserves DEEPLY NESTED Desktop state (open panel + nested popup) across a switch to Mobile and back', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Match } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    const { desktop: Desktop, mobile: Mobile } = Match;

    function Popup() {
      const [text, setText] = useState('');
      return <input data-testid="popup" value={text} onChange={(e) => setText(e.target.value)} />;
    }
    function FilterPanel() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button data-testid="panel-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? 'close' : 'open'}
          </button>
          {open && (
            <div data-testid="panel-body">
              <Popup />
            </div>
          )}
        </div>
      );
    }
    const DesktopRoot = () => (
      <div data-testid="desktop-root">
        <aside>
          <FilterPanel />
        </aside>
      </div>
    );
    const MobileRoot = () => <div data-testid="mobile-root">mobile</div>;
    const get = (id: string) => screen.getByTestId(id);
    const inputValue = (id: string) => (screen.getByTestId(id) as HTMLInputElement).value;

    set({ '(min-width: 760px)': true });
    render(
      <>
        <Desktop>
          <DesktopRoot />
        </Desktop>
        <Mobile>
          <MobileRoot />
        </Mobile>
      </>,
    );

    expect(screen.queryByTestId('panel-body')).toBeNull();
    fireEvent.click(get('panel-toggle'));
    expect(get('panel-toggle').textContent).toBe('close');
    fireEvent.change(get('popup'), { target: { value: 'hello' } });
    expect(inputValue('popup')).toBe('hello');

    act(() => set({ '(max-width: 759px)': true }));
    expect(get('mobile-root')).toBeTruthy();
    expect(get('panel-toggle').textContent).toBe('close');
    expect(screen.queryByTestId('panel-body')).toBeTruthy();
    expect(inputValue('popup')).toBe('hello');

    act(() => set({ '(min-width: 760px)': true }));
    expect(get('panel-toggle').textContent).toBe('close');
    expect(screen.queryByTestId('panel-body')).toBeTruthy();
    expect(inputValue('popup')).toBe('hello');
  });

  it('with keepAlive={false}, the same deep Desktop state is LOST on switch (contrast — proves the test discriminates)', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Match } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    const { desktop: Desktop, mobile: Mobile } = Match;
    function FilterPanel() {
      const [open, setOpen] = useState(false);
      return (
        <div>
          <button data-testid="panel-toggle" onClick={() => setOpen((o) => !o)}>
            {open ? 'close' : 'open'}
          </button>
          {open && <div data-testid="panel-body">deep</div>}
        </div>
      );
    }
    set({ '(min-width: 760px)': true });
    render(
      <>
        <Desktop keepAlive={false}>
          <FilterPanel />
        </Desktop>
        <Mobile keepAlive={false}>
          <span data-testid="mobile-root">m</span>
        </Mobile>
      </>,
    );
    fireEvent.click(screen.getByTestId('panel-toggle'));
    expect(screen.getByTestId('panel-toggle').textContent).toBe('close');

    act(() => set({ '(max-width: 759px)': true }));
    act(() => set({ '(min-width: 760px)': true }));
    expect(screen.getByTestId('panel-toggle').textContent).toBe('open');
    expect(screen.queryByTestId('panel-body')).toBeNull();
  });

  it('a shared panel-open boolean syncs across Desktop/Mobile gates (cross-variant sharing, not just keep-alive)', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Provider, Match } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    const { desktop: Desktop, mobile: Mobile } = Match;
    function Panel({ tid }: { tid: string }) {
      const [open, setOpen] = useSharedState('panel-open', false);
      return (
        <button data-testid={`${tid}-panel`} onClick={() => setOpen((o) => !o)}>
          {open ? 'open' : 'closed'}
        </button>
      );
    }
    set({ '(min-width: 760px)': true });
    render(
      <Provider>
        <Desktop>
          <Panel tid="d" />
        </Desktop>
        <Mobile>
          <Panel tid="m" />
        </Mobile>
      </Provider>,
    );
    expect(screen.getByTestId('d-panel').textContent).toBe('closed');
    fireEvent.click(screen.getByTestId('d-panel'));
    expect(screen.getByTestId('d-panel').textContent).toBe('open');
    act(() => set({ '(max-width: 759px)': true }));
    expect(screen.getByTestId('m-panel').textContent).toBe('open');
  });

  it('Match with keepAlive={false} unmounts the inactive branch (swap)', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Match } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    const { desktop: Desktop, mobile: Mobile } = Match;
    set({ '(min-width: 760px)': true });
    render(
      <>
        <Desktop keepAlive={false}>
          <span data-testid="d">D</span>
        </Desktop>
        <Mobile keepAlive={false}>
          <span data-testid="m">M</span>
        </Mobile>
      </>,
    );
    expect(screen.queryByTestId('d')).toBeTruthy();
    expect(screen.queryByTestId('m')).toBeNull();
  });

  it('Provider supplies a shared scope so independent gates sync via useSharedState', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Provider, Match } = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'mobile' });
    const { desktop: Desktop, mobile: Mobile } = Match;
    function Field({ tid }: { tid: string }) {
      const [v, setV] = useSharedState('q', '');
      return (
        <>
          <span data-testid={`${tid}-v`}>{v}</span>
          <button data-testid={`${tid}-set`} onClick={() => setV('x')} />
        </>
      );
    }
    set({ '(min-width: 760px)': true });
    render(
      <Provider>
        <Desktop>
          <Field tid="d" />
        </Desktop>
        <Mobile>
          <Field tid="m" />
        </Mobile>
      </Provider>,
    );
    fireEvent.click(screen.getByTestId('d-set'));
    expect(screen.getByTestId('d-v').textContent).toBe('x');
    act(() => set({ '(max-width: 759px)': true }));
    expect(screen.getByTestId('m-v').textContent).toBe('x');
  });

  it('Provider ssr overrides the configured default for the subtree', () => {
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    const { Provider, useVariant } = createResponsive(
      { mobile: 0, desktop: 760 },
      { ssr: 'mobile' },
    );
    function Probe() {
      return <span data-testid="v">{useVariant()}</span>;
    }
    set({});
    render(
      <Provider ssr="desktop">
        <Probe />
      </Provider>,
    );
    expect(screen.getByTestId('v').textContent).toBe('desktop');
  });
});

// --- Compile-time type contract (validated by tsc) ---
const typed = createResponsive({ mobile: 0, desktop: 760 });
// @ts-expect-error 'mobile' is a required variant prop
const _missing = <typed.Responsive desktop={() => null} />;
// @ts-expect-error 'tablet' is not a configured variant key
const _extra = <typed.Responsive desktop={() => null} mobile={() => null} tablet={() => null} />;
const _ok = <typed.Responsive desktop={() => null} mobile={() => null} />;
void _missing;
void _extra;
void _ok;
// @ts-expect-error 'tablet' is not a configured Match gate
void typed.Match.tablet;
void typed.Match.desktop;
