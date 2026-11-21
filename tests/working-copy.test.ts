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
import { atPath } from "../documentation/components/source/grouping.ts";
import { chooseMember } from "../documentation/components/source/composition-editing.ts";
import {
  addText,
  beginTextEdit,
  cancelTextEdit,
  commitEdit,
  editsFor,
  editText,
  finishTextEdit,
  newText,
  releaseGroup,
  removeMember,
  restoreWorkingCopy,
  restoreWorkingTree,
  startWorkingCopy,
  typeText,
  undoEdit,
  workingCopyLimits,
  wrapMembers,
  type WorkingCopy,
} from "../documentation/components/source/working-copy.ts";

const stored = (value: unknown): unknown => JSON.parse(JSON.stringify(value));
const text = (value: string): Composition => ({ kind: "Text", text: value });
const heading = (value: string): Composition => ({
  kind: "Heading",
  text: value,
});
const [a, b, c, d] = ["a", "b", "c", "d"].map(text) as [
  Composition,
  Composition,
  Composition,
  Composition,
];
/** A saved group as storage holds it: no promise that it is a composition. */
const group = (kind: string, ...children: unknown[]) => ({ kind, children });
function at(tree: Composition, path: string): Composition {
  const node = atPath(tree, path);
  if (!node) throw new Error(`Nothing at ${path}`);
  return node;
}
const printed = (tree: Composition) =>
  declaration(tree)
    .map((line) => line.tokens.map((token) => token.text).join(""))
    .join("\n");
/** A chain of `levels` groups, the innermost empty. */
const nested = (levels: number): Composition =>
  levels === 1 ? Stack() : Stack(nested(levels - 1));

test("a working copy may hold any text, any number of members and any arrangement", () => {
  const tree = Stack(
    heading("Mine"),
    Switcher(),
    Shelf(text("only member")),
    Stack(Switcher(text(""), text("two")), Stack()),
  );
  assert.deepEqual(restoreWorkingTree(stored(tree)), tree);
  assert.deepEqual(restoreWorkingTree(stored(Stack())), Stack(), "empty root");
  // Nothing but the composition survives: the result is built afresh.
  assert.deepEqual(
    restoreWorkingTree({
      kind: "Shelf",
      text: "ignored",
      extra: true,
      children: [{ kind: "Meta", text: "m", children: [], onclick: "x" }],
    }),
    Shelf({ kind: "Meta", text: "m" }),
  );
});

test("a saved working copy is rejected unless it is a bounded composition under a root group", () => {
  for (const [saved, why] of [
    [null, "nothing saved"],
    ["Stack()", "a string"],
    [[text("a")], "an array"],
    [text("a"), "the root is content"],
    [group("Grid", a), "an unknown arrangement"],
    [group("Stack", { kind: "Image", text: "a" }), "an unknown kind"],
    [group("Stack", { kind: "Text", text: 7 }), "text that is not a string"],
    [group("Stack", { kind: "Text" }), "content without text"],
    [{ kind: "Stack" }, "a group without members"],
    [{ kind: "Stack", children: { 0: a, length: 1 } }, "members not a list"],
    [group("Stack", a, null), "a missing member"],
    [nested(workingCopyLimits.ancestors + 2), "nesting past the limit"],
    [
      Stack(...Array.from({ length: workingCopyLimits.nodes }, () => a)),
      "more nodes than the limit",
    ],
  ] as const)
    assert.equal(restoreWorkingTree(stored(saved)), undefined, why);
  assert.ok(restoreWorkingTree(nested(workingCopyLimits.ancestors + 1)));
  assert.ok(
    restoreWorkingTree(
      Stack(...Array.from({ length: workingCopyLimits.nodes - 1 }, () => a)),
    ),
  );
});

