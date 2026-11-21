/**
 * Changing how a group arranges its members.
 *
 * An arrangement edit replaces one group's primitive and nothing else: the
 * group keeps the same members, in the same order, at the same paths. That is
 * why a saved arrangement can be validated against the starting composition
 * position by position.
 */
import type { Composition, Group, Primitive } from "./composition.ts";
import { atPath, replaceAt } from "./grouping.ts";

export const arrangements: readonly Primitive[] = [
  "Stack",
  "Shelf",
  "Switcher",
];

export function isArrangement(value: unknown): value is Primitive {
  return arrangements.some((kind) => kind === value);
}

/** What each arrangement promises, whatever it looks like at one width. */
export const arrangementContracts: Record<Primitive, string> = {
  Stack: "A Stack keeps its members in one column at any width.",
  Shelf:
    "A Shelf keeps its members in one row, and scrolls when the row needs more room.",
  Switcher:
    "A Switcher uses one row when all its members fit, and one column when they do not.",
};

/** The group a selection names, when it names exactly one group. A leaf, a
 * stale path or several paths name none; a leaf never stands for its parent. */
export function arrangementTarget(
  tree: Composition,
  paths: readonly string[],
): { readonly path: string; readonly group: Group } | undefined {
  const [path, ...others] = paths;
  if (path === undefined || others.length) return undefined;
  const group = atPath(tree, path);
  return group && "children" in group ? { path, group } : undefined;
}

/**
 * Gives the group at `path` another arrangement. Every member is the same
 * object as before. Choosing the arrangement a group already has returns
 * `tree` itself, so a caller can tell that nothing changed.
 */
export function arrangeGroup(
  tree: Composition,
  path: string,
  kind: Primitive,
): Composition {
  const target = arrangementTarget(tree, [path]);
  if (!target) throw new Error("Select a group to change its arrangement.");
  if (target.group.kind === kind) return tree;
  return replaceAt(tree, path, { kind, children: target.group.children });
}

/** Paths of the groups arranged differently in two compositions with the
 * same members. Compositions with different members have no such paths. */
export function changedArrangements(
  before: Composition,
  after: Composition,
): string[] {
  const changed: string[] = [];
  function compare(a: Composition, b: Composition, path: string): boolean {
    if (!("children" in a) || !("children" in b))
      return (
        !("children" in a) &&
        !("children" in b) &&
        a.kind === b.kind &&
        a.text === b.text
      );
    if (a.children.length !== b.children.length) return false;
    if (a.kind !== b.kind) changed.push(path);
    return a.children.every((child, index) =>
      compare(child, b.children[index]!, `${path}.${index}`),
    );
  }
  return compare(before, after, "0") ? changed : [];
}

/**
 * Reads a saved arrangement of `initial`. Only group kinds are taken from the
 * saved value. Its nesting, leaf kinds, text and order must match `initial`
 * exactly, and the result is built from `initial`'s own leaves, so saved data
 * cannot regroup, reorder, replace or add content.
 */
export function restoreArrangement(
  saved: unknown,
  initial: Composition,
): Composition | undefined {
  function restore(value: unknown, node: Composition): Composition | undefined {
    if (!value || typeof value !== "object") return undefined;
    const record = value as Record<string, unknown>;
    if (!("children" in node))
      return record.kind === node.kind && record.text === node.text
        ? node
        : undefined;
    if (
      !isArrangement(record.kind) ||
      !Array.isArray(record.children) ||
      record.children.length !== node.children.length
    )
      return undefined;
    const children: Composition[] = [];
    for (const [index, member] of node.children.entries()) {
      const child = restore(record.children[index], member);
      if (!child) return undefined;
      children.push(child);
    }
    return { kind: record.kind, children };
  }
  return restore(saved, initial);
}
