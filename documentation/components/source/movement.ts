/**
 * Moving members of a working copy to another place.
 *
 * A move takes one member, or a run of neighbors, out of its group and puts
 * it among the members of a group: the same group, which changes reading
 * order, or another, which also changes membership. What moves is intact. A
 * group arrives with its arrangement and everything in it; text keeps its
 * kind and wording. Nothing else is rewritten: the group the members leave
 * keeps its place and arrangement, even with no members left, and the group
 * that receives them keeps its own.
 *
 * A place is always stated in the composition as it is before the move.
 * `moveMembers` works out where that place is once the members have left.
 *
 * `moveObstacle` is the one statement of whether a move can happen.
 * `movesFor` lists every place a selection can go, and `moveMembers` makes
 * the move.
 */
import type { Composition, Group } from "./composition.ts";
import { selectionOf } from "./composition-editing.ts";
import {
  atPath,
  neighboringMembers,
  parentPath,
  replaceAt,
} from "./grouping.ts";
import { fitsIn, type Edited, type Insertion } from "./working-copy.ts";

const position = (path: string) =>
  Number(path.slice(path.lastIndexOf(".") + 1));

/** The place just before the member at `path`. */
export function placeBefore(path: string): Insertion {
  return { parent: parentPath(path), index: position(path) };
}
/** The place just after the member at `path`. */
export function placeAfter(path: string): Insertion {
  return { parent: parentPath(path), index: position(path) + 1 };
}
/** The place before every member of the group at `group`. */
export function placeAtStart(group: string): Insertion {
  return { parent: group, index: 0 };
}
/** The place after every member of the group at `group`. */
export function placeAtEnd(tree: Composition, group: string): Insertion {
  const node = atPath(tree, group);
  return {
    parent: group,
    index: node && "children" in node ? node.children.length : 0,
  };
}

/** Why some members cannot move to some place. */
export type MoveObstacle =
  /** The whole composition was asked to move. */
  | "root"
  /** What was asked to move is not one member or a run of neighbors. */
  | "not-members"
  /** The place is not among the members of a group. */
  | "not-a-place"
  /** The place is inside a group that is moving. */
  | "inside-itself"
  /** The members would be nested more deeply than a working copy allows. */
  | "too-deep"
  /** The members are already there: the move would change nothing. */
  | "already-there";

/** Each obstacle in a sentence an author can act on. */
export const moveObstacles: Record<MoveObstacle, string> = {
  root: "The whole composition has no group to move within.",
  "not-members": "Select one member, or neighboring members, to move them.",
  "not-a-place": "Choose a place among the members of a group.",
  "inside-itself": "A group cannot move inside itself.",
  "too-deep": "That place is nested too deeply to hold this.",
  "already-there": "That is where this already is.",
};

/** The members that move together: neighbors in one group, in reading order. */
interface Run {
  /** The group they leave. */
  readonly parent: string;
  readonly group: Group;
  /** The first member's position in that group. */
  readonly start: number;
  readonly paths: readonly string[];
  readonly nodes: readonly Composition[];
}

function runOf(
  tree: Composition,
  members: readonly string[],
): Run | "root" | "not-members" {
  if (members.includes("0")) return "root";
  if (!neighboringMembers(tree, members)) return "not-members";
  const parent = parentPath(members[0]!);
  const group = atPath(tree, parent);
  if (!group || !("children" in group)) return "not-members";
  const start = Math.min(...members.map(position));
  const nodes = group.children.slice(start, start + members.length);
  return {
    parent,
    group,
    start,
    paths: nodes.map((_, index) => `${parent}.${start + index}`),
    nodes,
  };
}

function obstacleAt(
  tree: Composition,
  run: Run,
  to: Insertion,
): MoveObstacle | undefined {
  const group = atPath(tree, to.parent);
  if (
    !group ||
    !("children" in group) ||
    !Number.isInteger(to.index) ||
    to.index < 0 ||
    to.index > group.children.length
  )
    return "not-a-place";
  if (
    run.paths.some(
      (path) => to.parent === path || to.parent.startsWith(`${path}.`),
    )
  )
    return "inside-itself";
  // Just before the run, just after it, and anywhere between its members.
  if (
    to.parent === run.parent &&
    to.index >= run.start &&
    to.index <= run.start + run.nodes.length
  )
    return "already-there";
  return fitsIn(to.parent, run.nodes) ? undefined : "too-deep";
}

/**
 * Why `members` cannot move to `to`, or `undefined` when they can.
 *
 * `members` is one member that is not the root, or a run of neighbors in
 * any order. `to` is a place in `tree` as it is now.
 */
