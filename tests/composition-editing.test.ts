import { test } from "node:test";
import assert from "node:assert/strict";
import {
  example,
  Stack,
  Shelf,
  Switcher,
  type Composition,
} from "../documentation/components/source/composition.ts";
import {
  chooseMember,
  restoreComposition,
  restoreSelection,
  selectionOf,
} from "../documentation/components/source/composition-editing.ts";
import {
  arrangeGroup,
  restoreArrangement,
} from "../documentation/components/source/arrangement.ts";
import {
  atPath,
  groupMembers,
  ungroupMembers,
  restoreGrouping,
} from "../documentation/components/source/grouping.ts";

const stored = (value: unknown): unknown => JSON.parse(JSON.stringify(value));
const text = (value: string): Composition => ({ kind: "Text", text: value });
function members(tree: Composition | undefined): readonly Composition[] {
  if (!tree || !("children" in tree)) throw new Error("Expected a group");
  return tree.children;
}
/** A saved group as storage holds it: no promise that it is a composition. */
const group = (kind: string, ...children: unknown[]) => ({ kind, children });
function run(tree: Composition, chosen: readonly string[]) {
  const selection = selectionOf(tree, chosen);
  if (selection.selected !== "members") throw new Error("Expected members");
  return selection;
}
function content(tree: Composition): Composition[] {
  return "children" in tree ? tree.children.flatMap(content) : [tree];
}
function paths(tree: Composition, path = "0"): string[] {
  return "children" in tree
    ? [
        path,
        ...tree.children.flatMap((child, index) =>
          paths(child, `${path}.${index}`),
        ),
      ]
    : [path];
}

// The investigation's facts: one flat group of six.
const initial = example("investigation");
const [finding, completed, updated, plan, approval, destination] = members(
  initial,
) as [
  Composition,
  Composition,
  Composition,
  Composition,
  Composition,
  Composition,
];
assert.equal(members(initial).length, 6);

/** Switcher(Stack(finding, Switcher(completed, updated)), Shelf(plan, approval), destination),
 * reached with the editor's own edits. */
function authored(): Composition {
  let tree = groupMembers(initial, ["0.1", "0.2"]);
  tree = arrangeGroup(tree, "0.1", "Switcher");
  tree = groupMembers(tree, ["0.0", "0.1"]);
  tree = groupMembers(tree, ["0.1", "0.2"]);
  tree = arrangeGroup(tree, "0.1", "Shelf");
  return arrangeGroup(tree, "0", "Switcher");
}

test("a saved regrouping with its arrangements restores onto the supplied content", () => {
  const tree = authored();
  assert.deepEqual(
    tree,
    Switcher(
      Stack(finding, Switcher(completed, updated)),
      Shelf(plan, approval),
      destination,
    ),
  );
  const restored = restoreComposition(stored(tree), initial);
  assert.deepEqual(restored, tree);
  // The content is the starting composition's own, in its order.
  content(restored!).forEach((leaf, index) =>
    assert.equal(leaf, content(initial)[index]),
  );
  assert.deepEqual(restoreComposition(stored(initial), initial), initial);

  // Only structure is read. Anything else a saved node carries is dropped,
  // including members attached to a piece of content.
  const decorated = stored(tree) as { children: Record<string, unknown>[] };
  Object.assign(decorated, { style: "position: fixed", path: "0.9" });
  Object.assign(decorated.children[2]!, {
    children: [stored(finding), stored(finding)],
    href: "https://example.com",
  });
  assert.deepEqual(restoreComposition(decorated, initial), tree);
});

