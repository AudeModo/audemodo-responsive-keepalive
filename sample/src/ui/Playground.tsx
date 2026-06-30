import type { ReactNode } from 'react';
import { CodeBlock } from './CodeBlock';

export function Playground({
  name,
  api,
  desc,
  stage,
  controls,
  code,
  file,
}: {
  name: string;
  api: string;
  desc: string;
  stage: ReactNode;
  controls: ReactNode;
  code: string;
  file: string;
}) {
  return (
    <section className="pattern">
      <div className="pattern-head">
        <div className="pattern-name">
          {name}
          <span className="pattern-api">{api}</span>
        </div>
        <div className="pattern-desc">{desc}</div>
      </div>
      <div className="pattern-grid">
        <div className="pattern-live">
          {stage}
          <div className="controls">{controls}</div>
        </div>
        <aside className="pattern-code">
          <CodeBlock code={code} file={file} />
        </aside>
      </div>
    </section>
  );
}
