import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";

const root = path.resolve(import.meta.dirname, "..");

test("an independent application can import the packed adapter, types, and stylesheet", () => {
  const directory = fs.mkdtempSync(
    path.join(os.tmpdir(), "axiomatic-layout-consumer-"),
  );
  try {
    execFileSync("pnpm", ["pack", "--pack-destination", directory], {
      cwd: path.join(root, "packages/layout"),
    });
    const archive = fs
      .readdirSync(directory)
      .find((file) => file.endsWith(".tgz"));
    assert.ok(archive);
    fs.writeFileSync(
      path.join(directory, "package.json"),
      JSON.stringify({
        private: true,
        type: "module",
        dependencies: { "@design-axioms/layout": `file:${archive}` },
      }),
    );
    execFileSync("pnpm", ["install", "--offline", "--ignore-scripts"], {
      cwd: directory,
    });

    fs.writeFileSync(
      path.join(directory, "consumer.ts"),
      `
      import "@design-axioms/layout/style.css";
      import { registerAuthoredComposition } from "@design-axioms/layout";
      const actions = registerAuthoredComposition(document.body);
      actions.refresh();
      actions.dispose();
    `,
    );
    execFileSync(
      "pnpm",
      [
        "exec",
        "tsc",
        "--noEmit",
        "--strict",
        "--module",
        "NodeNext",
        "--noUncheckedSideEffectImports",
        "--target",
        "ES2024",
        "--ignoreConfig",
        path.join(directory, "consumer.ts"),
      ],
      { cwd: root },
    );

    execFileSync(
      process.execPath,
      [
        "--input-type=module",
        "--eval",
        `
      import assert from "node:assert/strict";
      import { readFileSync } from "node:fs";
      import * as layout from "@design-axioms/layout";
      assert.deepEqual(Object.keys(layout), ["registerAuthoredComposition"]);
      const css = readFileSync(new URL(import.meta.resolve("@design-axioms/layout/style.css")), "utf8");
      assert.match(css, /data-axiomatic-atom/);
      assert.match(css, /flex-direction/);
    `,
      ],
      { cwd: directory },
    );
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
