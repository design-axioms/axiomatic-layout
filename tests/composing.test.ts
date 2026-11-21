import { test } from "node:test";
import assert from "node:assert/strict";
import {
  declaration,
  Stack,
  Shelf,
  Switcher,
  type Composition,
  type LeafKind,
  type Primitive,
} from "../documentation/components/source/composition.ts";
import {
  arrangeGroup,
  arrangements,
} from "../documentation/components/source/arrangement.ts";
import { atPath } from "../documentation/components/source/grouping.ts";
import { movesFor } from "../documentation/components/source/movement.ts";
import { spacingLevels } from "../documentation/components/source/primitives.ts";
import {
  addGroup,
  addText,
  blankComposition,
  commitEdit,
  contentKinds,
  editContentKind,
  editsFor,
  editText,
  isContentKind,
  restoreWorkingCopy,
  restoreWorkingTree,
  startWorkingCopy,
  undoEdit,
  workingCopyLimits,
  type Content,
  type Edited,
  type Insertion,
  type WorkingCopy,
} from "../documentation/components/source/working-copy.ts";

const stored = (value: unknown): unknown => JSON.parse(JSON.stringify(value));
const content = (kind: LeafKind, text: string): Content => ({ kind, text });
const text = (value: string) => content("Text", value);
const [a, b, c] = ["a", "b", "c"].map(text) as [
  Composition,
  Composition,
  Composition,
];
const to = (parent: string, index: number): Insertion => ({ parent, index });
function at(tree: Composition, path: string): Composition {
  const node = atPath(tree, path);
  if (!node) throw new Error(`Nothing at ${path}`);
  return node;
}
const printed = (tree: Composition) =>
  declaration(tree)
    .map((line) => line.tokens.map((token) => token.text).join(""))
    .join("\n");
/** A chain of `levels` Stacks, the innermost empty. */
const nested = (levels: number): Composition =>
  levels === 1 ? Stack() : Stack(nested(levels - 1));
/** A value the type system would refuse, as a control's value arrives. */
const untyped = <T>(value: string) => value as unknown as T;

test("content has one of three roles, and nothing else is one", () => {
  assert.deepEqual(contentKinds, ["Text", "Heading", "Meta"]);
  for (const kind of contentKinds) assert.equal(isContentKind(kind), true);
  for (const other of [
    ...arrangements,
    "text",
    "Title",
    "",
    7,
    null,
    undefined,
  ])
    assert.equal(isContentKind(other), false, String(other));
});

test("changing a role keeps the wording, the place and everything around it", () => {
  const update = content("Text", "Updated Nov 18, 10:34 AM");
  const inner = Shelf(update, b);
  const title = content("Heading", "Request-log queries");
  const tree = Stack(title, Switcher(a, inner), c);
  const before = stored(tree);

  const edited = editContentKind(tree, "0.1.1.0", "Meta");
  assert.deepEqual(
    edited,
    Stack(
      title,
      Switcher(a, Shelf(content("Meta", "Updated Nov 18, 10:34 AM"), b)),
      c,
    ),
  );
  // Nodes the edit did not pass through are the same objects as before.
  assert.equal(at(edited, "0.0"), title);
  assert.equal(at(edited, "0.1.0"), a);
  assert.equal(at(edited, "0.1.1.1"), b);
  assert.equal(at(edited, "0.2"), c);
  assert.deepEqual(tree, before, "the original is not rewritten");

  assert.equal(
    editContentKind(tree, "0.0", "Heading"),
    tree,
    "nothing changed",
  );
  // Through every role and back: the wording never depended on the role.
  let cycled = tree;
  for (const kind of ["Heading", "Meta", "Text"] as const) {
    cycled = editContentKind(cycled, "0.1.1.0", kind);
    assert.deepEqual(at(cycled, "0.1.1.0"), content(kind, update.text));
  }
  assert.deepEqual(cycled, tree);
  assert.deepEqual(
    at(editContentKind(Stack(text("")), "0.0", "Heading"), "0.0"),
    content("Heading", ""),
    "wording may be empty",
  );
});

