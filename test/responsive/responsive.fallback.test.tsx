// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { useRef, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { resetWarnings } from '../../src/internal/warnOnce';
import { nextIid, resetIid } from '../helpers';

vi.mock('../../src/platform/activity', () => ({
  Activity: undefined,
  isActivitySupported: () => false,
}));

import { Responsive } from '../../src';

afterEach(() => {
  cleanup();
  resetIid();
  resetWarnings();
  vi.restoreAllMocks();
});

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

describe('Responsive — Activity unavailable fallback (DIP boundary)', () => {
  function Fixture({ variant }: { variant: 'm' | 'd' }) {
    return (
      <Responsive
        variant={variant}
        variants={{ m: () => <LocalVariant tid="m" />, d: () => <LocalVariant tid="d" /> }}
      />
    );
  }

  it('degrades keepAlive to swap (only active mounted, state lost) and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { rerender } = render(<Fixture variant="d" />);
    expect(screen.queryByTestId('m-input')).toBeNull();

    fireEvent.change(screen.getByTestId('d-input'), { target: { value: 'x' } });
    rerender(<Fixture variant="m" />);
    rerender(<Fixture variant="d" />);
    expect((screen.getByTestId('d-input') as HTMLInputElement).value).toBe('');
    expect(warn).toHaveBeenCalledTimes(1);
  });
});
