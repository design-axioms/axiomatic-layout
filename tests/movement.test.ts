import { test } from "node:test";
import assert from "node:assert/strict";
import {
  Stack,
  Shelf,
  Switcher,
  type Composition,
} from "../documentation/components/source/composition.ts";
import {
  atPath,
  parentPath,
} from "../documentation/components/source/grouping.ts";
import {
  moveMembers,
  moveObstacle,
  movesFor,
  placeAfter,
  placeAtEnd,
  placeAtStart,
  placeBefore,
} from "../documentation/components/source/movement.ts";
import {
  commitEdit,
  removeMember,
  restoreWorkingCopy,
  restoreWorkingTree,
  startWorkingCopy,
  undoEdit,
  workingCopyLimits,
  type Insertion,
  type WorkingCopy,
} from "../documentation/components/source/working-copy.ts";

const stored = (value: unknown): unknown => JSON.parse(JSON.stringify(value));
const text = (value: string): Composition => ({ kind: "Text", text: value });
const heading: Composition = { kind: "Heading", text: "Title" };
const meta: Composition = { kind: "Meta", text: "aside" };
const [a, b, c, d] = ["a", "b", "c", "d"].map(text) as [
  Composition,
  Composition,
  Composition,
  Composition,
];
function at(tree: Composition, path: string): Composition {
  const node = atPath(tree, path);
  if (!node) throw new Error(`Nothing at ${path}`);
  return node;
}
const to = (parent: string, index: number): Insertion => ({ parent, index });
/** Every path below the root, in reading order. */
function memberPaths(tree: Composition, path = "0"): string[] {
  return "children" in tree
    ? tree.children.flatMap((child, index) => [
        `${path}.${index}`,
        ...memberPaths(child, `${path}.${index}`),
      ])
    : [];
}
/** Every place among the members of every group. */
function everyPlace(tree: Composition, path = "0"): Insertion[] {
  return "children" in tree
    ? [
        ...Array.from({ length: tree.children.length + 1 }, (_, index) =>
          to(path, index),
        ),
        ...tree.children.flatMap((child, index) =>
          everyPlace(child, `${path}.${index}`),
        ),
      ]
    : [];
}
/** The composition with a run of neighbors taken out. */
function without(tree: Composition, run: readonly string[]): Composition {
  const position = (path: string) => Number(path.split(".").at(-1));
  // Last first, so each removal leaves the earlier paths as they were.
  return [...run]
    .sort((x, y) => position(y) - position(x))
    .reduce((rest, path) => removeMember(rest, path).tree, tree);
}
/** A Stack whose innermost Stack, holding `inner`, has `ancestors` groups above it. */
const chain = (ancestors: number, ...inner: Composition[]): Composition =>
  ancestors === 0 ? Stack(...inner) : Stack(chain(ancestors - 1, ...inner));

test("a member moves to another group, whichever of the two comes first", () => {
  const tree = Stack(Switcher(a, b), Shelf(c));
  const later = moveMembers(tree, ["0.0.0"], to("0.1", 1));
  assert.deepEqual(later.tree, Stack(Switcher(b), Shelf(c, a)));
  assert.deepEqual(later.chosen, ["0.1.1"]);
  assert.equal(later.from, "0.0");

  const earlier = moveMembers(tree, ["0.1.0"], to("0.0", 1));
  assert.deepEqual(earlier.tree, Stack(Switcher(a, c, b), Shelf()));
  assert.deepEqual(earlier.chosen, ["0.0.1"]);
  assert.equal(earlier.from, "0.1");
  assert.deepEqual(tree, Stack(Switcher(a, b), Shelf(c)), "the original stays");
});

test("a place stated before the move is found again after the members leave", () => {
  // The receiving group stands after the member in the same parent, so its
  // own path closes up by one.
  const sibling = Stack(a, Stack(b), Shelf(c));
  const first = moveMembers(sibling, ["0.0"], to("0.2", 0));
  assert.deepEqual(first.tree, Stack(Stack(b), Shelf(a, c)));
  assert.deepEqual(first.chosen, ["0.1.0"]);

  // The same, with the receiving group nested inside that later sibling.
  const nested = Stack(a, b, Switcher(Stack(c), Shelf(d)));
  const second = moveMembers(nested, ["0.0", "0.1"], to("0.2.1", 1));
  assert.deepEqual(second.tree, Stack(Switcher(Stack(c), Shelf(d, a, b))));
  assert.deepEqual(second.chosen, ["0.0.1.1", "0.0.1.2"]);

  // A group before the member, or in another branch, keeps its path.
  const before = Stack(Stack(b), a, Stack(Shelf(c)));
  assert.deepEqual(moveMembers(before, ["0.1"], to("0.0", 0)).chosen, [
    "0.0.0",
  ]);
  const branches = Stack(Stack(a, b), Stack(Shelf(c)));
  const third = moveMembers(branches, ["0.0.0"], to("0.1.0", 0));
  assert.deepEqual(third.tree, Stack(Stack(b), Stack(Shelf(a, c))));
  assert.deepEqual(third.chosen, ["0.1.0.0"]);
});