test("a role belongs to content and an arrangement to a group", () => {
  const tree = Stack(a, Switcher(b, c));
  // A group has no role, and an arrangement is not one.
  assert.throws(() => editContentKind(tree, "0.1", "Heading"));
  assert.throws(() => editContentKind(tree, "0", "Text"));
  assert.throws(() => editContentKind(tree, "0.7", "Meta"), "nothing there");
  assert.throws(() => editContentKind(tree, "0.0", untyped("Stack")));
  assert.throws(() => editContentKind(tree, "0.0", untyped("Title")));
  // Content has no arrangement.
  assert.throws(() => arrangeGroup(tree, "0.0", "Shelf"));

  // Every role sits in every arrangement, and each changes without the other.
  for (const arrangement of arrangements) {
    for (const role of contentKinds) {
      const group = Stack({ kind: arrangement, children: [a, b] });
      const asRole = editContentKind(group, "0.0.0", role);
      assert.equal(at(asRole, "0.0").kind, arrangement);
      assert.equal(at(asRole, "0.0.1"), b, "its neighbor is untouched");
      for (const next of arrangements) {
        const arranged = arrangeGroup(asRole, "0.0", next);
        assert.deepEqual(at(arranged, "0.0.0"), content(role, "a"));
        assert.equal(at(arranged, "0.0.0"), at(asRole, "0.0.0"));
      }
    }
  }
});

test("a role changes nothing about grouping: spacing, selection and moves stay the same", () => {
  const tree = Stack(Stack(a, Switcher(b, c)), Shelf(a), b);
  const selections = [["0.0.0"], ["0.0.1.0"], ["0.1.0"], ["0.2"]];
  for (const role of contentKinds) {
    let roled = tree;
    for (const [path] of selections)
      roled = editContentKind(roled, path!, role);
    // Structural spacing is computed from nesting alone.
    assert.deepEqual(spacingLevels(roled), spacingLevels(tree), role);
    for (const chosen of selections) {
      const { text: was, ...before } = editsFor(tree, chosen);
      const { text: is, ...after } = editsFor(roled, chosen);
      assert.deepEqual(after, before, `${role} at ${chosen}`);
      assert.equal(is?.path, was?.path);
      assert.equal(is?.content.kind, role);
      assert.deepEqual(
        movesFor(roled, chosen)!.places.map((place) => [
          place.parent,
          place.index,
        ]),
        movesFor(tree, chosen)!.places.map((place) => [
          place.parent,
          place.index,
        ]),
      );
    }
  }
  // The declaration names the role and keeps the wording.
  assert.equal(
    printed(editContentKind(Stack(a, b), "0.1", "Meta")),
    'Stack(Text("a"), Meta("b"))',
  );
});

test("an empty group is added in place, with its arrangement, and is selected", () => {
  const tree = Stack(a, Switcher(b), Shelf());
  for (const kind of arrangements) {
    const empty: Composition = { kind, children: [] };
    const inside = addGroup(tree, to("0.2", 0), kind);
    assert.deepEqual(inside.tree, Stack(a, Switcher(b), Shelf(empty)));
    assert.deepEqual(inside.chosen, ["0.2.0"]);

    const between = addGroup(tree, to("0", 1), kind);
    assert.deepEqual(between.tree, Stack(a, empty, Switcher(b), Shelf()));
    assert.deepEqual(between.chosen, ["0.1"]);
    assert.equal(at(between.tree, "0.0"), a);
    assert.equal(
      at(between.tree, "0.2"),
      at(tree, "0.1"),
      "moved along, intact",
    );

    const first = addGroup(tree, to("0.1", 0), kind);
    assert.deepEqual(first.tree, Stack(a, Switcher(empty, b), Shelf()));
    assert.equal(
      at(first.tree, "0.1").kind,
      "Switcher",
      "its parent is unchanged",
    );

    assert.deepEqual(addGroup(Stack(), to("0", 0), kind).tree, Stack(empty));
    assert.deepEqual(restoreWorkingTree(stored(inside.tree)), inside.tree);
  }
  assert.deepEqual(tree, Stack(a, Switcher(b), Shelf()), "the original stays");
});

test("a new empty group is an authored group: it can be filled, arranged, removed or left empty", () => {
  const added = addGroup(Stack(a), to("0", 1), "Switcher");
  const edits = editsFor(added.tree, added.chosen);
  assert.deepEqual(edits.arrange, { path: "0.1", group: Switcher() });
  assert.deepEqual(edits.inside && [edits.inside.parent, edits.inside.index], [
    "0.1",
    0,
  ]);
  assert.equal(edits.remove, "0.1");
  assert.equal(edits.text, undefined, "a group has no wording or role");

  const filled = addText(added.tree, edits.inside!, "first");
  assert.deepEqual(filled.tree, Stack(a, Switcher(text("first"))));
  assert.deepEqual(filled.chosen, ["0.1.0"]);
  // A group can hold a group before either holds any content.
  const nestedGroup = addGroup(added.tree, edits.inside!, "Shelf");
  assert.deepEqual(nestedGroup.tree, Stack(a, Switcher(Shelf())));
  assert.deepEqual(
    arrangeGroup(added.tree, "0.1", "Stack"),
    Stack(a, Stack()),
    "arranged while empty",
  );
  // Left alone, it is saved and reopened as it is.
  assert.deepEqual(restoreWorkingTree(stored(added.tree)), added.tree);
});

