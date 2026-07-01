import { SharedStateScope, useSharedState } from '@audemodo/responsive-keepalive';
import { useRef, useState } from 'react';

import { Control, Segmented } from '../ui/Controls';
import { Playground } from '../ui/Playground';
import { Stage } from '../ui/Stage';

type Mode = 'shared' | 'separate';

let fieldCounter = 0;

function SearchField({ label, kind }: { label: string; kind: 'mobile' | 'desktop' }) {
  const iid = useRef(0);
  if (iid.current === 0) iid.current = ++fieldCounter;
  const [query, setQuery] = useSharedState('search', '');
  return (
    <div className={`demo-card ${kind}`}>
      <h4>
        {label}
        <span className="iid">instance #{iid.current}</span>
      </h4>
      <input
        className="field"
        placeholder="shared key: 'search'"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
    </div>
  );
}

function buildCode(mode: Mode): string {
  const decl = `import { SharedStateScope, useSharedState } from '@audemodo/responsive-keepalive';

function SearchField() {
  // Same key + same initial value at every call site; the first present value wins.
  const [query, setQuery] = useSharedState('search', '');
  return <input value={query} onChange={(e) => setQuery(e.target.value)} />;
}`;
  if (mode === 'shared') {
    return `${decl}

// One scope → independent siblings stay in sync, no lifting.
<SharedStateScope>
  <SearchField />
  <SearchField />
</SharedStateScope>;`;
  }
  return `${decl}

// Separate scopes → the same key is isolated per scope.
<SharedStateScope><SearchField /></SharedStateScope>
<SharedStateScope><SearchField /></SharedStateScope>;`;
}

export function SharedState() {
  const [mode, setMode] = useState<Mode>('shared');
  const [nonce, setNonce] = useState(0);

  const fields = (
    <>
      <SearchField key={`a-${nonce}`} label="Desktop layout" kind="desktop" />
      <SearchField key={`b-${nonce}`} label="Mobile layout" kind="mobile" />
    </>
  );

  return (
    <Playground
      name="Shared state"
      api="useSharedState"
      desc="Share state by key across siblings without lifting it to a parent. Because the store lives in the scope, the value also survives a remount (swap)."
      file="SearchBar.tsx"
      code={buildCode(mode)}
      stage={
        <Stage>
          <div
            className="demo-row"
            style={{ flexDirection: 'column', alignItems: 'stretch', gap: 10 }}
          >
            {mode === 'shared' ? (
              <SharedStateScope>{fields}</SharedStateScope>
            ) : (
              <>
                <SharedStateScope key={`sa-${nonce}`}>
                  <SearchField label="Desktop layout" kind="desktop" />
                </SharedStateScope>
                <SharedStateScope key={`sb-${nonce}`}>
                  <SearchField label="Mobile layout" kind="mobile" />
                </SharedStateScope>
              </>
            )}
          </div>
        </Stage>
      }
      controls={
        <>
          <Control label="scope">
            <Segmented
              value={mode}
              onChange={setMode}
              options={[
                { value: 'shared', label: 'shared (one scope)' },
                { value: 'separate', label: 'separate' },
              ]}
            />
          </Control>
          <Control label="swap simulation">
            <button className="btn" onClick={() => setNonce((n) => n + 1)}>
              ↻ remount fields (new instance ids)
            </button>
          </Control>
          <p className="note">
            Type in one field. In <b>shared</b> mode both sync; in <b>separate</b> mode they don't.
            Then remount — instance ids change but the value persists, because the store lives in
            the scope above. (<code>&lt;Responsive&gt;</code> auto-provides a scope, so you rarely
            write it by hand.)
          </p>
        </>
      }
    />
  );
}
