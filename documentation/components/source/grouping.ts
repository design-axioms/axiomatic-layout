import { Stack } from "./composition.ts";
import type { Composition } from "./composition.ts";

export function atPath(
  tree: Composition,
  path: string,
): Composition | undefined {
  const parts = path.split(".");
  if (parts.shift() !== "0") return undefined;
  let node = tree;
  for (const part of parts) {
    if (!/^(0|[1-9]\d*)$/.test(part) || !("children" in node)) return undefined;
    const child = node.children[Number(part)];
    if (!child) return undefined;
    node = child;
  }
  return node;
}
export function parentPath(path: string): string {
  return path.slice(0, path.lastIndexOf("."));
}
/** A tree in which `value` stands at `path`. Every node off that path is shared. */
export function replaceAt(
  tree: Composition,
  path: string,
  value: Composition,
): Composition {
  if (path === "0") return value;
  const parent = parentPath(path);
  const node = atPath(tree, parent);
  if (!node || !("children" in node))
    throw new Error("Missing composition parent");
  const children = [...node.children];
  children[Number(path.split(".").at(-1))] = value;
  return replaceAt(tree, parent, { ...node, children });
}
// A selection can include every sibling even though this introductory editor
// cannot add a redundant group around that complete selection.
export function neighboringMembers(
  tree: Composition,
  paths: readonly string[],
): boolean {
  if (!paths.length || new Set(paths).size !== paths.length) return false;
  const parent = parentPath(paths[0]!);
  if (
    !parent ||
    paths.some((path) => parentPath(path) !== parent || !atPath(tree, path))
  )
    return false;
  const indices = paths
    .map((path) => Number(path.split(".").at(-1)))
    .sort((a, b) => a - b);
  return indices.every((index, i) => i === 0 || index === indices[i - 1]! + 1);
}
export function groupingReason(
  tree: Composition,
  paths: readonly string[],
): string | undefined {
  if (paths.length < 2) return "Select two or more neighboring members.";
  if (new Set(paths).size !== paths.length) return "Select each member once.";
  const parent = parentPath(paths[0]!);
  if (
    !parent ||
    paths.some((path) => parentPath(path) !== parent || !atPath(tree, path))
  )
    return "Choose members of the same group.";
  const node = atPath(tree, parent);
  if (!node || !("children" in node))
    return "Choose members of the same group.";
  const indices = paths
    .map((path) => Number(path.split(".").at(-1)))
    .sort((a, b) => a - b);
  if (indices.some((index, i) => i > 0 && index !== indices[i - 1]! + 1))
    return "Select neighboring members, with none skipped.";
  if (indices.length === node.children.length)
    return "These are already all the members of one group. Leave a neighbor outside the new group.";
  return undefined;
}
export function groupMembers(
  tree: Composition,
  paths: readonly string[],
): Composition {
  const reason = groupingReason(tree, paths);
  if (reason) throw new Error(reason);
  const parent = parentPath(paths[0]!);
  const node = atPath(tree, parent)!;
  if (!("children" in node)) throw new Error("Expected group");
  const start = Math.min(
    ...paths.map((path) => Number(path.split(".").at(-1))),
  );
  const children = [...node.children];
  children.splice(
    start,
    paths.length,
    Stack(...children.slice(start, start + paths.length)),
  );
  return replaceAt(tree, parent, { ...node, children });
}
export function ungroupMembers(tree: Composition, path: string): Composition {
  const node = atPath(tree, path);
  const parent = parentPath(path);
  const container = atPath(tree, parent);
  if (
    !parent ||
    !node ||
    !("children" in node) ||
    !container ||
    !("children" in container)
  )
    throw new Error("Select an inner group to ungroup.");
  const children = [...container.children];
  children.splice(Number(path.split(".").at(-1)), 1, ...node.children);
  return replaceAt(tree, parent, { ...container, children });
}

// Saved exercises may regroup the supplied content, but cannot replace or reorder it.
export function restoreGrouping(
  saved: unknown,
  initial: Composition,
): Composition | undefined {
  let remaining = 100;
  function parse(value: unknown, depth: number): Composition | undefined {
    if (--remaining < 0 || depth > 12 || !value || typeof value !== "object")
      return undefined;
    const record = value as Record<string, unknown>;
    if (
      record.kind === "Stack" &&
      Array.isArray(record.children) &&
      record.children.length >= 2
    ) {
      const children = record.children.map((child) => parse(child, depth + 1));
      if (children.some((child) => !child)) return undefined;
      return Stack(...(children as Composition[]));
    }
    if (
      ["Text", "Heading", "Meta"].includes(String(record.kind)) &&
      typeof record.text === "string"
    )
      return {
        kind: record.kind as "Text" | "Heading" | "Meta",
        text: record.text,
      };
    return undefined;
  }
  function leaves(tree: Composition): string[] {
    return "children" in tree
      ? tree.children.flatMap(leaves)
      : [JSON.stringify([tree.kind, tree.text])];
  }
  const tree = parse(saved, 0);
  return tree &&
    tree.kind === "Stack" &&
    JSON.stringify(leaves(tree)) === JSON.stringify(leaves(initial))
    ? tree
    : undefined;
}