test("a new member is refused where there is no such place or arrangement", () => {
  const tree = Stack(a, Switcher(b));
  const before = stored(tree);
  for (const [place, why] of [
    [to("0.0", 0), "content has no members"],
    [to("0.9", 0), "no such group"],
    [to("", 0), "no group at all"],
    [to("0.1", 2), "past the end"],
    [to("0", -1), "before the start"],
    [to("0", 0.5), "between positions"],
    [to("0", Number.NaN), "not a position"],
  ] as const) {
    assert.throws(() => addGroup(tree, place, "Stack"), why);
    assert.throws(() => addText(tree, place), why);
  }
  assert.throws(() => addGroup(tree, to("0", 0), untyped<Primitive>("Grid")));
  assert.throws(
    () => addGroup(tree, to("0", 0), untyped<Primitive>("Text")),
    "a role is not an arrangement",
  );
  assert.deepEqual(stored(tree), before, "a refused edit leaves no trace");
});

test("a new member is offered and accepted only within the size and nesting limits", () => {
  const { nodes, ancestors } = workingCopyLimits;
  const offered = (tree: Composition, chosen: readonly string[]) => {
    const edits = editsFor(tree, chosen);
    return [edits.inside, edits.after].filter((place) => place !== undefined);
  };
  /** Wherever a place is offered, content and an empty group both fit. */
  const accepts = (tree: Composition, chosen: readonly string[]) => {
    for (const place of offered(tree, chosen)) {
      for (const edited of [
        addText(tree, place),
        addGroup(tree, place, "Switcher"),
      ])
        assert.deepEqual(restoreWorkingTree(stored(edited.tree)), edited.tree);
    }
    return offered(tree, chosen).length;
  };

  // One node of room left, then none.
  const roomy = Stack(...Array.from({ length: nodes - 2 }, () => a));
  assert.equal(accepts(roomy, ["0"]), 1);
  assert.equal(accepts(roomy, ["0.0"]), 1);
  const full = addGroup(roomy, to("0", 0), "Shelf").tree;
  assert.equal(editsFor(full, ["0"]).full, true);
  assert.deepEqual(offered(full, ["0"]), []);
  assert.deepEqual(
    offered(full, ["0.0"]),
    [],
    "not inside or after the new group",
  );
  assert.throws(() => addGroup(full, to("0", 0), "Stack"));
  assert.throws(() => addText(full, to("0.0", 0)));

  // The innermost group has one level left below it, then none.
  const deep = nested(ancestors);
  const innermost = `0${".0".repeat(ancestors - 1)}`;
  assert.deepEqual(at(deep, innermost), Stack());
  assert.equal(accepts(deep, [innermost]), 2, "inside it and after it");
  const deepest = addGroup(deep, to(innermost, 0), "Switcher");
  assert.deepEqual(at(deepest.tree, deepest.chosen[0]!), Switcher());
  const edits = editsFor(deepest.tree, deepest.chosen);
  assert.equal(
    edits.inside,
    undefined,
    "nothing fits inside the deepest group",
  );
  assert.equal(edits.full, true);
  assert.throws(() =>
    addGroup(deepest.tree, to(deepest.chosen[0]!, 0), "Stack"),
  );
  assert.throws(() => addText(deepest.tree, to(deepest.chosen[0]!, 0)));
  // Beside it adds no level.
  assert.equal(accepts(deepest.tree, deepest.chosen), 1);
});

test("a blank start is an empty Stack with the whole composition selected", () => {
  const tree = Stack(content("Heading", "Title"), Switcher(a, b));
  const blank = blankComposition(tree);
  assert.deepEqual(blank, { tree: Stack(), chosen: ["0"] });
  assert.deepEqual(tree, Stack(content("Heading", "Title"), Switcher(a, b)));
  // Another arrangement's empty root is still replaced by a Stack.
  assert.deepEqual(blankComposition(Switcher()).tree, Stack());
  // Already blank: the same composition, so there is nothing to commit.
  const empty = Stack();
  assert.equal(blankComposition(empty).tree, empty);
  assert.deepEqual(blankComposition(empty).chosen, ["0"]);

  const edits = editsFor(blank.tree, blank.chosen);
  assert.deepEqual(
    edits.inside && [edits.inside.parent, edits.inside.index],
    ["0", 0],
    "ready to be added to",
  );
  assert.deepEqual(edits.arrange, { path: "0", group: Stack() });
  for (const edit of ["text", "after", "wrap", "release", "remove"] as const)
    assert.equal(edits[edit], undefined, edit);
  assert.equal(movesFor(blank.tree, blank.chosen), undefined);
});

