import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));

// The sample consumes the library by its package name, aliased to source so it
// reads exactly like real consumer code without a build/link step.
export default defineConfig({
  root: dir,
  plugins: [react()],
  resolve: {
    alias: { 'responsive-keepalive': path.resolve(dir, '../src/index.ts') },
    dedupe: ['react', 'react-dom'],
  },
  build: { outDir: path.resolve(dir, 'dist') },
});