test("saved state cannot change, reorder, drop, repeat or add content", () => {
  const first = Stack(finding, Switcher(completed, updated));
  const second = Shelf(plan, approval);
  const tampered: [string, unknown][] = [
    [
      "changed text",
      Stack(
        finding,
        text("Investigation failed"),
        updated,
        plan,
        approval,
        destination,
      ),
    ],
    [
      "changed kind",
      Stack(
        text((finding as { text: string }).text),
        completed,
        updated,
        plan,
        approval,
        destination,
      ),
    ],
    [
      "swapped neighbors",
      Stack(finding, updated, completed, plan, approval, destination),
    ],
    [
      "swapped inside a group",
      Stack(finding, Switcher(updated, completed), second, destination),
    ],
    ["swapped groups", Stack(second, first, destination)],
    [
      "moved across a boundary",
      Stack(
        Stack(finding, completed),
        Stack(plan, updated),
        approval,
        destination,
      ),
    ],
    ["dropped content", Stack(first, second)],
    [
      "dropped the first",
      Stack(completed, updated, plan, approval, destination),
    ],
    ["repeated content", Stack(first, second, destination, destination)],
    [
      "repeated in place",
      Stack(finding, completed, completed, plan, approval, destination),
    ],
    [
      "added content",
      Stack(first, second, destination, text("Open the session")),
    ],
    ["another exercise's content", example("event")],
    ["content without text", group("Stack", first, second, { kind: "Text" })],
    [
      "text that is not a string",
      group("Stack", first, second, { kind: "Text", text: 7 }),
    ],
    [
      "text held in a list",
      group("Stack", first, second, {
        kind: "Text",
        text: ["Destination: investigation session"],
      }),
    ],
  ];
  for (const [label, value] of tampered)
    assert.equal(restoreComposition(stored(value), initial), undefined, label);
});

test("saved state needs a group at its root and two members in every group", () => {
  const six = [finding, completed, updated, plan, approval, destination];
  const invalid: [string, unknown][] = [
    ["content at the root", finding],
    ["a root around one group", Stack(initial)],
    [
      "a group of one",
      Stack(Stack(finding), completed, updated, plan, approval, destination),
    ],
    [
      "a nested group of one",
      Stack(
        finding,
        Stack(Stack(completed, updated)),
        plan,
        approval,
        destination,
      ),
    ],
    ["an empty group beside the content", Stack(...six, Stack())],
    ["an empty root", Stack()],
    ["an unknown root arrangement", { kind: "Grid", children: six }],
    [
      "an unknown nested arrangement",
      group(
        "Stack",
        finding,
        group("Row", completed, updated),
        plan,
        approval,
        destination,
      ),
    ],
    [
      "a content kind holding members",
      group(
        "Stack",
        group("Text", finding, completed),
        updated,
        plan,
        approval,
        destination,
      ),
    ],
    [
      "members that are not a list",
      { kind: "Stack", children: { 0: finding, 1: completed, length: 2 } },
    ],
    ["members given as text", { kind: "Stack", children: "ab" }],
    ["a group with text for members", { kind: "Stack", text: "Stack" }],
    ["a list at the root", six],
    ["nothing", null],
    ["a name", "Stack"],
    ["a number", 6],
  ];
  for (const [label, value] of invalid)
    assert.equal(restoreComposition(stored(value), initial), undefined, label);
  assert.equal(restoreComposition(undefined, initial), undefined);
  // A single piece of content has no regrouping to restore.
  assert.equal(restoreComposition(stored(finding), finding), undefined);
  assert.equal(restoreComposition(stored(Stack(finding)), finding), undefined);
});

test("saved state is bounded in depth and size", () => {
  const facts = (count: number) =>
    Array.from({ length: count }, (_, index) => text(`Fact ${index + 1}`));
  /** `groups` groups, each inside the one before; the last holds the rest. */
  function chain(leaves: Composition[], groups: number): Composition {
    const innermost = leaves.length - groups + 1;
    let tree = Stack(...leaves.slice(-innermost));
    for (let index = leaves.length - innermost - 1; index >= 0; index--)
      tree = Stack(leaves[index]!, tree);
    return tree;
  }
  const fourteen = facts(14);
  const deepest = chain(fourteen, 12);
  assert.deepEqual(
    restoreComposition(stored(deepest), Stack(...fourteen)),
    deepest,
    "content twelve levels below the root",
  );
  assert.equal(
    restoreComposition(stored(chain(fourteen, 13)), Stack(...fourteen)),
    undefined,
    "content thirteen levels below the root",
  );

  const widest = Stack(...facts(99));
  assert.deepEqual(
    restoreComposition(stored(widest), widest),
    widest,
    "one hundred nodes",
  );
  const wider = Stack(...facts(100));
  assert.equal(
    restoreComposition(stored(wider), wider),
    undefined,
    "one hundred and one nodes",
  );

  // Reading stops at the bound, however much more the value holds.
  const endless = stored(finding);
  const children: unknown[] = Array.from({ length: 5000 }, () => endless);
  Object.defineProperty(children, 150, {
    get() {
      throw new Error("Read past the node bound");
    },
  });
  assert.equal(
    restoreComposition({ kind: "Stack", children }, initial),
    undefined,
  );
  let nested: unknown = stored(Stack(finding, completed));
  for (let depth = 0; depth < 5000; depth++)
    nested = { kind: "Stack", children: [nested, endless] };
  assert.equal(restoreComposition(nested, initial), undefined);
});

