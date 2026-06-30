import { tokenize, type TokenType } from '../lib/highlight';

const CLASS: Record<TokenType, string> = {
  key: 'tok-key',
  str: 'tok-str',
  com: 'tok-com',
  num: 'tok-num',
  comp: 'tok-comp',
  punct: 'tok-punct',
  plain: '',
  ws: '',
};

export function CodeBlock({ code, file }: { code: string; file: string }) {
  const tokens = tokenize(code);
  return (
    <div>
      <div className="code-head">
        <span>
          <span className="code-dot" style={{ background: '#e0697f' }} />
          <span className="code-dot" style={{ background: '#e7b04a' }} />
          <span className="code-dot" style={{ background: '#5bbd7e' }} />
        </span>
        <span>{file}</span>
      </div>
      <pre className="code">
        {tokens.map((t, i) =>
          t.type === 'plain' || t.type === 'ws' ? (
            t.text
          ) : (
            <span key={i} className={CLASS[t.type]}>
              {t.text}
            </span>
          ),
        )}
      </pre>
    </div>
  );
}
