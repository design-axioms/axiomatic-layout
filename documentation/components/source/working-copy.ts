/**
 * A working copy: a composition its author may change freely.
 *
 * The guided exercises fix their content and let a reader regroup or
 * rearrange it. A working copy fixes nothing but its shape: the root is a
 * group, and every node is a group with one of the three arrangements or
 * content with one of the three roles. Content can be rewritten, given
 * another role, added and removed, and the whole can be made blank.
 *
 * A group is an authored decision, so it keeps its place and its arrangement
 * however many members it has. Removing a group's last member leaves an
 * empty group, and an author can add an empty group to fill later. Nothing
 * here dissolves a group on the author's behalf.
 *
 * Content has a role: a Heading, Text or Meta. A role says what the wording
 * is for, and the stylesheet decides how each role looks. The model holds no
 * size, rank or urgency, and a role is not an arrangement: changing it
 * leaves the wording, its place and every group as they were.
 *
 * `editsFor` says what a selection permits. Each edit returns the new tree
 * together with the path the author will want selected next. Selection
 * itself follows `chooseMember` in `composition-editing.ts`. Moving members
 * to another place is in `movement.ts`.
 */
import type { Composition, Group, LeafKind, Primitive } from "./composition.ts";
import { isArrangement } from "./arrangement.ts";
import {
  atPath,
  neighboringMembers,
  parentPath,
  replaceAt,
  ungroupMembers,
} from "./grouping.ts";
import { restoreSelection, selectionOf } from "./composition-editing.ts";

export type Content = Exclude<Composition, Group>;

/** The roles content can have, in the order an author is offered them. */
export const contentKinds: readonly LeafKind[] = ["Text", "Heading", "Meta"];

export function isContentKind(value: unknown): value is LeafKind {
  return contentKinds.some((kind) => kind === value);
}

/**
 * How large a working copy and its history may grow. Saved state beyond
 * these bounds is rejected, and `editsFor` withholds the edit that would
 * pass them, so every state an author reaches can be saved and reopened.
 * `ancestors` counts the groups above the most deeply nested node.
 */
export const workingCopyLimits = {
  nodes: 200,
  ancestors: 12,
  history: 50,
} as const;

/** The text a new member starts with, ready to be replaced. */
export const newText = "New text";

const position = (path: string) =>
  Number(path.slice(path.lastIndexOf(".") + 1));
const ancestorsOf = (path: string) => path.split(".").length - 1;

function countNodes(tree: Composition): number {
  return "children" in tree
    ? tree.children.reduce((sum, child) => sum + countNodes(child), 1)
    : 1;
}
/** Whether one more node keeps `tree` within `workingCopyLimits.nodes`. */
function hasRoom(tree: Composition): boolean {
  return countNodes(tree) < workingCopyLimits.nodes;
}
/** Levels of nesting below `tree`: none for content or an empty group. */
function levelsBelow(tree: Composition): number {
  return "children" in tree
    ? Math.max(0, ...tree.children.map((child) => levelsBelow(child) + 1))
    : 0;
}
/**
 * Whether `members` could join the group at `parent` with nothing nested
 * more deeply than `workingCopyLimits.ancestors` allows. Adding, grouping
 * and moving all ask this one question.
 */
export function fitsIn(
  parent: string,
  members: readonly Composition[],
): boolean {
  return (
    ancestorsOf(parent) + 1 + Math.max(0, ...members.map(levelsBelow)) <=
    workingCopyLimits.ancestors
  );
}
function groupAt(tree: Composition, path: string): Group {
  const node = atPath(tree, path);
  if (!node || !("children" in node)) throw new Error("Expected a group");
  return node;
}

/**
 * Reads a composition of unknown origin as a working copy.
 *
 * The value supplies everything: text, the number and order of members, and
 * each group's arrangement. Groups may have no members or one. The root is a
 * group, kinds are the six known ones, text is a string, and the whole stays
 * within `workingCopyLimits`. The result is built afresh, so nothing else
 * the value carried survives.
 */