test("a saved working copy restores its composition, selection and history, each validated", () => {
  const model = Stack(Switcher(a, b), c);
  const earlier = Stack(a, b, c);
  const saved = stored({
    model,
    chosen: ["0.0"],
    undo: [
      { model: earlier, chosen: ["0.0", "0.1"] },
      { model: group("Grid", a), chosen: [] },
      { model: earlier, chosen: ["0.0", "0.2"] },
      "not an entry",
    ],
    width: 480,
  });
  assert.deepEqual(restoreWorkingCopy(saved), {
    model,
    chosen: ["0.0"],
    undo: [
      { model: earlier, chosen: ["0.0", "0.1"] },
      // Members that are not neighbors are no selection in that composition.
      { model: earlier, chosen: [] },
    ],
  });
  assert.equal(restoreWorkingCopy(stored({ model: a, undo: [] })), undefined);
  assert.equal(restoreWorkingCopy(null), undefined);
  assert.deepEqual(
    restoreWorkingCopy(stored({ model, chosen: ["0.9"], undo: "none" })),
    { model, chosen: [], undo: [] },
    "a stale selection and an unreadable history restore as none",
  );
  const long = Array.from(
    { length: workingCopyLimits.history + 5 },
    (_, i) => ({
      model: Stack(text(`${i}`)),
      chosen: [],
    }),
  );
  const restored = restoreWorkingCopy(stored({ model, undo: long }))!;
  assert.equal(restored.undo.length, workingCopyLimits.history);
  assert.deepEqual(restored.undo.at(-1), long.at(-1), "the latest are kept");
});

test("the selection decides which edits are offered", () => {
  const tree = Stack(heading("h"), Switcher(a, b), Shelf(), c);
  const offered = (chosen: readonly string[]) => {
    const edits = editsFor(tree, chosen);
    return {
      text: edits.text?.path,
      arrange: edits.arrange?.path,
      inside: edits.inside && [edits.inside.parent, edits.inside.index],
      after: edits.after && [edits.after.parent, edits.after.index],
      wrap: edits.wrap,
      release: edits.release,
      remove: edits.remove,
    };
  };
  const none = {
    text: undefined,
    arrange: undefined,
    inside: undefined,
    after: undefined,
    wrap: undefined,
    release: undefined,
    remove: undefined,
  };
  assert.deepEqual(
    offered([]),
    { ...none, inside: ["0", 4] },
    "with nothing selected, new text joins the whole composition",
  );
  assert.deepEqual(
    offered(["0"]),
    { ...none, arrange: "0", inside: ["0", 4] },
    "the root can be arranged and added to, never wrapped, released or removed",
  );
  assert.deepEqual(offered(["0.0"]), {
    ...none,
    text: "0.0",
    after: ["0", 1],
    wrap: ["0.0"],
    remove: "0.0",
  });
  assert.deepEqual(
    offered(["0.1"]),
    {
      ...none,
      arrange: "0.1",
      inside: ["0.1", 2],
      after: ["0", 2],
      wrap: ["0.1"],
      release: "0.1",
      remove: "0.1",
    },
    "an inner group is both a group and a member",
  );
  assert.deepEqual(
    offered(["0.2"]),
    {
      ...none,
      arrange: "0.2",
      inside: ["0.2", 0],
      after: ["0", 3],
      wrap: ["0.2"],
      release: "0.2",
      remove: "0.2",
    },
    "an empty group offers everything a full one does",
  );
  assert.deepEqual(
    offered(["0.2", "0.1"]),
    { ...none, after: ["0", 3], wrap: ["0.1", "0.2"] },
    "a run is wrapped in reading order and added after its last member",
  );
  assert.deepEqual(
    offered(["0.1.0", "0.1.1"]),
    { ...none, after: ["0.1", 2], wrap: ["0.1.0", "0.1.1"] },
    "every member of a group may be wrapped together",
  );
  assert.deepEqual(
    offered(["0.9"]),
    offered([]),
    "a stale path selects nothing",
  );
  assert.equal(editsFor(tree, ["0.1"]).full, false);
});