test("the combined rule is wider than the focused exercises' rules, which stay as strict", () => {
  // Whatever a focused exercise accepts, the combined rule restores the same.
  const flat = example("flat");
  const regrouped = groupMembers(flat, ["0.1", "0.2"]);
  assert.deepEqual(restoreGrouping(stored(regrouped), flat), regrouped);
  assert.deepEqual(restoreComposition(stored(regrouped), flat), regrouped);
  const grouped = example("grouped");
  const rearranged = arrangeGroup(grouped, "0.0", "Switcher");
  assert.deepEqual(restoreArrangement(stored(rearranged), grouped), rearranged);
  assert.deepEqual(restoreComposition(stored(rearranged), grouped), rearranged);

  // A state with both edits belongs to the combined exercise alone.
  const both = stored(authored());
  assert.ok(restoreComposition(both, initial));
  assert.equal(restoreGrouping(both, initial), undefined);
  assert.equal(restoreArrangement(both, initial), undefined);
  const arrangedFlat = stored(arrangeGroup(initial, "0", "Shelf"));
  assert.equal(restoreGrouping(arrangedFlat, initial), undefined);
  const regroupedOnly = stored(groupMembers(initial, ["0.3", "0.4"]));
  assert.equal(restoreArrangement(regroupedOnly, initial), undefined);
});

test("the root can be selected and arranged, alone, and never ungrouped", () => {
  assert.deepEqual(selectionOf(initial, ["0"]), {
    selected: "group",
    path: "0",
    group: initial,
    canUngroup: false,
  });
  assert.throws(() => ungroupMembers(initial, "0"), /inner group/);
  const shelf = arrangeGroup(initial, "0", "Shelf");
  assert.equal(members(shelf), members(initial));
  assert.deepEqual(restoreComposition(stored(shelf), initial), shelf);

  // The root has no neighbors: it replaces a selection and is replaced by one.
  assert.deepEqual(chooseMember(initial, [], "0"), ["0"]);
  assert.deepEqual(chooseMember(initial, ["0.2", "0.3"], "0"), ["0"]);
  assert.deepEqual(chooseMember(initial, ["0"], "0.2"), ["0.2"]);
  assert.deepEqual(chooseMember(initial, ["0"], "0"), []);
  assert.deepEqual(selectionOf(initial, ["0", "0.0"]), { selected: "nothing" });
});

test("all the members of a group can be selected, but only their group can be arranged", () => {
  let chosen: readonly string[] = [];
  for (const path of ["0.2", "0.3", "0.1", "0.4", "0.0", "0.5"])
    chosen = chooseMember(initial, chosen, path);
  assert.deepEqual(selectionOf(initial, chosen), {
    selected: "members",
    paths: ["0.0", "0.1", "0.2", "0.3", "0.4", "0.5"],
    parent: "0",
    canGroup: false,
  });
  assert.throws(() => groupMembers(initial, chosen), /all the members/);
  // Leaving one neighbor outside makes a group a reader can see.
  const fewer = chooseMember(initial, chosen, "0.5");
  assert.ok(run(initial, fewer).canGroup);

  // The same holds for a pair inside a nested group.
  const tree = authored();
  assert.deepEqual(selectionOf(tree, ["0.1.1", "0.1.0"]), {
    selected: "members",
    paths: ["0.1.0", "0.1.1"],
    parent: "0.1",
    canGroup: false,
  });
  const parent = selectionOf(tree, ["0.1"]);
  assert.equal(parent.selected, "group");
  assert.equal(parent.selected === "group" && parent.group.kind, "Shelf");
});