export function restoreWorkingTree(saved: unknown): Composition | undefined {
  let nodes = 0;
  function restore(value: unknown, ancestors: number): Composition | undefined {
    if (
      ++nodes > workingCopyLimits.nodes ||
      ancestors > workingCopyLimits.ancestors ||
      !value ||
      typeof value !== "object"
    )
      return undefined;
    const record = value as Record<string, unknown>;
    if (isArrangement(record.kind)) {
      if (!Array.isArray(record.children)) return undefined;
      const children: Composition[] = [];
      for (const member of record.children) {
        const child = restore(member, ancestors + 1);
        if (!child) return undefined;
        children.push(child);
      }
      return { kind: record.kind, children };
    }
    return isContentKind(record.kind) && typeof record.text === "string"
      ? { kind: record.kind, text: record.text }
      : undefined;
  }
  const tree = restore(saved, 0);
  return tree && "children" in tree ? tree : undefined;
}

/** A composition and the selection made in it. */
export interface Snapshot {
  readonly model: Composition;
  readonly chosen: readonly string[];
}

/** The author's composition, selection, and the states Undo returns to. */
export interface WorkingCopy extends Snapshot {
  /** Earlier states, oldest first. */
  readonly undo: readonly Snapshot[];
}

function restoreSnapshot(saved: unknown): Snapshot | undefined {
  if (!saved || typeof saved !== "object") return undefined;
  const record = saved as Record<string, unknown>;
  const model = restoreWorkingTree(record.model);
  return model && { model, chosen: restoreSelection(record.chosen, model) };
}

/**
 * Reads a saved working copy. An unreadable composition means there is no
 * working copy. A selection that does not fit its composition restores as no
 * selection, and an unreadable history entry is dropped.
 */
export function restoreWorkingCopy(saved: unknown): WorkingCopy | undefined {
  const current = restoreSnapshot(saved);
  if (!current) return undefined;
  const history = (saved as Record<string, unknown>).undo;
  const undo = (Array.isArray(history) ? history : [])
    .slice(-workingCopyLimits.history)
    .flatMap((entry) => restoreSnapshot(entry) ?? []);
  return { ...current, undo };
}

/** A fresh working copy of `model`, with nothing selected and no history. */
export function startWorkingCopy(model: Composition): WorkingCopy {
  return { model, chosen: [], undo: [] };
}

function remembering(copy: WorkingCopy, before: Snapshot): readonly Snapshot[] {
  return [...copy.undo, before].slice(-workingCopyLimits.history);
}

/** The working copy after one edit: the state before it becomes undoable. */
export function commitEdit(
  copy: WorkingCopy,
  model: Composition,
  chosen: readonly string[],
): WorkingCopy {
  return {
    model,
    chosen,
    undo: remembering(copy, { model: copy.model, chosen: copy.chosen }),
  };
}

/** The working copy before its last edit, or `undefined` with none to undo. */
export function undoEdit(copy: WorkingCopy): WorkingCopy | undefined {
  const before = copy.undo.at(-1);
  return before && { ...before, undo: copy.undo.slice(0, -1) };
}

/**
 * A place among the members of the group at `parent`: before its member
 * `index`, or after its last member when `index` is their number.
 */
export interface Insertion {
  readonly parent: string;
  readonly index: number;
}

/** What the current selection lets the author do. An absent edit is unavailable. */
export interface WorkingEdits {
  /** The one selected content, whose wording and role can change. */
  readonly text:
    { readonly path: string; readonly content: Content } | undefined;
  /** The one selected group, whose arrangement can change. */
  readonly arrange:
    { readonly path: string; readonly group: Group } | undefined;
  /**
   * A new member as the last member of `group`: the selected group, or the
   * whole composition when nothing is selected. New content and a new empty
   * group fit in the same places, so this serves `addText` and `addGroup`.
   */
  readonly inside: (Insertion & { readonly group: Group }) | undefined;
  /** A new member as the next sibling of the selected member or run. */
  readonly after: Insertion | undefined;
  /** The selected neighbors a new Stack can hold: one member, or several. */
  readonly wrap: readonly string[] | undefined;
  /** The selected inner group whose members can rejoin its parent. */
  readonly release: string | undefined;
  /** The selected member that can be removed. The root cannot. */
  readonly remove: string | undefined;
  /** True when only `workingCopyLimits` withholds adding or grouping. */
  readonly full: boolean;
}

/**
 * Reads a selection against the working copy it was made in.
 *
 * Grouping needs no neighbor left outside and no second member: here a group
 * of one, or a group around all of its parent's members, is a decision the
 * author may make.
 */