test("edits that would pass the limits are withheld, and the reason is known", () => {
  const crowded = Stack(
    Stack(a),
    ...Array.from({ length: workingCopyLimits.nodes - 3 }, () => b),
  );
  const edits = editsFor(crowded, ["0.0"]);
  assert.equal(edits.inside, undefined);
  assert.equal(edits.after, undefined);
  assert.equal(edits.wrap, undefined);
  assert.equal(edits.full, true);
  assert.equal(edits.remove, "0.0", "removing is how room is made");
  assert.equal(editsFor(crowded, ["0"]).full, true);

  // The innermost group sits at the deepest level a working copy allows.
  const deep = nested(workingCopyLimits.ancestors + 1);
  const innermost = `0${".0".repeat(workingCopyLimits.ancestors)}`;
  assert.deepEqual(at(deep, innermost), Stack());
  assert.equal(editsFor(deep, [innermost]).inside, undefined);
  assert.equal(editsFor(deep, [innermost]).wrap, undefined);
  assert.equal(editsFor(deep, [innermost]).full, true);
  assert.ok(editsFor(deep, [innermost]).after, "a sibling adds no level");
  assert.equal(
    editsFor(deep, ["0.0"]).wrap,
    undefined,
    "its subtree is too deep",
  );
  const shallower = nested(workingCopyLimits.ancestors);
  const edited = addText(
    shallower,
    editsFor(shallower, [`0${".0".repeat(workingCopyLimits.ancestors - 1)}`])
      .inside!,
  );
  assert.ok(restoreWorkingTree(stored(edited.tree)));
});

test("rewording keeps the kind, the place and everything else", () => {
  const tree = Stack(heading("Before"), Switcher(a, b));
  const next = editText(tree, "0.0", "After");
  assert.deepEqual(next, Stack(heading("After"), Switcher(a, b)));
  assert.equal(at(next, "0.1"), at(tree, "0.1"), "untouched groups are shared");
  assert.equal(editText(tree, "0.0", "Before"), tree, "nothing changed");
  assert.deepEqual(at(editText(tree, "0.1.1", ""), "0.1.1"), text(""));
  assert.throws(() => editText(tree, "0.1", "group"));
  assert.throws(() => editText(tree, "0.7", "missing"));
});

test("new text joins a group, even an empty one, or follows a member, and is selected", () => {
  const tree = Stack(Switcher(), a, Shelf(b, c));
  const inside = addText(tree, editsFor(tree, ["0.0"]).inside!);
  assert.deepEqual(inside.tree, Stack(Switcher(text(newText)), a, Shelf(b, c)));
  assert.deepEqual(inside.chosen, ["0.0.0"]);

  const after = addText(tree, editsFor(tree, ["0.1"]).after!, "next");
  assert.deepEqual(after.tree, Stack(Switcher(), a, text("next"), Shelf(b, c)));
  assert.deepEqual(after.chosen, ["0.2"]);
  assert.equal(
    at(after.tree, "0.3"),
    at(tree, "0.2"),
    "later members move along",
  );

  // After a group, as its sibling: between it and whatever follows.
  const beside = addText(tree, editsFor(tree, ["0.0"]).after!);
  assert.deepEqual(
    beside.tree,
    Stack(Switcher(), text(newText), a, Shelf(b, c)),
  );
  const end = addText(tree, editsFor(tree, []).inside!);
  assert.deepEqual(end.chosen, ["0.3"]);
  assert.deepEqual(
    addText(Stack(), editsFor(Stack(), []).inside!).tree,
    Stack(text(newText)),
    "an empty composition can be added to",
  );
  assert.throws(() => addText(tree, { parent: "0.1", index: 0 }));
  assert.throws(() => addText(tree, { parent: "0.0", index: 2 }));
});