test("a member moves out to an enclosing group, before or after the group it left", () => {
  const tree = Stack(a, Switcher(b, c));
  const after = moveMembers(tree, ["0.1.1"], to("0", 2));
  assert.deepEqual(after.tree, Stack(a, Switcher(b), c));
  assert.deepEqual(after.chosen, ["0.2"]);
  assert.equal(after.from, "0.1");

  // Arriving ahead of the group it left moves that group along.
  const ahead = moveMembers(tree, ["0.1.1"], to("0", 0));
  assert.deepEqual(ahead.tree, Stack(c, a, Switcher(b)));
  assert.deepEqual(ahead.chosen, ["0.0"]);
  assert.equal(ahead.from, "0.2");
  assert.deepEqual(at(ahead.tree, ahead.from), Switcher(b), "one member left");

  const emptied = moveMembers(Stack(Stack(Shelf(a))), ["0.0.0.0"], to("0", 0));
  assert.deepEqual(emptied.tree, Stack(a, Stack(Shelf())));
  assert.equal(emptied.from, "0.1.0");
  assert.deepEqual(
    at(emptied.tree, emptied.from),
    Shelf(),
    "the emptied group keeps its arrangement and its place",
  );
});

test("a member moves into a more deeply nested group, even an empty one", () => {
  const tree = Stack(a, Stack(Shelf(b), Switcher()));
  const deeper = moveMembers(tree, ["0.0"], to("0.1.0", 1));
  assert.deepEqual(deeper.tree, Stack(Stack(Shelf(b, a), Switcher())));
  assert.deepEqual(deeper.chosen, ["0.0.0.1"]);
  const empty = moveMembers(tree, ["0.0"], to("0.1.1", 0));
  assert.deepEqual(empty.tree, Stack(Stack(Shelf(b), Switcher(a))));
  assert.deepEqual(empty.chosen, ["0.0.1.0"]);
});

test("what moves is intact, and what it does not pass through is untouched", () => {
  const inner = Shelf(meta, a);
  const moving = Switcher(heading, inner);
  const bystander = Stack(b, Shelf(c));
  const tree = Stack(Stack(moving, d), Stack(), bystander);
  const moved = moveMembers(tree, ["0.0.0"], to("0.1", 0));
  assert.deepEqual(
    moved.tree,
    Stack(Stack(d), Stack(Switcher(heading, Shelf(meta, a))), bystander),
  );
  // The same objects, not copies: arrangement, members, kinds and wording.
  assert.equal(at(moved.tree, moved.chosen[0]!), moving);
  assert.equal(at(moved.tree, "0.1.0.1"), inner);
  assert.equal(at(moved.tree, "0.1.0.0"), heading);
  assert.equal(at(moved.tree, "0.2"), bystander);
  assert.equal(at(moved.tree, "0.0.0"), d);
  // The groups it left and joined keep their own arrangements.
  const kinds = Stack(Switcher(a, b), Shelf(c));
  const joined = moveMembers(kinds, ["0.0.1"], to("0.1", 0)).tree;
  assert.equal(at(joined, "0.0").kind, "Switcher");
  assert.equal(at(joined, "0.1").kind, "Shelf");
});

test("a member changes its place among the same neighbors, in either direction", () => {
  const tree = Switcher(a, b, c, d);
  const last = moveMembers(tree, ["0.1"], to("0", 4));
  assert.deepEqual(last.tree, Switcher(a, c, d, b));
  assert.deepEqual(last.chosen, ["0.3"]);
  assert.equal(last.from, "0");

  const first = moveMembers(tree, ["0.2"], to("0", 0));
  assert.deepEqual(first.tree, Switcher(c, a, b, d));
  assert.deepEqual(first.chosen, ["0.0"]);

  // The place between c and d, stated before b leaves.
  const between = moveMembers(tree, ["0.1"], to("0", 3));
  assert.deepEqual(between.tree, Switcher(a, c, b, d));
  assert.deepEqual(between.chosen, ["0.2"]);
});

