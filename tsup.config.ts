import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "src/index.ts" },
  format: ["esm", "cjs"],
  dts: true,
  target: "es2022",
  clean: true,
  treeshake: true,
  sourcemap: true,
  external: ["react", "react-dom", "react/jsx-runtime"],
  tsconfig: "tsconfig.build.json",
  esbuildOptions(options) {
    options.jsx = "automatic";
  },
});