test("removing a member never dissolves its group", () => {
  const tree = Stack(Switcher(a, b), Shelf(c), d);
  const one = removeMember(tree, "0.0.1");
  assert.deepEqual(one.tree, Stack(Switcher(a), Shelf(c), d));
  assert.deepEqual(one.chosen, ["0.0.0"], "the member before, at the end");

  const none = removeMember(one.tree, "0.0.0");
  assert.deepEqual(none.tree, Stack(Switcher(), Shelf(c), d));
  assert.deepEqual(none.chosen, ["0.0"], "the emptied group");

  const first = removeMember(tree, "0.0.0");
  assert.deepEqual(first.chosen, ["0.0.0"], "the member now in that place");
  assert.deepEqual(at(first.tree, "0.0.0"), b);

  // A group goes with everything in it; its own parent stays.
  const whole = removeMember(tree, "0.0");
  assert.deepEqual(whole.tree, Stack(Shelf(c), d));
  let tree2 = whole.tree;
  for (const path of ["0.1", "0.0"]) tree2 = removeMember(tree2, path).tree;
  assert.deepEqual(tree2, Stack(), "the root may be emptied");
  assert.deepEqual(removeMember(Stack(a), "0.0").chosen, ["0"]);
  assert.throws(() => removeMember(tree, "0"), "the root is not a member");
  assert.throws(() => removeMember(tree, "0.5"));
});

test("grouping wraps one member, a run, or every member, in place", () => {
  const tree = Stack(a, Switcher(b, c), d);
  const single = wrapMembers(tree, ["0.0"]);
  assert.deepEqual(single.tree, Stack(Stack(a), Switcher(b, c), d));
  assert.deepEqual(single.chosen, ["0.0"]);

  const run = wrapMembers(tree, ["0.2", "0.1"]);
  assert.deepEqual(run.tree, Stack(a, Stack(Switcher(b, c), d)));
  assert.deepEqual(run.chosen, ["0.1"]);
  assert.equal(
    at(run.tree, "0.1.0"),
    at(tree, "0.1"),
    "members are not copied",
  );

  const all = wrapMembers(tree, ["0.1.0", "0.1.1"]);
  assert.deepEqual(all.tree, Stack(a, Switcher(Stack(b, c)), d));
  assert.equal(
    at(all.tree, "0.1").kind,
    "Switcher",
    "the parent's arrangement stays",
  );

  assert.throws(
    () => wrapMembers(tree, ["0"]),
    "the root has no group to join",
  );
  assert.throws(() => wrapMembers(tree, ["0.0", "0.2"]), "not neighbors");
  assert.throws(() => wrapMembers(tree, []));
});

test("ungrouping returns members to the parent; an empty group simply goes", () => {
  const tree = Stack(a, Switcher(b, c), Shelf(), d);
  const released = releaseGroup(tree, "0.1");
  assert.deepEqual(released.tree, Stack(a, b, c, Shelf(), d));
  assert.deepEqual(released.chosen, ["0.1", "0.2"]);
  const empty = releaseGroup(tree, "0.2");
  assert.deepEqual(empty.tree, Stack(a, Switcher(b, c), d));
  assert.deepEqual(empty.chosen, ["0"]);
  assert.throws(() => releaseGroup(tree, "0"));
  assert.throws(() => releaseGroup(tree, "0.0"), "content has no members");
});

test("each edit is one step for Undo, which also restores the selection", () => {
  let copy = startWorkingCopy(Stack(a, b));
  assert.equal(undoEdit(copy), undefined);
  copy = { ...copy, chosen: chooseMember(copy.model, copy.chosen, "0.1") };
  const removed = removeMember(copy.model, "0.1");
  copy = commitEdit(copy, removed.tree, removed.chosen);
  const wrapped = wrapMembers(copy.model, ["0.0"]);
  copy = commitEdit(copy, wrapped.tree, wrapped.chosen);
  assert.deepEqual(copy.model, Stack(Stack(a)));
  assert.equal(copy.undo.length, 2);

  copy = undoEdit(copy)!;
  assert.deepEqual(copy.model, Stack(a));
  assert.deepEqual(copy.chosen, ["0.0"]);
  copy = undoEdit(copy)!;
  assert.deepEqual(copy.model, Stack(a, b), "the removed member is back");
  assert.deepEqual(copy.chosen, ["0.1"], "and selected, as it was");
  assert.equal(undoEdit(copy), undefined);

  // Replacing the whole composition is an edit like any other.
  const mine = commitEdit(copy, Stack(text("mine")), []);
  const replaced = commitEdit(mine, example("investigation"), []);
  assert.deepEqual(undoEdit(replaced)!.model, Stack(text("mine")));

  let long = startWorkingCopy(Stack());
  for (let i = 0; i <= workingCopyLimits.history; i++)
    long = commitEdit(long, Stack(text(`${i}`)), []);
  assert.equal(long.undo.length, workingCopyLimits.history);
  assert.deepEqual(
    long.undo[0]!.model,
    Stack(text("0")),
    "the oldest is dropped",
  );
});