test("a run of neighbors moves as one, in reading order", () => {
  const tree = Stack(a, b, c, Shelf(d));
  // Chosen out of order, as a selection can be.
  const within = moveMembers(tree, ["0.2", "0.1"], to("0", 0));
  assert.deepEqual(within.tree, Stack(b, c, a, Shelf(d)));
  assert.deepEqual(within.chosen, ["0.0", "0.1"]);

  const across = moveMembers(tree, ["0.1", "0.0"], to("0.3", 0));
  assert.deepEqual(across.tree, Stack(c, Shelf(a, b, d)));
  assert.deepEqual(across.chosen, ["0.1.0", "0.1.1"]);

  const all = moveMembers(Stack(Switcher(a, b), Stack()), ["0.0.0", "0.0.1"], {
    parent: "0.1",
    index: 0,
  });
  assert.deepEqual(all.tree, Stack(Switcher(), Stack(a, b)));
  assert.equal(all.from, "0.0");
});

test("moving members to where they already are changes nothing", () => {
  const tree = Stack(a, b, c, d);
  // Before the run, between its members, and after it.
  for (const index of [1, 2, 3]) {
    assert.equal(
      moveObstacle(tree, ["0.1", "0.2"], to("0", index)),
      "already-there",
    );
    const moved = moveMembers(tree, ["0.2", "0.1"], to("0", index));
    assert.equal(moved.tree, tree, "the same composition, not a copy");
    assert.deepEqual(moved.chosen, ["0.1", "0.2"]);
    assert.equal(moved.from, "0");
  }
  for (const index of [0, 4])
    assert.equal(moveObstacle(tree, ["0.1", "0.2"], to("0", index)), undefined);
  const only = Stack(Switcher(a));
  assert.equal(moveMembers(only, ["0.0.0"], to("0.0", 1)).tree, only);
});

test("a move that cannot happen is refused with its reason", () => {
  const tree = Stack(a, Switcher(b, Stack(c)), d);
  const before = stored(tree);
  for (const [members, place, reason] of [
    [["0"], to("0", 0), "root"],
    [["0", "0.0"], to("0.1", 0), "root"],
    [[], to("0", 0), "not-members"],
    [["0.0", "0.2"], to("0.1", 0), "not-members"],
    [["0.0", "0.0"], to("0.1", 0), "not-members"],
    [["0.0", "0.1.0"], to("0", 3), "not-members"],
    [["0.7"], to("0", 0), "not-members"],
    [["0.1"], to("0.1", 0), "inside-itself"],
    [["0.1"], to("0.1.1", 1), "inside-itself"],
    [["0.0", "0.1"], to("0.1.1", 0), "inside-itself"],
    [["0.0"], to("0.2", 0), "not-a-place"],
    [["0.0"], to("0.9", 0), "not-a-place"],
    [["0.0"], to("", 0), "not-a-place"],
    [["0.0"], to("0.1", 3), "not-a-place"],
    [["0.0"], to("0.1", -1), "not-a-place"],
    [["0.0"], to("0.1", 0.5), "not-a-place"],
    [["0.0"], to("0.1", Number.NaN), "not-a-place"],
  ] as const) {
    assert.equal(moveObstacle(tree, members, place), reason);
    assert.throws(() => moveMembers(tree, members, place));
  }
  assert.deepEqual(stored(tree), before, "a refused move leaves no trace");
});

test("members move only where nothing would be nested past the limit", () => {
  const deepest = workingCopyLimits.ancestors;
  // The innermost Stack has one group fewer above it than text may have.
  const tree = Stack(chain(deepest - 2), a, Stack(b));
  const innermost = `0.0${".0".repeat(deepest - 2)}`;
  assert.deepEqual(at(tree, innermost), Stack());
  const above = innermost.slice(0, -2);

  const moved = moveMembers(tree, ["0.1"], to(innermost, 0));
  assert.equal(at(moved.tree, moved.chosen[0]!), a);
  assert.deepEqual(restoreWorkingTree(stored(moved.tree)), moved.tree);

  // A group brings its own levels with it.
  assert.equal(moveObstacle(tree, ["0.2"], to(innermost, 0)), "too-deep");
  assert.throws(() => moveMembers(tree, ["0.2"], to(innermost, 0)));
  assert.equal(
    moveObstacle(tree, ["0.1", "0.2"], to(innermost, 0)),
    "too-deep",
  );
  const higher = moveMembers(tree, ["0.2"], to(above, 0));
  assert.deepEqual(restoreWorkingTree(stored(higher.tree)), higher.tree);

  assert.equal(movesFor(tree, ["0.2"])!.limited, true);
  assert.ok(
    movesFor(tree, ["0.2"])!.places.every(
      (place) => place.parent !== innermost,
    ),
  );
  assert.equal(movesFor(tree, ["0.1"])!.limited, false);

  // At the limit, reading order can still change.
  const full = Stack(chain(deepest - 2, a, b));
  const reordered = moveMembers(full, [`${innermost}.0`], to(innermost, 2));
  assert.deepEqual(at(reordered.tree, innermost), Stack(b, a));
});

