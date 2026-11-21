import { writeFile, readdir, readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { build, context } from "esbuild";
import type { BuildOptions } from "esbuild";
import { compositionTokens } from "./composition-theme.ts";

export async function buildComponents(watch = false) {
  const sample = compositionTokens('Stack(Text("content"))')[0]!;
  const primitive = sample.find((token) => token.content === "Stack")!;
  const string = sample.find((token) => token.content.includes("content"))!;
  const rule = (name: string, token: typeof primitive) =>
    `.token.${name}{--shiki-light:${token.variants.light!.color};--shiki-dark:${token.variants.dark!.color}}`;
  await writeFile(
    "documentation/components/source/composition-palette.generated.css",
    "/* Generated from reader-compatible Shiki GitHub themes. */\n" +
      rule("primitive", primitive) +
      "\n" +
      rule("string", string) +
      "\n",
  );
  const options: BuildOptions = {
    entryPoints: ["documentation/components/source/layout-examples.ts"],
    outfile: "documentation/components/layout-examples.js",
    bundle: true,
    format: "esm",
    platform: "browser",
    target: "es2024",
    minify: true,
    legalComments: "linked",
    loader: { ".css": "text" },
    plugins: [
      {
        name: "component-revision",
        setup(builder) {
          builder.onResolve({ filter: /^axiomatic:revision$/ }, () => ({
            path: "revision",
            namespace: "axiomatic",
          }));
          builder.onLoad({ filter: /.*/, namespace: "axiomatic" }, async () => {
            const dir = "documentation/components/source";
            const names = (await readdir(dir)).sort();
            const hash = createHash("sha256");
            for (const name of names) {
              hash.update(name);
              hash.update(await readFile(`${dir}/${name}`));
            }
            const marker = `axiomatic-revision:${hash.digest("hex").slice(0, 16)}`;
            return {
              contents: `export const revision=${JSON.stringify(marker)};`,
              loader: "js",
              watchFiles: names.map((name) => `${dir}/${name}`),
              watchDirs: [dir],
            };
          });
        },
      },
    ],
  };
  if (watch) {
    const watcher = await context(options);
    await watcher.watch();
    return watcher;
  }
  await build(options);
  return undefined;
}
if (import.meta.main) await buildComponents(process.argv.includes("--watch"));