export function editsFor(
  tree: Composition,
  chosen: readonly string[],
): WorkingEdits {
  const selection = selectionOf(tree, chosen);
  const room = hasRoom(tree);
  let full = false;
  const within = (allowed: boolean) => {
    if (!allowed) full = true;
    return allowed;
  };

  const single =
    selection.selected === "group" || selection.selected === "content"
      ? selection.path
      : undefined;
  const run =
    selection.selected === "members"
      ? selection.paths
      : single !== undefined && single !== "0"
        ? [single]
        : undefined;
  const target =
    selection.selected === "group"
      ? selection
      : selection.selected === "nothing"
        ? { path: "0", group: groupAt(tree, "0") }
        : undefined;

  const node = single === undefined ? undefined : atPath(tree, single);
  const text =
    single !== undefined && node && !("children" in node)
      ? { path: single, content: node }
      : undefined;
  // A new member is content or an empty group: one node, nothing nested.
  const inside =
    target &&
    within(room && fitsIn(target.path, [{ kind: "Text", text: newText }]))
      ? {
          parent: target.path,
          index: target.group.children.length,
          group: target.group,
        }
      : undefined;
  const after =
    run && within(room)
      ? { parent: parentPath(run[0]!), index: position(run.at(-1)!) + 1 }
      : undefined;
  // Grouping adds a level: the new Stack must fit where its members stand.
  const wrap =
    run &&
    within(
      room &&
        fitsIn(parentPath(run[0]!), [
          { kind: "Stack", children: run.map((path) => atPath(tree, path)!) },
        ]),
    )
      ? run
      : undefined;
  return {
    text,
    arrange:
      selection.selected === "group"
        ? { path: selection.path, group: selection.group }
        : undefined,
    inside,
    after,
    wrap,
    release:
      selection.selected === "group" && selection.canUngroup
        ? selection.path
        : undefined,
    remove: single !== undefined && single !== "0" ? single : undefined,
    full,
  };
}

/** What follows an edit: the new tree and the selection that suits it. */
export interface Edited {
  readonly tree: Composition;
  readonly chosen: readonly string[];
}

/**
 * Rewrites the text at `path`, keeping its kind. The same text returns
 * `tree` itself, so a caller can tell that nothing changed.
 */
export function editText(
  tree: Composition,
  path: string,
  text: string,
): Composition {
  const content = atPath(tree, path);
  if (!content || "children" in content)
    throw new Error("Select one text to edit it.");
  if (content.text === text) return tree;
  return replaceAt(tree, path, { kind: content.kind, text });
}

/**
 * Gives the content at `path` another role, keeping its wording and its
 * place. Nodes outside the path being rebuilt keep their identity. The role
 * it already has returns `tree` itself, so a caller can tell that nothing changed.
 *
 * A group has an arrangement, not a role: `arrangeGroup` changes that.
 */
export function editContentKind(
  tree: Composition,
  path: string,
  kind: LeafKind,
): Composition {
  if (!isContentKind(kind)) throw new Error("Choose Text, Heading or Meta.");
  const content = atPath(tree, path);
  if (!content || "children" in content)
    throw new Error("Select one text to change its role.");
  if (content.kind === kind) return tree;
  return replaceAt(tree, path, { kind, text: content.text });
}

/**
 * Puts one new member at `at` and selects it. Later siblings move along by
 * one. The place must exist, and the result must stay within
 * `workingCopyLimits`; `editsFor` offers only places where it does.
 */
function insertMember(
  tree: Composition,
  at: Insertion,
  member: Composition,
): Edited {
  const group = groupAt(tree, at.parent);
  if (
    !Number.isInteger(at.index) ||
    at.index < 0 ||
    at.index > group.children.length
  )
    throw new Error("A new member needs a position in its group.");
  if (!hasRoom(tree))
    throw new Error("This working copy has no room for another member.");
  if (!fitsIn(at.parent, [member]))
    throw new Error("That group is nested too deeply to hold a new member.");
  const children = [...group.children];
  children.splice(at.index, 0, member);
  return {
    tree: replaceAt(tree, at.parent, { kind: group.kind, children }),
    chosen: [`${at.parent}.${at.index}`],
  };
}

/** Adds a Text at `at` and selects it. */
export function addText(
  tree: Composition,
  at: Insertion,
  text: string = newText,
): Edited {
  return insertMember(tree, at, { kind: "Text", text });
}

/**
 * Adds a group with no members at `at`, arranged as `kind`, and selects it.
 * It is an authored group from the start: it keeps its arrangement and its
 * place while it is empty, and `editsFor` then offers a place inside it.
 */
