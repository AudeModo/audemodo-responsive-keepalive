// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { afterEach, describe, expect, it } from 'vitest';

import { Responsive } from '../../src';
import { nextIid, resetIid } from '../helpers';

afterEach(() => {
  cleanup();
  resetIid();
});

const valOf = (tid: string) => (screen.getByTestId(tid) as HTMLInputElement).value;
const iidOf = (tid: string) => screen.getByTestId(tid).textContent;
const typeInto = (tid: string, v: string) =>
  fireEvent.change(screen.getByTestId(tid), { target: { value: v } });

function LocalVariant({ tid }: { tid: string }) {
  const [v, setV] = useState('');
  const iid = useRef(nextIid()).current;
  return (
    <div>
      <input data-testid={`${tid}-input`} value={v} onChange={(e) => setV(e.target.value)} />
      <span data-testid={`${tid}-iid`} hidden>
        {iid}
      </span>
    </div>
  );
}

function ControlledVariant({
  tid,
  text,
  onText,
}: {
  tid: string;
  text: string;
  onText: (s: string) => void;
}) {
  return (
    <input data-testid={`${tid}-input`} value={text} onChange={(e) => onText(e.target.value)} />
  );
}

describe('Responsive — variant value forms', () => {
  it('accepts a React element (not only a function) and keeps its state under keepAlive', () => {
    function Fixture({ variant }: { variant: 'mobile' | 'desktop' }) {
      return (
        <Responsive
          variant={variant}
          variants={{
            mobile: <LocalVariant tid="m" />,
            desktop: <LocalVariant tid="d" />,
          }}
        />
      );
    }
    const { rerender } = render(<Fixture variant="desktop" />);
    typeInto('d-input', 'kept');

    rerender(<Fixture variant="mobile" />);
    expect(valOf('d-input')).toBe('kept');

    rerender(<Fixture variant="desktop" />);
    expect(valOf('d-input')).toBe('kept');
  });
});

describe('Responsive — keepAlive (default)', () => {
  function Fixture({ variant }: { variant: 'mobile' | 'desktop' }) {
    return (
      <Responsive
        variant={variant}
        variants={{
          mobile: () => <LocalVariant tid="m" />,
          desktop: () => <LocalVariant tid="d" />,
        }}
      />
    );
  }

  it('lazy-mounts: a never-activated variant is absent until first shown', () => {
    render(<Fixture variant="desktop" />);
    expect(screen.queryByTestId('d-input')).not.toBeNull();
    expect(screen.queryByTestId('m-input')).toBeNull();
  });

  it('preserves per-side local state across a round trip (same instance)', () => {
    const { rerender } = render(<Fixture variant="desktop" />);
    typeInto('d-input', 'local state');
    const id0 = iidOf('d-iid');

    rerender(<Fixture variant="mobile" />);
    expect(valOf('d-input')).toBe('local state');
    expect(screen.queryByTestId('m-input')).not.toBeNull();

    rerender(<Fixture variant="desktop" />);
    expect(valOf('d-input')).toBe('local state');
    expect(iidOf('d-iid')).toBe(id0);
  });

  it('keeps an activated variant alive after switching away', () => {
    const { rerender } = render(<Fixture variant="desktop" />);
    rerender(<Fixture variant="mobile" />);
    typeInto('m-input', 'mobile input');
    rerender(<Fixture variant="desktop" />);
    expect(screen.queryByTestId('m-input')).not.toBeNull();
    expect(valOf('m-input')).toBe('mobile input');
  });
});

describe('Responsive — lifted shared state composes', () => {
  function SharedFixture() {
    const [text, setText] = useState('');
    const [variant, setVariant] = useState<'mobile' | 'desktop'>('desktop');
    return (
      <>
        <button data-testid="go-mobile" onClick={() => setVariant('mobile')} />
        <button data-testid="go-desktop" onClick={() => setVariant('desktop')} />
        <Responsive
          variant={variant}
          variants={{
            mobile: () => <ControlledVariant tid="m" text={text} onText={setText} />,
            desktop: () => <ControlledVariant tid="d" text={text} onText={setText} />,
          }}
        />
      </>
    );
  }

  it('shares text across variants and preserves it', () => {
    render(<SharedFixture />);
    typeInto('d-input', 'share + preserve');
    fireEvent.click(screen.getByTestId('go-mobile'));
    expect(valOf('m-input')).toBe('share + preserve');
    fireEvent.click(screen.getByTestId('go-desktop'));
    expect(valOf('d-input')).toBe('share + preserve');
  });
});

describe('Responsive — strategy="swap"', () => {
  function SwapFixture({ variant }: { variant: 'mobile' | 'desktop' }) {
    return (
      <Responsive
        strategy="swap"
        variant={variant}
        variants={{
          mobile: () => <LocalVariant tid="m" />,
          desktop: () => <LocalVariant tid="d" />,
        }}
      />
    );
  }

  it('unmounts and loses state on switch (opt-in baseline)', () => {
    const { rerender } = render(<SwapFixture variant="desktop" />);
    typeInto('d-input', 'lost value');
    const id0 = iidOf('d-iid');
    rerender(<SwapFixture variant="mobile" />);
    expect(screen.queryByTestId('d-input')).toBeNull();
    rerender(<SwapFixture variant="desktop" />);
    expect(valOf('d-input')).toBe('');
    expect(iidOf('d-iid')).not.toBe(id0);
  });
});

describe('Responsive — mount="eager"', () => {
  it('mounts all variants immediately', () => {
    render(
      <Responsive
        mount="eager"
        variant="desktop"
        variants={{
          mobile: () => <LocalVariant tid="m" />,
          desktop: () => <LocalVariant tid="d" />,
        }}
      />,
    );
    expect(screen.queryByTestId('d-input')).not.toBeNull();
    expect(screen.queryByTestId('m-input')).not.toBeNull();
  });
});
