import { test } from "node:test";
import assert from "node:assert/strict";
import {
  declaration,
  example,
  Stack,
  Shelf,
  Switcher,
  type Composition,
} from "../documentation/components/source/composition.ts";
import {
  arrangeGroup,
  arrangementTarget,
  changedArrangements,
  restoreArrangement,
} from "../documentation/components/source/arrangement.ts";
import {
  atPath,
  groupMembers,
  ungroupMembers,
  restoreGrouping,
} from "../documentation/components/source/grouping.ts";

const initial = example("grouped");
function members(tree: Composition | undefined): readonly Composition[] {
  if (!tree || !("children" in tree)) throw new Error("Expected a group");
  return tree.children;
}
const stored = (tree: unknown): unknown => JSON.parse(JSON.stringify(tree));
/** Every name in the declaration with its path, and every string, in order. */
function written(tree: Composition) {
  const tokens = declaration(tree, "0", 0, 40).flatMap((line) => line.tokens);
  return {
    names: tokens
      .filter((token) => token.kind)
      .map((token) => `${token.path} ${token.kind}`),
    strings: tokens
      .filter((token) => token.tone === "string")
      .map((token) => token.text),
  };
}

test("a new arrangement changes one name and shares every member", () => {
  const arranged = arrangeGroup(initial, "0.0", "Shelf");
  assert.equal(atPath(arranged, "0.0")?.kind, "Shelf");
  // The members are the same objects at the same paths, in the same order.
  assert.equal(
    members(atPath(arranged, "0.0")),
    members(atPath(initial, "0.0")),
  );
  for (const path of ["0.0.0", "0.0.1", "0.0.2", "0.1", "0.1.0", "0.1.1"])
    assert.equal(atPath(arranged, path), atPath(initial, path), path);
  // In the declaration, exactly one name differs and no string does.
  const was = written(initial),
    is = written(arranged);
  assert.deepEqual(is.strings, was.strings);
  assert.deepEqual(
    is.names.filter((name, index) => name !== was.names[index]),
    ["0.0 Shelf"],
  );
  assert.equal(is.names.length, was.names.length);
  assert.equal(atPath(initial, "0.0")?.kind, "Stack", "the input is untouched");
});

test("the experiment's Switcher choice is the fixed Switcher example", () => {
  assert.deepEqual(
    arrangeGroup(initial, "0.0", "Switcher"),
    example("switcher"),
  );
});

test("root and nested groups are arranged independently", () => {
  const outer = arrangeGroup(initial, "0", "Switcher");
  assert.equal(outer.kind, "Switcher");
  assert.equal(atPath(outer, "0.0"), atPath(initial, "0.0"));
  const both = arrangeGroup(outer, "0.0", "Switcher");
  const all = arrangeGroup(both, "0.1", "Shelf");
  assert.deepEqual(
    ["0", "0.0", "0.1"].map((path) => atPath(all, path)?.kind),
    ["Switcher", "Switcher", "Shelf"],
  );
  assert.equal(atPath(all, "0.0.2"), atPath(initial, "0.0.2"));
  assert.deepEqual(written(all).strings, written(initial).strings);
});

test("choosing the current arrangement returns the same composition", () => {
  assert.equal(arrangeGroup(initial, "0.0", "Stack"), initial);
  assert.equal(arrangeGroup(initial, "0", "Stack"), initial);
  const shelf = arrangeGroup(initial, "0.0", "Shelf");
  assert.equal(arrangeGroup(shelf, "0.0", "Shelf"), shelf);
  assert.deepEqual(arrangeGroup(shelf, "0.0", "Stack"), initial);
});

test("a leaf, a stale path or several paths cannot be arranged", () => {
  const snapshot = stored(initial);
  for (const path of ["0.0.0", "0.1.1", "0.2", "0.0.3", "0.-1", "1", "", "0."])
    assert.throws(() => arrangeGroup(initial, path, "Shelf"), /Select a group/);
  assert.deepEqual(stored(initial), snapshot);

  assert.equal(arrangementTarget(initial, []), undefined);
  assert.equal(arrangementTarget(initial, ["0.0.0"]), undefined, "a leaf");
  assert.equal(arrangementTarget(initial, ["0.7"]), undefined, "stale");
  assert.equal(
    arrangementTarget(initial, ["0.0", "0.1"]),
    undefined,
    "two groups are not one target",
  );
  assert.equal(
    arrangementTarget(initial, ["0.0.0", "0.0.1"]),
    undefined,
    "members do not stand for their parent",
  );
  assert.deepEqual(arrangementTarget(initial, ["0"]), {
    path: "0",
    group: initial,
  });
  assert.equal(
    arrangementTarget(initial, ["0.1"])?.group,
    atPath(initial, "0.1"),
  );
});