test("groups and content select, group and ungroup together as neighbors", () => {
  // Stack(finding, Switcher(completed, updated), plan, approval, destination)
  const tree = arrangeGroup(
    groupMembers(initial, ["0.1", "0.2"]),
    "0.1",
    "Switcher",
  );
  const inner = atPath(tree, "0.1");

  let chosen = chooseMember(tree, [], "0.1");
  assert.equal(selectionOf(tree, chosen).selected, "group");
  chosen = chooseMember(tree, chosen, "0.2");
  assert.deepEqual(selectionOf(tree, chosen), {
    selected: "members",
    paths: ["0.1", "0.2"],
    parent: "0",
    canGroup: true,
  });
  const three = chooseMember(tree, chosen, "0.0");
  assert.deepEqual(three, ["0.1", "0.2", "0.0"], "in the order chosen");
  assert.deepEqual(
    run(tree, three).paths,
    ["0.0", "0.1", "0.2"],
    "read in reading order",
  );

  // Anything that is not a neighbor starts a new selection, at any level.
  assert.deepEqual(chooseMember(tree, chosen, "0.4"), ["0.4"]);
  assert.deepEqual(chooseMember(tree, chosen, "0.1.0"), ["0.1.0"]);
  assert.deepEqual(chooseMember(tree, ["0.1.0"], "0.1"), ["0.1"]);
  assert.deepEqual(selectionOf(tree, ["0.1.0"]), {
    selected: "content",
    path: "0.1.0",
  });
  // Choosing a selected member leaves it out.
  assert.deepEqual(chooseMember(tree, three, "0.0"), ["0.1", "0.2"]);
  assert.deepEqual(chooseMember(tree, chosen, "0.1"), ["0.2"]);
  assert.deepEqual(
    chooseMember(tree, three, "0.1"),
    ["0.2"],
    "from the middle",
  );
  assert.equal(chooseMember(tree, chosen, "0.9"), chosen, "no such member");

  // The order of choosing does not matter to the group. The inner group
  // keeps its arrangement and its members; the new group is a Stack.
  const grouped = groupMembers(tree, ["0.2", "0.1"]);
  assert.equal(atPath(grouped, "0.1")?.kind, "Stack");
  assert.equal(atPath(grouped, "0.1.0"), inner);
  assert.equal(atPath(grouped, "0.1.1"), plan);
  content(grouped).forEach((leaf, index) =>
    assert.equal(leaf, content(initial)[index]),
  );
  const released = ungroupMembers(grouped, "0.1");
  assert.deepEqual(released, tree);
  assert.equal(atPath(released, "0.1"), inner);
});

test("any sequence of edits keeps the content, its order, and a restorable state", () => {
  let seed = 20261120;
  const random = (below: number) => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return Math.floor((seed / 2 ** 32) * below);
  };
  const supplied = content(initial);
  const made = { Group: 0, Ungroup: 0, Arrange: 0 };
  let deepest = 0;
  let tree = initial;
  let chosen: readonly string[] = [];
  for (let step = 0; step < 4000; step++) {
    const all = paths(tree);
    chosen = chooseMember(tree, chosen, all[random(all.length)]!);
    const selection = selectionOf(tree, chosen);
    assert.ok(
      chosen.length === 0 || selection.selected !== "nothing",
      "choosing always leaves a selection the editor can read",
    );
    if (selection.selected === "members" && selection.canGroup && random(4)) {
      tree = groupMembers(tree, chosen);
      made.Group++;
      // The new group stands where its first member stood, and can be undone
      // by hand.
      chosen = [selection.paths[0]!];
      const group = selectionOf(tree, chosen);
      assert.ok(group.selected === "group" && group.canUngroup);
      assert.equal(group.group.kind, "Stack");
    } else if (selection.selected === "group") {
      if (selection.canUngroup && random(4) === 0) {
        const count = selection.group.children.length;
        const first = Number(selection.path.split(".").at(-1));
        const parent = selection.path.slice(0, selection.path.lastIndexOf("."));
        tree = ungroupMembers(tree, selection.path);
        made.Ungroup++;
        // The released members are a run that can be grouped again.
        chosen = Array.from(
          { length: count },
          (_, index) => `${parent}.${first + index}`,
        );
        const run = selectionOf(tree, chosen);
        assert.ok(run.selected === "members" && run.canGroup);
      } else {
        const kind = (["Stack", "Shelf", "Switcher"] as const)[random(3)]!;
        const next = arrangeGroup(tree, selection.path, kind);
        if (next !== tree) made.Arrange++;
        tree = next;
        assert.deepEqual(selectionOf(tree, chosen), {
          ...selection,
          group: atPath(tree, selection.path),
        });
      }
    }
    const now = content(tree);
    assert.equal(now.length, supplied.length);
    now.forEach((leaf, index) => assert.equal(leaf, supplied[index]));
    for (const path of paths(tree)) {
      const node = atPath(tree, path)!;
      if ("children" in node) assert.ok(node.children.length >= 2, path);
      deepest = Math.max(deepest, path.split(".").length - 1);
    }
    assert.deepEqual(restoreComposition(stored(tree), initial), tree);
  }
  // The walk exercised every edit and reached the deepest nesting six facts allow.
  assert.ok(made.Group > 100 && made.Ungroup > 100 && made.Arrange > 100);
  assert.equal(deepest, 5);
});

