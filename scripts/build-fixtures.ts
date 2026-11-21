import { readdir, access } from "node:fs/promises";
import { join } from "node:path";
import { build } from "esbuild";

const root = "documentation/review";
const entries: string[] = [];
for (const directory of await readdir(root, { withFileTypes: true })) {
  if (!directory.isDirectory() || !directory.name.endsWith("-fixtures"))
    continue;
  const source = join(root, directory.name, "fixture.ts");
  try {
    await access(source);
    entries.push(source);
  } catch {
    // Some evidence directories contain observations only.
  }
}
await build({
  entryPoints: entries,
  outbase: root,
  outdir: root,
  bundle: true,
  format: "esm",
  platform: "browser",
  target: "es2024",
  loader: { ".css": "text" },
});
console.log(`Built ${entries.length} browser fixtures.`);