test("the groups an edit rearranged can be found again", () => {
  const shelf = arrangeGroup(initial, "0.0", "Shelf");
  const both = arrangeGroup(shelf, "0", "Switcher");
  assert.deepEqual(changedArrangements(initial, initial), []);
  assert.deepEqual(changedArrangements(initial, shelf), ["0.0"]);
  assert.deepEqual(changedArrangements(both, shelf), ["0"]);
  assert.deepEqual(changedArrangements(both, initial), ["0", "0.0"]);
  // Compositions with different members are not rearrangements of each other.
  assert.deepEqual(changedArrangements(initial, example("flat")), []);
  assert.deepEqual(
    changedArrangements(initial, ungroupMembers(shelf, "0.0")),
    [],
  );
  assert.deepEqual(changedArrangements(shelf, example("shelf")), []);
});

test("stepping back through edits names the one group each step restores", () => {
  const history = [initial];
  for (const [path, kind] of [
    ["0.0", "Shelf"],
    ["0", "Switcher"],
    ["0.0", "Switcher"],
    ["0.1", "Shelf"],
  ] as const)
    history.push(arrangeGroup(history.at(-1)!, path, kind));
  const restored = [];
  while (history.length > 1) {
    const current = history.pop()!;
    const [path, ...others] = changedArrangements(current, history.at(-1)!);
    assert.deepEqual(others, []);
    const target = arrangementTarget(history.at(-1)!, [path!]);
    restored.push(`${target?.path} ${target?.group.kind}`);
  }
  assert.deepEqual(restored, [
    "0.1 Stack",
    "0.0 Shelf",
    "0 Stack",
    "0.0 Stack",
  ]);
});

test("a saved arrangement restores with the starting composition's own content", () => {
  const arranged = arrangeGroup(
    arrangeGroup(initial, "0.0", "Switcher"),
    "0",
    "Shelf",
  );
  const restored = restoreArrangement(stored(arranged), initial);
  assert.deepEqual(restored, arranged);
  assert.equal(atPath(restored!, "0.0.1"), atPath(initial, "0.0.1"));
  assert.deepEqual(restoreArrangement(stored(initial), initial), initial);
  // Only kinds are read: anything else on a saved group is dropped.
  const decorated = stored(arranged) as Record<string, unknown>;
  decorated.style = "position: fixed";
  decorated.path = "0.9";
  assert.deepEqual(restoreArrangement(decorated, initial), arranged);
});

test("saved state cannot regroup, reorder, replace or add content", () => {
  const [first, second] = members(initial) as [Composition, Composition];
  const [a, b, c] = members(first) as [Composition, Composition, Composition];
  const text = (value: string): Composition => ({ kind: "Text", text: value });
  const tampered: [string, unknown][] = [
    ["regrouped", Stack(Stack(Stack(a, b), c), second)],
    ["ungrouped", Stack(a, b, c, second)],
    ["reordered members", Stack(Shelf(b, a, c), second)],
    ["reordered groups", Stack(second, first)],
    ["changed text", Stack(Stack(a, text("Run failed"), c), second)],
    [
      "changed leaf kind",
      Stack(Stack(a, b, { kind: "Heading", text: "3 checks passed" }), second),
    ],
    ["added member", Stack(Stack(a, b, c, text("Extra")), second)],
    ["removed member", Stack(Stack(a, b), second)],
    ["added group", Stack(first, second, Stack(a, b))],
    ["group replaced by content", Stack(text("All of it"), second)],
    ["content replaced by a group", Stack(Stack(a, b, Stack(c, c)), second)],
    ["unknown arrangement", { kind: "Grid", children: [first, second] }],
    [
      "unknown nested arrangement",
      {
        kind: "Stack",
        children: [{ kind: "Text", children: [a, b, c] }, second],
      },
    ],
    ["children not a list", { kind: "Stack", children: { length: 2 } }],
    ["another exercise's content", example("event")],
    ["nothing", null],
    ["a list", [first, second]],
    ["a string", "Stack"],
  ];
  for (const [label, value] of tampered)
    assert.equal(restoreArrangement(stored(value), initial), undefined, label);
});

test("each exercise accepts only the edits it offers", () => {
  // The grouping exercises still accept Stacks alone.
  const flat = example("flat");
  const grouped = groupMembers(flat, ["0.0", "0.1"]);
  assert.deepEqual(restoreGrouping(stored(grouped), flat), grouped);
  for (const kind of ["Shelf", "Switcher"] as const) {
    assert.equal(
      restoreGrouping(stored(arrangeGroup(grouped, "0.0", kind)), flat),
      undefined,
    );
    assert.equal(
      restoreGrouping(stored(arrangeGroup(flat, "0", kind)), flat),
      undefined,
    );
  }
  // The arrangement experiment accepts kinds, never a regrouping, even one
  // that the grouping exercises would accept for the same content.
  const regrouped = groupMembers(initial, ["0.0.0", "0.0.1"]);
  assert.deepEqual(restoreGrouping(stored(regrouped), initial), regrouped);
  assert.equal(restoreArrangement(stored(regrouped), initial), undefined);
  assert.equal(
    restoreArrangement(stored(Switcher(...members(flat))), flat)?.kind,
    "Switcher",
  );
  assert.equal(restoreArrangement(stored(grouped), flat), undefined);
});