test("Undo returns to a composition in which the edit's own selection still applies", () => {
  // Each entry is what the component keeps: the composition and selection an
  // edit was made from.
  const history: [Composition, string[]][] = [];
  let tree = initial;
  const edit = (chosen: string[], next: Composition) => {
    history.push([tree, chosen]);
    tree = next;
  };
  edit(["0.2", "0.1"], groupMembers(tree, ["0.2", "0.1"]));
  edit(["0.1"], arrangeGroup(tree, "0.1", "Switcher"));
  edit(["0.1"], ungroupMembers(tree, "0.1"));
  edit(["0"], arrangeGroup(tree, "0", "Shelf"));

  const restored = history.reverse().map(([before, chosen]) => {
    assert.deepEqual(restoreSelection(stored(chosen), before), chosen);
    const selection = selectionOf(before, chosen);
    return selection.selected === "group"
      ? `${selection.path} ${selection.group.kind}${selection.canUngroup ? ", can ungroup" : ""}`
      : selection.selected === "members"
        ? `${selection.paths.join(" ")}${selection.canGroup ? ", can group" : ""}`
        : selection.selected;
  });
  assert.deepEqual(restored, [
    "0 Stack",
    "0.1 Switcher, can ungroup",
    "0.1 Stack, can ungroup",
    "0.1 0.2, can group",
  ]);
});

test("a saved selection restores only if the reader could have made it there", () => {
  const tree = authored();
  for (const chosen of [
    [],
    ["0"],
    ["0.2"],
    ["0.0.1"],
    ["0.1", "0.0"],
    ["0.0", "0.1", "0.2"],
    ["0.0.1.0", "0.0.1.1"],
  ])
    assert.deepEqual(restoreSelection(stored(chosen), tree), chosen);

  const invalid: [string, unknown][] = [
    ["a stale member", ["0.3"]],
    ["a stale run", ["0.2", "0.3"]],
    ["members that skip a neighbor", ["0.0", "0.2"]],
    ["members of different groups", ["0.0.0", "0.1.0"]],
    ["a group and its own member", ["0.0", "0.0.0"]],
    ["the root with a member", ["0", "0.0"]],
    ["a member twice", ["0.1", "0.1"]],
    ["a path that is not canonical", ["0.01"]],
    ["a negative index", ["0.-1"]],
    ["an empty path", [""]],
    ["numbers", [0, 1]],
    ["a nested list", [["0.0"]]],
    ["a path, not a list", "0.0"],
    ["an object shaped like a list", { 0: "0.0", length: 1 }],
    ["nothing", null],
  ];
  for (const [label, value] of invalid)
    assert.deepEqual(restoreSelection(value, tree), [], label);

  // A selection belongs to one composition: valid in one, stale in another.
  assert.deepEqual(restoreSelection(["0.0.1.0"], tree), ["0.0.1.0"]);
  assert.deepEqual(restoreSelection(["0.0.1.0"], initial), []);
});