export function moveObstacle(
  tree: Composition,
  members: readonly string[],
  to: Insertion,
): MoveObstacle | undefined {
  const run = runOf(tree, members);
  return typeof run === "string" ? run : obstacleAt(tree, run, to);
}

/** A place some members can move to, with the group that would receive them. */
export interface Place extends Insertion {
  readonly group: Group;
}

/** Where the current selection can move. */
export interface Moves {
  /** What would move: the selected member or run, in reading order. */
  readonly members: readonly string[];
  /**
   * Every place it can go, in the order the places appear when the
   * composition is read: a group's start, then each member with the places
   * inside it, then the place after that member. It can be empty.
   */
  readonly places: readonly Place[];
  /**
   * How many of `places` come before where the members are now. The rest
   * come after, so `places[earlier - 1]` and `places[earlier]` are the
   * nearest moves in each direction.
   */
  readonly earlier: number;
  /** True when the nesting limit alone withholds some place. */
  readonly limited: boolean;
}

/**
 * Reads a selection as something to move. A selection of nothing, or of the
 * root, has nothing that can move.
 */
export function movesFor(
  tree: Composition,
  chosen: readonly string[],
): Moves | undefined {
  const selection = selectionOf(tree, chosen);
  const run =
    selection.selected === "nothing"
      ? undefined
      : runOf(
          tree,
          selection.selected === "members" ? selection.paths : [selection.path],
        );
  if (!run || typeof run === "string" || !("children" in tree))
    return undefined;
  const places: Place[] = [];
  let earlier = 0;
  let limited = false;
  const visit = (group: Group, parent: string) => {
    for (let index = 0; index <= group.children.length; index++) {
      const obstacle = obstacleAt(tree, run, { parent, index });
      if (!obstacle) places.push({ parent, index, group });
      // No place lies between the places the run already occupies.
      else if (obstacle === "already-there") earlier = places.length;
      else if (obstacle === "too-deep") limited = true;
      const member = group.children[index];
      if (member && "children" in member) visit(member, `${parent}.${index}`);
    }
  };
  visit(tree, "0");
  return { members: run.paths, places, earlier, limited };
}

/** A move's result: the new tree, the moved members, and where they left. */
export interface Moved extends Edited {
  /**
   * The group the members left, at its path in `tree`. That path differs
   * from before when the members arrived ahead of it in an enclosing group.
   * The group that received them is the parent of `chosen`.
   */
  readonly from: string;
}

/**
 * `path` once the members of `group` at `from` and beyond stand `by` places
 * along. Only a path through one of those members changes.
 */
function along(path: string, group: string, from: number, by: number): string {
  if (!path.startsWith(`${group}.`)) return path;
  const [member, ...rest] = path.slice(group.length + 1).split(".");
  return Number(member) < from
    ? path
    : [group, Number(member) + by, ...rest].join(".");
}

/**
 * Moves `members` to `to` and selects them where they now are.
 *
 * `to` is a place in `tree`, before anything moves. The members keep their
 * order and are the same objects as before, as is every group and text the
 * move did not pass through. The group they leave stays, whatever is left
 * in it.
 *
 * Moving members to where they already are returns `tree` itself, so a
 * caller can tell that nothing changed. Any other obstacle throws.
 */
export function moveMembers(
  tree: Composition,
  members: readonly string[],
  to: Insertion,
): Moved {
  const run = runOf(tree, members);
  if (typeof run === "string") throw new Error(moveObstacles[run]);
  const obstacle = obstacleAt(tree, run, to);
  if (obstacle === "already-there")
    return { tree, chosen: run.paths, from: run.parent };
  if (obstacle) throw new Error(moveObstacles[obstacle]);

  const count = run.nodes.length;
  const without = replaceAt(tree, run.parent, {
    kind: run.group.kind,
    children: run.group.children.filter(
      (_, index) => index < run.start || index >= run.start + count,
    ),
  });
  // The place was stated before the members left. Later members of their
  // group have closed up by `count`, which moves the place itself when it is
  // in that group, and its group's path when that runs through one of them.
  const parent = along(to.parent, run.parent, run.start + count, -count);
  const index =
    to.parent === run.parent && to.index > run.start
      ? to.index - count
      : to.index;
  const receiving = atPath(without, parent);
  if (!receiving || !("children" in receiving))
    throw new Error(moveObstacles["not-a-place"]);
  const children = [...receiving.children];
  children.splice(index, 0, ...run.nodes);
  return {
    tree: replaceAt(without, parent, { kind: receiving.kind, children }),
    chosen: run.nodes.map((_, offset) => `${parent}.${index + offset}`),
    // Arriving ahead of the group they left moves that group along.
    from: along(run.parent, parent, index, count),
  };
}