test("a selection's places are listed in reading order, split around where it is", () => {
  const tree = Stack(a, Switcher(b, c), Shelf(), d);
  const listed = (chosen: readonly string[]) => {
    const moves = movesFor(tree, chosen)!;
    return {
      members: moves.members,
      places: moves.places.map((place) => [place.parent, place.index]),
      earlier: moves.earlier,
    };
  };
  assert.deepEqual(listed(["0.0"]), {
    members: ["0.0"],
    places: [
      ["0.1", 0],
      ["0.1", 1],
      ["0.1", 2],
      ["0", 2],
      ["0.2", 0],
      ["0", 3],
      ["0", 4],
    ],
    earlier: 0,
  });
  assert.deepEqual(
    listed(["0.1"]),
    {
      members: ["0.1"],
      places: [
        ["0", 0],
        ["0.2", 0],
        ["0", 3],
        ["0", 4],
      ],
      earlier: 1,
    },
    "a group has no place inside itself",
  );
  assert.deepEqual(listed(["0.1.1"]), {
    members: ["0.1.1"],
    places: [
      ["0", 0],
      ["0", 1],
      ["0.1", 0],
      ["0", 2],
      ["0.2", 0],
      ["0", 3],
      ["0", 4],
    ],
    earlier: 3,
  });
  assert.deepEqual(listed(["0.3", "0.2"]), {
    members: ["0.2", "0.3"],
    places: [
      ["0", 0],
      ["0", 1],
      ["0.1", 0],
      ["0.1", 1],
      ["0.1", 2],
    ],
    earlier: 5,
  });
  // Each place names the group that would receive the members.
  const places = movesFor(tree, ["0.0"])!.places;
  assert.equal(places[0]!.group, at(tree, "0.1"));
  assert.equal(places[4]!.group, at(tree, "0.2"));

  assert.equal(movesFor(tree, []), undefined, "nothing selected");
  assert.equal(movesFor(tree, ["0"]), undefined, "the root has nowhere to go");
  assert.equal(movesFor(tree, ["0.0", "0.2"]), undefined, "not a selection");
  assert.deepEqual(
    movesFor(Stack(a), ["0.0"]),
    { members: ["0.0"], places: [], earlier: 0, limited: false },
    "a lone member can be selected and has no other place",
  );
});

test("every listed place is a move that leaves everything else as it was", () => {
  const tree = Stack(
    heading,
    Switcher(a, Shelf(b, meta), c),
    Stack(),
    Shelf(Stack(d)),
  );
  const selections = [
    ...memberPaths(tree).map((path) => [path]),
    ["0.0", "0.1"],
    ["0.1.0", "0.1.1", "0.1.2"],
    ["0.2", "0.3"],
  ];
  let moves = 0;
  for (const chosen of selections) {
    const { members, places } = movesFor(tree, chosen)!;
    const moving = members.map((path) => at(tree, path));
    // The list and the single judgment agree about every place there is.
    for (const place of everyPlace(tree))
      assert.equal(
        moveObstacle(tree, members, place) === undefined,
        places.some(
          (listed) =>
            listed.parent === place.parent && listed.index === place.index,
        ),
        `${members} to ${place.parent}:${place.index}`,
      );
    for (const place of places) {
      moves++;
      const moved = moveMembers(tree, members, place);
      const label = `${members} to ${place.parent}:${place.index}`;
      assert.notEqual(moved.tree, tree, label);
      assert.deepEqual(
        moved.chosen.map((path) => at(moved.tree, path)),
        moving,
        label,
      );
      moved.chosen.forEach((path, index) =>
        assert.equal(at(moved.tree, path), moving[index], label),
      );
      // Take the members out of both: nothing else differs.
      assert.deepEqual(
        without(moved.tree, moved.chosen),
        without(tree, members),
        label,
      );
      assert.equal(
        at(moved.tree, parentPath(moved.chosen[0]!)).kind,
        place.group.kind,
        label,
      );
      assert.deepEqual(
        restoreWorkingTree(stored(moved.tree)),
        moved.tree,
        label,
      );
      // The moved selection is one the author could have made there.
      assert.deepEqual(
        movesFor(moved.tree, moved.chosen)!.members,
        moved.chosen,
      );
    }
  }
  assert.ok(moves > 80, `${moves} moves checked`);
});