export function addGroup(
  tree: Composition,
  at: Insertion,
  kind: Primitive,
): Edited {
  if (!isArrangement(kind)) throw new Error("Choose Stack, Shelf or Switcher.");
  return insertMember(tree, at, { kind, children: [] });
}

/**
 * Replaces the whole composition with an empty Stack and selects it, ready
 * to be added to. A composition that is already an empty Stack returns
 * `tree` itself, so a caller can tell that nothing changed.
 *
 * This is an edit like any other: a caller commits it with `commitEdit`,
 * and Undo then restores the composition and selection it replaced.
 */
export function blankComposition(tree: Composition): Edited {
  const blank =
    tree.kind === "Stack" && "children" in tree && !tree.children.length;
  return {
    tree: blank ? tree : { kind: "Stack", children: [] },
    chosen: ["0"],
  };
}

/**
 * Removes the member at `path` with everything in it. Its group stays, with
 * the same arrangement, even when that leaves it with one member or none.
 * The selection moves to the member now in that place, else to the one
 * before it, else to the emptied group.
 */
export function removeMember(tree: Composition, path: string): Edited {
  const parent = parentPath(path);
  if (!parent || !atPath(tree, path))
    throw new Error("Select a member to remove it.");
  const group = groupAt(tree, parent);
  const index = position(path);
  const children = group.children.filter((_, at) => at !== index);
  const next = Math.min(index, children.length - 1);
  return {
    tree: replaceAt(tree, parent, { kind: group.kind, children }),
    chosen: [next < 0 ? parent : `${parent}.${next}`],
  };
}

/**
 * Puts one member, or a run of neighbors, into a new Stack where they stood
 * and selects it. They may be all of their group's members.
 */
export function wrapMembers(
  tree: Composition,
  paths: readonly string[],
): Edited {
  if (!neighboringMembers(tree, paths))
    throw new Error("Select neighboring members of one group.");
  const parent = parentPath(paths[0]!);
  const group = groupAt(tree, parent);
  const start = Math.min(...paths.map(position));
  const children = [...group.children];
  children.splice(start, paths.length, {
    kind: "Stack",
    children: children.slice(start, start + paths.length),
  });
  return {
    tree: replaceAt(tree, parent, { kind: group.kind, children }),
    chosen: [`${parent}.${start}`],
  };
}

/**
 * Returns the members of the inner group at `path` to its parent, in place,
 * and selects them. An empty group has none to return: it disappears and
 * its parent is selected.
 */
export function releaseGroup(tree: Composition, path: string): Edited {
  const parent = parentPath(path);
  if (!parent) throw new Error("Select an inner group to ungroup.");
  const { children } = groupAt(tree, path);
  const start = position(path);
  return {
    tree: ungroupMembers(tree, path),
    chosen: children.length
      ? children.map((_, index) => `${parent}.${start + index}`)
      : [parent],
  };
}

/**
 * One uninterrupted rewording of one text. The composition changes as the
 * author types, and the whole rewording is a single step for Undo.
 */
export interface TextEdit {
  readonly path: string;
  readonly before: Snapshot;
}

export function beginTextEdit(copy: WorkingCopy, path: string): TextEdit {
  const content = atPath(copy.model, path);
  if (!content || "children" in content)
    throw new Error("Select one text to edit it.");
  return { path, before: { model: copy.model, chosen: copy.chosen } };
}

/** The working copy while typing. History waits for the edit to finish. */
export function typeText(
  copy: WorkingCopy,
  edit: TextEdit,
  text: string,
): WorkingCopy {
  return { ...copy, model: editText(copy.model, edit.path, text) };
}

/** Ends the edit. It becomes one undoable step if the wording changed. */
export function finishTextEdit(copy: WorkingCopy, edit: TextEdit): WorkingCopy {
  const wording = (model: Composition) => {
    const content = atPath(model, edit.path);
    return content && !("children" in content) ? content.text : undefined;
  };
  return wording(copy.model) === wording(edit.before.model)
    ? copy
    : { ...copy, undo: remembering(copy, edit.before) };
}

/** Abandons the edit: the composition and selection from before it return. */
export function cancelTextEdit(copy: WorkingCopy, edit: TextEdit): WorkingCopy {
  return { ...edit.before, undo: copy.undo };
}
