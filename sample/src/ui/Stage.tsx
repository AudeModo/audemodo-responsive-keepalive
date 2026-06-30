import { useRef, useState, type ReactNode } from 'react';

let mountCounter = 0;

/**
 * A small stateful card used to make state preservation visible: a counter and a
 * text field. A unique instance id is assigned on mount, so a remount (swap) shows
 * a new id and reset state, while keep-alive shows the same id and kept state.
 */
export function ProbeCard({ kind, title }: { kind: 'mobile' | 'desktop'; title: string }) {
  const iid = useRef(0);
  if (iid.current === 0) iid.current = ++mountCounter;
  const [count, setCount] = useState(0);
  const [text, setText] = useState('');
  return (
    <div className={`demo-card ${kind}`}>
      <h4>
        {title}
        <span className="iid">instance #{iid.current}</span>
      </h4>
      <div className="demo-row">
        <button className="btn" onClick={() => setCount((v) => v + 1)}>
          count: {count}
        </button>
        <input
          className="field"
          style={{ maxWidth: 150 }}
          placeholder="type to test state…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
    </div>
  );
}

export function Stage({ children }: { children: ReactNode }) {
  return (
    <div className="stage">
      <div className="stage-label">Live preview</div>
      {children}
    </div>
  );
}
