import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { buildComponents } from "./build-components.ts";

const watcher = await buildComponents(true);
const require = createRequire(import.meta.url);
const reader = join(
  dirname(require.resolve("ts-docs-fresh/package.json")),
  "dist/cli.js",
);
const child = spawn(process.execPath, [reader, "dev", ".", "--port", "4326"], {
  stdio: "inherit",
});
let closing = false;
async function close() {
  if (closing) return;
  closing = true;
  child.kill("SIGTERM");
  await watcher?.dispose();
}
process.once("SIGINT", () => void close());
process.once("SIGTERM", () => void close());
child.once("exit", (code) => {
  void close().then(() => {
    process.exitCode = code ?? 0;
  });
});
