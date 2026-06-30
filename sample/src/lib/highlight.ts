export type TokenType = 'key' | 'str' | 'com' | 'num' | 'comp' | 'punct' | 'plain' | 'ws';
export interface Token {
  type: TokenType;
  text: string;
}

const KEYWORDS = new Set([
  'import',
  'from',
  'export',
  'const',
  'let',
  'var',
  'function',
  'return',
  'default',
  'as',
  'new',
  'typeof',
  'interface',
  'type',
  'extends',
  'true',
  'false',
]);

const RE =
  /(\/\/[^\n]*)|('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`|"(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\s])/g;

export function tokenize(code: string): Token[] {
  const out: Token[] = [];
  RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = RE.exec(code)) !== null) {
    if (m[1] !== undefined) out.push({ type: 'com', text: m[1] });
    else if (m[2] !== undefined) out.push({ type: 'str', text: m[2] });
    else if (m[3] !== undefined) out.push({ type: 'num', text: m[3] });
    else if (m[4] !== undefined) {
      const t = m[4];
      if (KEYWORDS.has(t)) out.push({ type: 'key', text: t });
      else if (/^[A-Z]/.test(t)) out.push({ type: 'comp', text: t });
      else out.push({ type: 'plain', text: t });
    } else if (m[5] !== undefined) out.push({ type: 'ws', text: m[5] });
    else out.push({ type: 'punct', text: m[6] ?? '' });
  }
  return out;
}
