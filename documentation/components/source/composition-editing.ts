/**
 * Editing a composition's grouping and arrangement together.
 *
 * The supplied content is fixed: the same leaves, in the same order. A reader
 * decides which neighbors form a group and how each group arranges its
 * members. Every state that can be reached that way is a nesting of Stack,
 * Shelf and Switcher groups over that one sequence, in which each group has
 * at least two members. `restoreComposition` accepts only those states.
 *
 * A selection is one node, or a run of neighboring members of one group.
 * `selectionOf` says what a selection permits, and `chooseMember` says how a
 * click changes it. The edits themselves are `groupMembers`, `ungroupMembers`
 * and `arrangeGroup`.
 */
import type { Composition, Group } from "./composition.ts";
import { arrangementTarget, isArrangement } from "./arrangement.ts";
import {
  atPath,
  groupingReason,
  neighboringMembers,
  parentPath,
} from "./grouping.ts";

type Content = Exclude<Composition, Group>;

// Regrouping n leaves yields at most 2n − 1 nodes and n − 1 levels of groups,
// so these bounds admit every state of an exercise with up to 13 leaves.
const maximumNodes = 100;
const maximumAncestors = 12;

function contentOf(tree: Composition): Content[] {
  return "children" in tree ? tree.children.flatMap(contentOf) : [tree];
}

/**
 * Reads a saved regrouping and rearrangement of `initial`.
 *
 * The saved value supplies structure only: which runs of content are grouped,
 * and each group's arrangement. Its root is a group, every group has at least
 * two members, and its leaves match `initial`'s in kind, text, order and
 * number. The result holds `initial`'s own leaves, so saved data cannot
 * reorder, replace, drop, repeat or add content. A value with more than 100
 * nodes, or with a node more than 12 levels below the root, is rejected.
 */
export function restoreComposition(
  saved: unknown,
  initial: Composition,
): Composition | undefined {
  const supplied = contentOf(initial);
  let used = 0;
  let nodes = 0;
  function restore(value: unknown, ancestors: number): Composition | undefined {
    if (
      ++nodes > maximumNodes ||
      ancestors > maximumAncestors ||
      !value ||
      typeof value !== "object"
    )
      return undefined;
    const record = value as Record<string, unknown>;
    if (!isArrangement(record.kind)) {
      // Content is taken in reading order and from `initial`, never copied.
      const leaf = supplied[used];
      if (!leaf || record.kind !== leaf.kind || record.text !== leaf.text)
        return undefined;
      used++;
      return leaf;
    }
    if (!Array.isArray(record.children) || record.children.length < 2)
      return undefined;
    const children: Composition[] = [];
    for (const member of record.children) {
      const child = restore(member, ancestors + 1);
      if (!child) return undefined;
      children.push(child);
    }
    return { kind: record.kind, children };
  }
  const tree = restore(saved, 0);
  return tree && "children" in tree && used === supplied.length
    ? tree
    : undefined;
}

/** What the reader has selected, and so which edits apply. */
export type EditingSelection =
  | { readonly selected: "nothing" }
  /** One leaf. It has no members to arrange and never stands for its group. */
  | { readonly selected: "content"; readonly path: string }
  /** One group: the target of an arrangement. The root cannot be ungrouped. */
  | {
      readonly selected: "group";
      readonly path: string;
      readonly group: Group;
      readonly canUngroup: boolean;
    }
  /**
   * Two or more neighboring members of `parent`, in reading order. They can
   * be grouped unless they are all of its members: every group keeps at
   * least two members, and a group around all of them would leave one.
   */
  | {
      readonly selected: "members";
      readonly paths: readonly string[];
      readonly parent: string;
      readonly canGroup: boolean;
    };

/**
 * Reads a selection against the composition it was made in. Paths that no
 * longer name a node, repeat, skip a neighbor or span different groups
 * select nothing.
 */
export function selectionOf(
  tree: Composition,
  chosen: readonly string[],
): EditingSelection {
  const [path, ...others] = chosen;
  if (path === undefined) return { selected: "nothing" };
  if (!others.length) {
    const target = arrangementTarget(tree, chosen);
    if (target)
      return { selected: "group", ...target, canUngroup: path !== "0" };
    return atPath(tree, path)
      ? { selected: "content", path }
      : { selected: "nothing" };
  }
  if (!neighboringMembers(tree, chosen)) return { selected: "nothing" };
  const position = (member: string) => Number(member.split(".").at(-1));
  return {
    selected: "members",
    paths: [...chosen].sort((a, b) => position(a) - position(b)),
    parent: parentPath(path),
    canGroup: !groupingReason(tree, chosen),
  };
}

/**
 * The selection after the reader chooses `path`.
 *
 * Choosing a neighbor of the selection extends it. Choosing a selected
 * member removes it. Choosing anything else, at any level, starts a new
 * selection there; the root has no neighbors, so it is always selected alone.
 * Removing a member from the middle of a run keeps the first member chosen.
 * The result lists members in the order they were chosen.
 */
export function chooseMember(
  tree: Composition,
  chosen: readonly string[],
  path: string,
): readonly string[] {
  if (!atPath(tree, path)) return chosen;
  if (chosen.includes(path)) {
    const rest = chosen.filter((member) => member !== path);
    return rest.length > 1 && !neighboringMembers(tree, rest)
      ? [rest[0]!]
      : rest;
  }
  const extended = [...chosen, path];
  return chosen.length && neighboringMembers(tree, extended)
    ? extended
    : [path];
}

/**
 * Reads a saved selection for `tree`. Anything that is not a selection the
 * reader could have made there restores as no selection.
 */
export function restoreSelection(
  saved: unknown,
  tree: Composition,
): readonly string[] {
  if (
    !Array.isArray(saved) ||
    !saved.every((path): path is string => typeof path === "string")
  )
    return [];
  return selectionOf(tree, saved).selected === "nothing" ? [] : saved;
}
