import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  outExtension({ format }) {
    return { js: format === 'cjs' ? '.cjs.js' : '.esm.js' };
  },
  dts: true,
  sourcemap: true,
  clean: true,
  minify: true,
  treeshake: true,
  cjsInterop: true,
  splitting: true,
  external: ['react', 'react-dom'],
  esbuildOptions(options) {
    options.jsx = 'automatic';
  },
});