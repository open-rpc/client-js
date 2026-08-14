#!/usr/bin/env bun
import { $ } from "bun";

const baseConfig = {
  entrypoints: ["./src/index.ts"],
  sourcemap: "external",
  minify: false,
  splitting: false,
};


await Bun.build({
  ...baseConfig,
  // StdioTransport is node-only; split so it shares chunks with the main
  // bundle instead of duplicating Transport/TransportRequestManager.
  entrypoints: ["./src/index.ts", "./src/stdio.ts"],
  splitting: true,
  outdir: "./dist",
  target: "node",
  format: "esm",
  external: ["ws", "isomorphic-ws"],
});

await Bun.build({
  ...baseConfig,
  outdir: "./dist/browser",
  target: "browser",
  format: "esm",
});