import { test } from "node:test";
import assert from "node:assert/strict";
import {
  Stack,
  Shelf,
  Switcher,
  type Composition,
} from "../documentation/components/source/composition.ts";
import { chooseMember } from "../documentation/components/source/composition-editing.ts";
import { outlineLabel } from "../documentation/components/source/outline-panel.ts";
import {
  selectionAfter,
  subjectOf,
} from "../documentation/components/source/workbench-selection.ts";
import { editsFor } from "../documentation/components/source/working-copy.ts";

const text = (value: string): Composition => ({ kind: "Text", text: value });
const [a, b, c] = ["a", "b", "c"].map(text) as [
  Composition,
  Composition,
  Composition,
];
const tree = Stack(a, b, Switcher(c, text("d")), Shelf());

test("a plain choice selects that one node, whatever was selected", () => {
  for (const chosen of [[], ["0"], ["0.0"], ["0.0", "0.1"], ["0.2.0"]])
    for (const path of ["0", "0.1", "0.2", "0.2.1", "0.3"])
      assert.deepEqual(selectionAfter(tree, chosen, path, false), [path]);
  // The lesson's rule would have built on the selection instead.
  assert.deepEqual(chooseMember(tree, ["0.0"], "0.1"), ["0.0", "0.1"]);
  // Choosing the selected node again keeps it, so the wording stays editable.
  assert.deepEqual(selectionAfter(tree, ["0.0"], "0.0", false), ["0.0"]);
  assert.ok(editsFor(tree, selectionAfter(tree, ["0.0"], "0.1", false)).text);
});

test("an extended choice builds on the selection as the lesson's rule does", () => {
  const neighbors = selectionAfter(tree, ["0.0"], "0.1", true);
  assert.deepEqual(neighbors, ["0.0", "0.1"]);
  assert.deepEqual(
    selectionAfter(tree, neighbors, "0.2", true),
    ["0.0", "0.1", "0.2"],
    "a group joins as a member",
  );
  assert.deepEqual(selectionAfter(tree, neighbors, "0.0", true), ["0.1"]);
  assert.deepEqual(
    selectionAfter(tree, ["0.0"], "0.2", true),
    ["0.2"],
    "a member that is not a neighbor starts again",
  );
  assert.deepEqual(
    selectionAfter(tree, ["0.0"], "0.2.0", true),
    ["0.2.0"],
    "so does a member of another group",
  );
  for (const [chosen, path] of [
    [["0.0"], "0.1"],
    [["0.0", "0.1"], "0.2"],
    [["0.0", "0.1"], "0.1"],
    [["0.1"], "0.3"],
  ] as const)
    if (chooseMember(tree, chosen, path).length)
      assert.deepEqual(
        selectionAfter(tree, chosen, path, true),
        chooseMember(tree, chosen, path),
      );
});

test("the workbench's selection is never empty", () => {
  // Leaving out the only selected member would leave nothing to inspect.
  assert.deepEqual(chooseMember(tree, ["0.1"], "0.1"), []);
  assert.deepEqual(selectionAfter(tree, ["0.1"], "0.1", true), ["0.1"]);
  assert.deepEqual(subjectOf([]), ["0"], "the whole composition");
  assert.deepEqual(subjectOf(["0.2", "0.3"]), ["0.2", "0.3"]);
  // A choice that names nothing changes nothing.
  for (const extend of [false, true])
    assert.deepEqual(selectionAfter(tree, ["0.1"], "0.9", extend), ["0.1"]);
  // The whole composition can be arranged and added to: a usable subject.
  const edits = editsFor(tree, subjectOf([]));
  assert.equal(edits.arrange?.path, "0");
  assert.equal(edits.inside?.parent, "0");
});

test("an outline row says in words what each node is", () => {
  assert.equal(outlineLabel(tree, true), "Whole composition");
  assert.equal(outlineLabel(Stack(), true), "Whole composition, empty");
  assert.equal(outlineLabel(Switcher(c, a), false), "2 members");
  assert.equal(outlineLabel(Stack(a), false), "1 member");
  assert.equal(outlineLabel(Shelf(), false), "Empty group");
  assert.equal(outlineLabel(text("Saturday"), false), "Saturday");
  assert.equal(outlineLabel(text(""), false), "Empty text");
});
