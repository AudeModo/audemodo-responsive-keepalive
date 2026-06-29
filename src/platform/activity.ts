import * as React from 'react';

export const Activity = React.Activity;

export function isActivitySupported(): boolean {
  return typeof React.Activity !== 'undefined';
}
