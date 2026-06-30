// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { Responsive } from '../../src/responsive/Responsive';
import { SharedStateScope } from '../../src/shared/SharedStateScope';
import { useSharedState } from '../../src/shared/useSharedState';

afterEach(() => cleanup());

function Writer({ tid, k = 'k', init = 'init' }: { tid: string; k?: string; init?: string }) {
  const [value, setValue] = useSharedState(k, init);
  return (
    <div>
      <span data-testid={`${tid}-v`}>{value}</span>
      <button data-testid={`${tid}-set`} onClick={() => setValue('next')}>
        set
      </button>
    </div>
  );
}
const text = (tid: string) => screen.getByTestId(tid).textContent;

describe('useSharedState', () => {
  it('synchronizes siblings that declare state independently (no lifting)', () => {
    render(
      <SharedStateScope>
        <Writer tid="a" />
        <Writer tid="b" />
      </SharedStateScope>,
    );
    expect(text('a-v')).toBe('init');
    expect(text('b-v')).toBe('init');
    fireEvent.click(screen.getByTestId('a-set'));
    expect(text('a-v')).toBe('next');
    expect(text('b-v')).toBe('next');
  });

  it('isolates keys across separate scopes', () => {
    render(
      <>
        <SharedStateScope>
          <Writer tid="a" />
        </SharedStateScope>
        <SharedStateScope>
          <Writer tid="b" />
        </SharedStateScope>
      </>,
    );
    fireEvent.click(screen.getByTestId('a-set'));
    expect(text('a-v')).toBe('next');
    expect(text('b-v')).toBe('init');
  });

  it('supports updater functions', () => {
    function Counter() {
      const [n, setN] = useSharedState('n', 0);
      return (
        <button data-testid="c" onClick={() => setN((prev) => prev + 1)}>
          {n}
        </button>
      );
    }
    render(
      <SharedStateScope>
        <Counter />
      </SharedStateScope>,
    );
    expect(text('c')).toBe('0');
    fireEvent.click(screen.getByTestId('c'));
    fireEvent.click(screen.getByTestId('c'));
    expect(text('c')).toBe('2');
  });

  it('throws when used outside any scope', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<Writer tid="x" />)).toThrow(/SharedStateScope|Responsive/);
    spy.mockRestore();
  });

  it('persists shared state across strategy="swap" (store lives in the scope)', () => {
    const variants = {
      d: () => <Writer tid="d" k="s" init="" />,
      m: () => <Writer tid="m" k="s" init="" />,
    };
    const { rerender } = render(<Responsive variant="d" variants={variants} strategy="swap" />);
    fireEvent.click(screen.getByTestId('d-set'));
    expect(text('d-v')).toBe('next');
    rerender(<Responsive variant="m" variants={variants} strategy="swap" />);
    expect(text('m-v')).toBe('next');
  });

  it('auto-provides a scope inside <Responsive> (no explicit provider)', () => {
    const variants = {
      d: () => <Writer tid="d" k="s2" init="x" />,
      m: () => <Writer tid="m" k="s2" init="x" />,
    };
    const { rerender } = render(
      <Responsive variant="d" variants={variants} strategy="keepAlive" />,
    );
    fireEvent.click(screen.getByTestId('d-set'));
    expect(text('d-v')).toBe('next');
    rerender(<Responsive variant="m" variants={variants} strategy="keepAlive" />);
    expect(text('m-v')).toBe('next');
  });
});
