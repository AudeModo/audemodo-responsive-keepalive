import { describe, expect, it } from 'vitest';
import { Activity, isActivitySupported } from '../../src/platform/activity';

describe('platform/activity', () => {
  it('reports Activity as supported on React 19.2+', () => {
    expect(isActivitySupported()).toBe(true);
  });

  it('exposes the Activity component', () => {
    expect(Activity).toBeDefined();
  });
});
