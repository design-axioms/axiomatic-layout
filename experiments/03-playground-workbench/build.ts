import { build } from "esbuild";
import { mkdir, copyFile } from "node:fs/promises";
await mkdir(".local/workbench-site", { recursive: true });
await copyFile(
  "experiments/03-playground-workbench/index.html",
  ".local/workbench-site/index.html",
);
await build({
  entryPoints: ["experiments/03-playground-workbench/workbench.ts"],
  outfile: ".local/workbench-site/workbench.js",
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2024",
  loader: { ".css": "text" },
});