test("one rewording, however many keystrokes, is one step for Undo", () => {
  const start: WorkingCopy = {
    ...startWorkingCopy(Stack(heading("Title"), a)),
    chosen: ["0.0"],
  };
  const edit = beginTextEdit(start, "0.0");
  let copy = start;
  for (const typed of ["T", "Th", "The", "The title"]) {
    copy = typeText(copy, edit, typed);
    assert.deepEqual(at(copy.model, "0.0"), heading(typed), "shown as typed");
    assert.equal(copy.undo.length, 0, "history waits");
  }
  copy = finishTextEdit(copy, edit);
  assert.equal(copy.undo.length, 1);
  const undone = undoEdit(copy)!;
  assert.deepEqual(undone.model, start.model);
  assert.deepEqual(undone.chosen, ["0.0"]);

  // Typing back to the original wording leaves nothing to undo.
  let same = typeText(start, edit, "Titles");
  same = finishTextEdit(typeText(same, edit, "Title"), edit);
  assert.equal(same.undo.length, 0);
  assert.equal(finishTextEdit(start, edit), start);

  // Escape: the text from before the edit, and earlier history untouched.
  const earlier = commitEdit(start, start.model, ["0.0"]);
  const during = typeText(earlier, beginTextEdit(earlier, "0.0"), "Abandoned");
  const cancelled = cancelTextEdit(during, beginTextEdit(earlier, "0.0"));
  assert.equal(cancelled.model, earlier.model);
  assert.deepEqual(cancelled.chosen, ["0.0"]);
  assert.equal(cancelled.undo, earlier.undo);
  assert.throws(() => beginTextEdit(start, "0"), "a group has no text");
});

test("every state an author reaches can be saved and reopened", () => {
  let copy = startWorkingCopy(restoreWorkingTree(example("investigation"))!);
  const step = (
    chosen: readonly string[],
    edit: (tree: Composition) => {
      tree: Composition;
      chosen: readonly string[];
    },
  ) => {
    copy = { ...copy, chosen };
    const edited = edit(copy.model);
    copy = commitEdit(copy, edited.tree, edited.chosen);
    assert.deepEqual(
      restoreWorkingCopy(stored(copy)),
      copy,
      printed(copy.model),
    );
  };
  step(["0.1", "0.2"], (tree) => wrapMembers(tree, ["0.1", "0.2"]));
  step(["0.1"], (tree) => addText(tree, editsFor(tree, ["0.1"]).inside!));
  for (let i = 0; i < 3; i++)
    step(["0.1.0"], (tree) => removeMember(tree, "0.1.0"));
  assert.deepEqual(at(copy.model, "0.1"), Stack(), "emptied, and still there");
  step(["0.1"], (tree) => wrapMembers(tree, ["0.1"]));
  step(["0.1.0"], (tree) => addText(tree, editsFor(tree, ["0.1.0"]).inside!));
  for (const path of ["0.4", "0.3", "0.2", "0.1", "0.0"])
    step([path], (tree) => removeMember(tree, path));
  assert.deepEqual(copy.model, Stack());
  assert.equal(copy.undo.length, 12);
});

test("the declaration names every group, including one with no members", () => {
  assert.equal(printed(Stack()), "Stack()");
  assert.equal(
    printed(Stack(Switcher(), Shelf(text("one")))),
    'Stack(\n  Switcher(),\n  Shelf(Text("one"))\n)',
  );
  const names = declaration(Stack(Switcher(), a)).flatMap((line) =>
    line.tokens.filter((token) => token.kind).map((token) => token.path),
  );
  assert.deepEqual(names, ["0", "0.0", "0.1"], "each has a name to select");
});
