import { build, context, type BuildOptions } from "esbuild";

/** A separate consumer: no dependency on the guide renderer or editor. */
export async function buildOwnedContent(watch = false) {
  const options: BuildOptions = {
    entryPoints: [
      "experiments/04-bring-your-own-content/experiment.ts",
      "experiments/04-bring-your-own-content/checks.ts",
    ],
    outdir: "documentation/bring-your-own-content",
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2024",
    minify: true,
  };
  if (watch) {
    const watcher = await context(options);
    await watcher.watch();
    return watcher;
  }
  await build(options);
  return undefined;
}
if (import.meta.main) await buildOwnedContent(process.argv.includes("--watch"));
