import { test } from "node:test";
import assert from "node:assert/strict";
import { runInNewContext } from "node:vm";
import {
  declaration,
  example,
  Stack,
  Shelf,
  Switcher,
  type Composition,
} from "../documentation/components/source/composition.ts";

function source(tree: Composition, width: number) {
  return declaration(tree, "0", 0, width)
    .map((line) => line.tokens.map((token) => token.text).join(""))
    .join("\n");
}

test("the initial lesson breaks between members instead of inside a long flat group", () => {
  assert.equal(
    source(example("flat"), 80),
    `Stack(
  Text("Execution completed"),
  Text("Run lasted 4m 1s"),
  Text("Remediation Plan proposed"),
  Text("Awaiting approval")
)`,
  );
});

test("short groups stay together and narrower panels expand them without losing selectable paths", () => {
  const tree = example("nested");
  assert.match(
    source(tree, 80),
    /  Stack\(Text\("Execution completed"\), Text\("Run lasted 4m 1s"\)\)/,
  );
  assert.match(
    source(tree, 40),
    /  Stack\(\n    Text\("Execution completed"\),/,
  );
  const names = (width: number) =>
    declaration(tree, "0", 0, width).flatMap((line) =>
      line.tokens
        .filter((token) => token.kind)
        .map((token) => [token.kind, token.path]),
    );
  assert.deepEqual(names(24), names(80));
});

test("formatting preserves the exact tree and string values across widths", () => {
  const text: Composition = {
    kind: "Text",
    text: 'A long line with "quotes", a newline\nand "); throw new Error("not code"); // 🪴',
  };
  const tree = Stack(
    example("article"),
    Shelf(text, { kind: "Meta", text: "caption" }),
  );
  const constructors = {
    Stack,
    Shelf,
    Switcher,
    Text: (text: string): Composition => ({ kind: "Text", text }),
    Heading: (text: string): Composition => ({ kind: "Heading", text }),
    Meta: (text: string): Composition => ({ kind: "Meta", text }),
  };
  for (const width of [16, 35, 80, 200]) {
    assert.deepEqual(runInNewContext(source(tree, width), constructors), tree);
  }
});
