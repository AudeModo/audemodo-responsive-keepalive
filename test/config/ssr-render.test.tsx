import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';

import { createResponsive } from '../../src/config/createResponsive';
import { SharedStateScope } from '../../src/shared/SharedStateScope';
import { useSharedState } from '../../src/shared/useSharedState';

describe('SSR — rendering with no DOM (Next.js server parity)', () => {
  it('this environment really has no window/document', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('factory <Responsive> renders only the ssr-override branch (lazy mount)', () => {
    const { Provider, Responsive } = createResponsive(
      { mobile: 0, desktop: 760 },
      { ssr: 'desktop' },
    );
    const html = renderToStaticMarkup(
      <Provider>
        <Responsive desktop={() => <div>DESKTOP_ONLY</div>} mobile={() => <div>MOBILE_ONLY</div>} />
      </Provider>,
    );
    expect(html).toContain('DESKTOP_ONLY');
    expect(html).not.toContain('MOBILE_ONLY');
  });

  it('a per-Provider ssr prop overrides the factory default server-side', () => {
    const { Provider, Responsive } = createResponsive(
      { mobile: 0, desktop: 760 },
      { ssr: 'desktop' },
    );
    const html = renderToStaticMarkup(
      <Provider ssr="mobile">
        <Responsive
          desktop={() => <span>DESKTOP_ONLY</span>}
          mobile={() => <span>MOBILE_ONLY</span>}
        />
      </Provider>,
    );
    expect(html).toContain('MOBILE_ONLY');
    expect(html).not.toContain('DESKTOP_ONLY');
  });

  it('useVariant returns the ssr fallback during SSR', () => {
    const { Provider, useVariant } = createResponsive(
      { mobile: 0, desktop: 760 },
      { ssr: 'desktop' },
    );
    const Probe = () => <output>{useVariant()}</output>;
    expect(
      renderToStaticMarkup(
        <Provider>
          <Probe />
        </Provider>,
      ),
    ).toContain('desktop');
  });

  it('useResponsiveValue selects the ssr value during SSR', () => {
    const { Provider, useResponsiveValue } = createResponsive(
      { mobile: 0, desktop: 760 },
      { ssr: 'mobile' },
    );
    const Probe = () => <output>cols:{useResponsiveValue({ mobile: 1, desktop: 3 })}</output>;
    expect(
      renderToStaticMarkup(
        <Provider>
          <Probe />
        </Provider>,
      ),
    ).toContain('cols:1');
  });

  it('useSharedState renders its initial value during SSR (scope is SSR-safe, no DOM)', () => {
    const Probe = () => {
      const [q] = useSharedState('search', 'hello-ssr');
      return <output>{q}</output>;
    };
    const html = renderToStaticMarkup(
      <SharedStateScope>
        <Probe />
      </SharedStateScope>,
    );
    expect(html).toContain('hello-ssr');
  });
});