test("starting over is one step for Undo, which restores the composition and its selection", () => {
  const model = Stack(content("Heading", "Title"), Switcher(a, b), c);
  const earlier = Stack(a);
  const before: WorkingCopy = {
    model,
    chosen: ["0.1.1", "0.1.0"],
    undo: [{ model: earlier, chosen: ["0.0"] }],
  };
  const blank = blankComposition(before.model);
  const after = commitEdit(before, blank.tree, blank.chosen);
  assert.deepEqual(after.model, Stack());
  assert.deepEqual(after.chosen, ["0"]);
  assert.equal(after.undo.length, 2);
  assert.deepEqual(
    restoreWorkingCopy(stored(after)),
    after,
    "saved and reopened",
  );

  const undone = undoEdit(after)!;
  assert.equal(undone.model, model, "the composition that was replaced");
  assert.deepEqual(undone.chosen, ["0.1.1", "0.1.0"], "and its selection");
  assert.deepEqual(undone.undo, before.undo, "earlier history is intact");
  // Reopened from storage, Undo still restores it.
  const reopened = undoEdit(restoreWorkingCopy(stored(after))!)!;
  assert.deepEqual(reopened.model, model);
  assert.deepEqual(reopened.chosen, ["0.1.1", "0.1.0"]);

  // The first blank start has nothing before it.
  const first: WorkingCopy = { ...startWorkingCopy(Stack()), chosen: ["0"] };
  assert.deepEqual(restoreWorkingCopy(stored(first)), first);
  assert.equal(undoEdit(first), undefined);
});

test("an edit that changes nothing returns the same composition, so a caller commits nothing", () => {
  const model = Stack(content("Meta", "aside"));
  const copy: WorkingCopy = { ...startWorkingCopy(model), chosen: ["0.0"] };
  /** How a caller applies an edit: only a changed composition is history. */
  const apply = (from: WorkingCopy, edited: Edited) =>
    edited.tree === from.model
      ? from
      : commitEdit(from, edited.tree, edited.chosen);

  const sameRole = editContentKind(copy.model, "0.0", "Meta");
  assert.equal(apply(copy, { tree: sameRole, chosen: ["0.0"] }), copy);
  const blank = apply(copy, blankComposition(copy.model));
  assert.equal(blank.undo.length, 1);
  assert.equal(apply(blank, blankComposition(blank.model)), blank);
  assert.equal(blank.undo.length, 1, "blank again is not a second step");
});

test("a composition can be built from nothing, and every step can be saved and undone", () => {
  let copy: WorkingCopy = { ...startWorkingCopy(Stack()), chosen: ["0"] };
  let steps = 0;
  const step = (
    edit: (tree: Composition, edits: ReturnType<typeof editsFor>) => Edited,
  ) => {
    const edited = edit(copy.model, editsFor(copy.model, copy.chosen));
    assert.notEqual(edited.tree, copy.model);
    copy = commitEdit(copy, edited.tree, edited.chosen);
    steps++;
    assert.deepEqual(
      restoreWorkingCopy(stored(copy)),
      copy,
      printed(copy.model),
    );
  };
  const reword = (wording: string) =>
    step((tree) => ({
      tree: editText(tree, copy.chosen[0]!, wording),
      chosen: copy.chosen,
    }));
  const role = (kind: LeafKind) =>
    step((tree) => ({
      tree: editContentKind(tree, copy.chosen[0]!, kind),
      chosen: copy.chosen,
    }));

  step((tree, edits) => addText(tree, edits.inside!));
  reword("Order shipped");
  role("Heading");
  step((tree, edits) => addGroup(tree, edits.after!, "Switcher"));
  step((tree, edits) => addText(tree, edits.inside!));
  reword("Arrives Thursday");
  step((tree, edits) => addText(tree, edits.after!));
  reword("Updated 9:14 am");
  role("Meta");
  copy = { ...copy, chosen: ["0"] };
  step((tree, edits) => addGroup(tree, edits.inside!, "Shelf"));

  assert.deepEqual(
    copy.model,
    Stack(
      content("Heading", "Order shipped"),
      Switcher(text("Arrives Thursday"), content("Meta", "Updated 9:14 am")),
      Shelf(),
    ),
  );
  assert.deepEqual(copy.chosen, ["0.2"], "the group just added");
  for (let undone = 0; undone < steps; undone++) copy = undoEdit(copy)!;
  assert.deepEqual(copy.model, Stack());
  assert.deepEqual(copy.chosen, ["0"]);
  assert.equal(undoEdit(copy), undefined);
});