test("stepping to the nearest place carries a member through the composition and back", () => {
  const start = Stack(a, Switcher(b, Stack(c)), Shelf(), d);
  let tree = start;
  let chosen: readonly string[] = ["0.0"];
  const step = (direction: "later" | "earlier") => {
    const moves = movesFor(tree, chosen)!;
    const place =
      moves.places[direction === "later" ? moves.earlier : moves.earlier - 1];
    if (!place) return false;
    ({ tree, chosen } = moveMembers(tree, moves.members, place));
    assert.equal(at(tree, chosen[0]!), a);
    return true;
  };
  // Every step reaches a new place, so there are as many steps as places.
  const places = movesFor(start, ["0.0"])!.places.length;
  let forward = 0;
  while (forward <= places && step("later")) forward++;
  assert.equal(forward, places);
  assert.deepEqual(tree, Stack(Switcher(b, Stack(c)), Shelf(), d, a));
  let back = 0;
  while (back <= places && step("earlier")) back++;
  assert.equal(back, places);
  assert.deepEqual(tree, start);
});

test("a place can be named by a neighbor or by a group's start and end", () => {
  const tree = Stack(a, Switcher(b, c), Shelf());
  assert.deepEqual(placeBefore("0.1.1"), to("0.1", 1));
  assert.deepEqual(placeAfter("0.1.1"), to("0.1", 2));
  assert.deepEqual(placeAtStart("0.1"), to("0.1", 0));
  assert.deepEqual(placeAtEnd(tree, "0.1"), to("0.1", 2));
  assert.deepEqual(placeAtEnd(tree, "0.2"), to("0.2", 0));
  assert.deepEqual(
    moveMembers(tree, ["0.0"], placeAfter("0.1.0")).tree,
    Stack(Switcher(b, a, c), Shelf()),
  );
  assert.deepEqual(
    moveMembers(tree, ["0.1.0"], placeAtEnd(tree, "0.2")).tree,
    Stack(a, Switcher(c), Shelf(b)),
  );
  // Beside the member itself is where it already is.
  assert.equal(
    moveObstacle(tree, ["0.0"], placeBefore("0.0")),
    "already-there",
  );
  assert.equal(moveObstacle(tree, ["0.0"], placeAfter("0.0")), "already-there");
  // The root has no neighbors, and text has no members.
  assert.equal(moveObstacle(tree, ["0.0"], placeAfter("0")), "not-a-place");
  assert.equal(
    moveObstacle(tree, ["0.1"], placeAtEnd(tree, "0.0")),
    "not-a-place",
  );
});

test("a move is one step for Undo, and its selection survives saving", () => {
  const model = Stack(heading, Switcher(a, b), Shelf(c));
  const before: WorkingCopy = {
    ...startWorkingCopy(model),
    chosen: ["0.1.1", "0.1.0"],
  };
  const moves = movesFor(before.model, before.chosen)!;
  const moved = moveMembers(before.model, moves.members, to("0.2", 1));
  const after = commitEdit(before, moved.tree, moved.chosen);
  assert.deepEqual(after.model, Stack(heading, Switcher(), Shelf(c, a, b)));
  assert.deepEqual(after.chosen, ["0.2.1", "0.2.2"]);
  assert.equal(after.undo.length, 1);
  assert.deepEqual(restoreWorkingCopy(stored(after)), after, "reopened");

  const undone = undoEdit(after)!;
  assert.equal(undone.model, model, "the composition from before the move");
  assert.deepEqual(undone.chosen, ["0.1.1", "0.1.0"], "and its selection");
  assert.equal(undone.undo.length, 0);

  // Nothing changed, so there is nothing for a caller to commit.
  const unchanged = moveMembers(before.model, moves.members, to("0.1", 2));
  assert.equal(unchanged.tree, before.model);
});
