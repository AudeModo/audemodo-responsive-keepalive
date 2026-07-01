import type { ReactNode } from 'react';

/**
 * A variant's content may be given as a React node (`<Layout />`) or as a function
 * returning one (`() => <Layout />`). Both are supported: the node form is the
 * ergonomic default; the function form additionally defers creating the node until
 * the variant is mounted, which is worth it only for heavy trees that may never be
 * shown. This normalizes either form to a node at render time.
 */
export function renderVariant(value: ReactNode | (() => ReactNode)): ReactNode {
  return typeof value === 'function' ? value() : value;
}
