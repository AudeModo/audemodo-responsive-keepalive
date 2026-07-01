// @vitest-environment jsdom
import { act } from '@testing-library/react';
import { hydrateRoot, type Root } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { createResponsive } from '../../src/config/createResponsive';
import { makeMatchMedia } from '../helpers';

const MOBILE_Q = '(max-width: 759px)';
const DESKTOP_Q = '(min-width: 760px)';

function setup() {
  const api = createResponsive({ mobile: 0, desktop: 760 }, { ssr: 'desktop' });
  const Probe = () => <p data-testid="v">{api.useVariant()}</p>;
  const tree = (
    <api.Provider>
      <Probe />
    </api.Provider>
  );
  return { tree };
}

function hydrationMismatchCalls(spy: ReturnType<typeof vi.spyOn>) {
  return spy.mock.calls.filter((c: unknown[]) =>
    /hydrat|did not match|server (?:html|render|-rendered)/i.test(String(c[0])),
  );
}

describe('SSR hydration — server → client handoff', () => {
  let root: Root | null = null;
  afterEach(() => {
    if (root) act(() => root!.unmount());
    root = null;
    document.body.innerHTML = '';
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('reconciles to the client viewport when it differs from ssr, with no mismatch', () => {
    const { tree } = setup();
    const html = renderToString(tree);
    expect(html).toContain('desktop');

    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    set({ [MOBILE_Q]: true });

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => {
      root = hydrateRoot(container, tree);
    });
    act(() => {});

    expect(hydrationMismatchCalls(errorSpy)).toHaveLength(0);
    expect(container.querySelector('[data-testid="v"]')?.textContent).toBe('mobile');
  });

  it('stays on the ssr branch when the client viewport already matches it', () => {
    const { tree } = setup();
    const html = renderToString(tree);
    const { mm, set } = makeMatchMedia();
    vi.stubGlobal('matchMedia', mm);
    set({ [DESKTOP_Q]: true });

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    act(() => {
      root = hydrateRoot(container, tree);
    });
    act(() => {});

    expect(hydrationMismatchCalls(errorSpy)).toHaveLength(0);
    expect(container.querySelector('[data-testid="v"]')?.textContent).toBe('desktop');
  });
});
