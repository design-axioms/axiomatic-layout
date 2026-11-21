/**
 * Drafts: the working copies an author keeps in one browser.
 *
 * A draft is a working copy with a name, an identity and the width its
 * author last gave the wide view. A workspace holds every draft and says
 * which one is open. Each draft has its own composition, selection and Undo
 * history; changing one never touches another.
 *
 * Removing a draft takes it out of the workspace whole and hands it back as
 * a removal, which can later return exactly that draft to whatever the
 * workspace has become. A workspace whose last draft was removed has no
 * drafts and none open; it is still a workspace, distinct from never having
 * had one.
 *
 * Nothing here reads or writes storage. These functions say what a
 * workspace is and how it changes; the caller decides when to save, and
 * what to do when another tab saved first.
 *
 * A workspace is all or nothing. One that cannot be read in full is not
 * read at all, and a change that would not fit is refused, so a caller is
 * never handed a workspace with a draft quietly left out. Every workspace
 * these functions return can be saved and read back unchanged.
 */
import type { Composition } from "./composition.ts";
import { clampWidth, maximumWidth } from "./width-control.ts";
import { restoreWorkingCopy, type WorkingCopy } from "./working-copy.ts";

/**
 * How much a workspace may hold. `characters` bounds the workspace written
 * as JSON, counted as `localStorage` counts it: `JSON.stringify(…).length`.
 */
export const draftLimits = {
  drafts: 20,
  name: 80,
  characters: 2 * 1024 * 1024,
} as const;

/** The wide view's width in a draft that has not been resized. */
export const newDraftWidth = 600;

const identityLimit = 64;

export interface Draft {
  /** Chosen by the caller, and never reused in a workspace. */
  readonly id: string;
  /** As its author typed it: at most `draftLimits.name` characters, perhaps none. */
  readonly name: string;
  readonly copy: WorkingCopy;
  /** The wide view's requested width, in pixels. A view setting, not authored. */
  readonly width: number;
}

export interface DraftWorkspace {
  readonly version: 1;
  /**
   * The draft that is open: always one of `drafts`. It is `null` exactly
   * when there are no drafts.
   */
  readonly activeId: string | null;
  /** In the order they were made, with a restored draft back in its place. */
  readonly drafts: readonly Draft[];
}

/** A draft taken out of a workspace, and where it stood among the others. */
export interface DraftRemoval {
  /** The draft as it was: identity, name, working copy and width. */
  readonly draft: Draft;
  /** Its position in `drafts` when it was removed. */
  readonly index: number;
}

/** Why a workspace cannot be read, or a change to one cannot be made. */
export type DraftProblem =
  /** There would be more than `draftLimits.drafts`. */
  | "too-many-drafts"
  /** The workspace would need more than `draftLimits.characters`. */
  | "too-large"
  /** The name has more than `draftLimits.name` characters. */
  | "name"
  /** The draft's working copy is not one. */
  | "composition"
  /** No draft has that identity. */
  | "unknown-draft"
  /** The identity is empty, too long, or already another draft's. */
  | "identity"
  /** A removed draft is already back among the drafts. */
  | "already-restored"
  /** The width is not a number. */
  | "width";

/** Each problem in a sentence for an author. Saved drafts are never changed by a refusal. */
export const draftProblems: Record<DraftProblem, string> = {
  "too-many-drafts": `This browser keeps at most ${draftLimits.drafts} drafts, so a new one was not made. Your drafts are unchanged. A snapshot link keeps this composition without a draft.`,
  "too-large":
    "Your drafts would be too large to save in this browser, so this change was not saved. What was saved before is unchanged. A snapshot link keeps this composition without a draft.",
  name: `A draft's name can have at most ${draftLimits.name} characters.`,
  composition: "A draft can only hold a composition.",
  "unknown-draft": "That draft is not among your drafts.",
  identity: "A draft needs an identity of its own.",
  "already-restored":
    "That draft is already among your drafts, so it was not restored again.",
  width: "A draft's width is a number of pixels.",
};

/** What the limits mean when the change refused is restoring a removed draft. */
const restoringProblems: Partial<Record<DraftProblem, string>> = {
  "too-many-drafts": `This browser keeps at most ${draftLimits.drafts} drafts and already has that many, so the removed draft was not restored. Your drafts are unchanged.`,
  "too-large":
    "Restoring the removed draft would make your drafts too large to save in this browser, so it was not restored. Your drafts are unchanged.",
};

/** Thrown when a change to a workspace is refused. Its message is for an author. */
export class DraftError extends Error {
  readonly problem: DraftProblem;
  constructor(problem: DraftProblem, message = draftProblems[problem]) {
    super(message);
    this.name = "DraftError";
    this.problem = problem;
  }
}

/** A draft built afresh from its four fields, or why they do not make one. */
function draftFrom(
  id: unknown,
  name: unknown,
  copy: unknown,
  width: unknown,
): Draft | DraftProblem {
  if (typeof id !== "string" || !id || id.length > identityLimit)
    return "identity";
  if (typeof name !== "string" || name.length > draftLimits.name) return "name";
  const restored = restoreWorkingCopy(copy);
  if (!restored) return "composition";
  if (typeof width !== "number" || !Number.isFinite(width)) return "width";
  return {
    id,
    name,
    copy: restored,
    width: clampWidth(width, maximumWidth),
  };
}

/** No drafts and none open, or one of the drafts open: nothing between. */
function opensOneOf(
  activeId: unknown,
  drafts: readonly Draft[],
): activeId is string | null {
  return activeId === null
    ? drafts.length === 0
    : drafts.some((draft) => draft.id === activeId);
}

/** A workspace of `drafts` with one open, or why they do not make one. */
function workspaceFrom(
  activeId: unknown,
  drafts: readonly Draft[],
): DraftWorkspace | DraftProblem {
  if (drafts.length > draftLimits.drafts) return "too-many-drafts";
  if (new Set(drafts.map((draft) => draft.id)).size !== drafts.length)
    return "identity";
  if (!opensOneOf(activeId, drafts)) return "unknown-draft";
  const workspace: DraftWorkspace = { version: 1, activeId, drafts };
  return JSON.stringify(workspace).length > draftLimits.characters
    ? "too-large"
    : workspace;
}

function made<T extends object>(result: T | DraftProblem): T {
  if (typeof result === "string") throw new DraftError(result);
  return result;
}

/**
 * Reads a saved workspace.
 *
 * The whole value must be a version 1 workspace within `draftLimits`: every
 * draft readable, identities distinct, and the open draft among them, or
 * no drafts and `activeId` null. Anything else, including another version,
 * is `undefined`, and whatever was stored should be left as it is.
 *
 * The result is built afresh from known fields. Within a draft, a working
 * copy is read as `restoreWorkingCopy` reads it.
 */
export function restoreDraftWorkspace(
  saved: unknown,
): DraftWorkspace | undefined {
  if (!saved || typeof saved !== "object") return undefined;
  const record = saved as Record<string, unknown>;
  if (
    record.version !== 1 ||
    !Array.isArray(record.drafts) ||
    record.drafts.length > draftLimits.drafts
  )
    return undefined;
  const drafts: Draft[] = [];
  for (const entry of record.drafts) {
    if (!entry || typeof entry !== "object") return undefined;
    const { id, name, copy, width } = entry as Record<string, unknown>;
    const draft = draftFrom(id, name, copy, width);
    if (typeof draft === "string") return undefined;
    drafts.push(draft);
  }
  const workspace = workspaceFrom(record.activeId, drafts);
  return typeof workspace === "string" ? undefined : workspace;
}

/**
 * Adds a draft of `tree` and opens it. The new draft has no history, its
 * whole composition selected, and the width `newDraftWidth`. Every draft
 * already in `workspace` is kept as it is: this is how a snapshot, or a
 * composition handed over from a lesson, becomes editable without
 * replacing anything. With no workspace, or one with no drafts, the draft
 * is the only one.
 *
 * Throws a `DraftError` when there are already `draftLimits.drafts`, when
 * `id` is taken or `name` too long, when `tree` is not a composition a
 * working copy accepts, or when the workspace would be too large.
 */
export function createDraft(
  workspace: DraftWorkspace | undefined,
  tree: Composition,
  name: string,
  id: string,
): DraftWorkspace {
  const draft = made(
    draftFrom(
      id,
      name,
      { model: tree, chosen: ["0"], undo: [] },
      newDraftWidth,
    ),
  );
  return made(workspaceFrom(id, [...(workspace?.drafts ?? []), draft]));
}

/**
 * Replaces one draft's working copy and width, and its name when one is
 * given. Every other draft is the same object as before, and the open
 * draft stays open.
 *
 * Throws a `DraftError` when no draft has that `id`, when `copy` is not a
 * working copy or `name` is too long, or when the workspace would be too
 * large. A refused change leaves `workspace` valid, as it was.
 */
export function updateDraft(
  workspace: DraftWorkspace,
  id: string,
  copy: WorkingCopy,
  width: number,
  name?: string,
): DraftWorkspace {
  const current = workspace.drafts.find((draft) => draft.id === id);
  if (!current) throw new DraftError("unknown-draft");
  const next = made(draftFrom(id, name ?? current.name, copy, width));
  return made(
    workspaceFrom(
      workspace.activeId,
      workspace.drafts.map((draft) => (draft === current ? next : draft)),
    ),
  );
}

/**
 * Opens another draft. No draft changes. Opening the draft that is already
 * open returns `workspace` itself.
 *
 * Throws a `DraftError` when no draft has that `id`.
 */
export function activateDraft(
  workspace: DraftWorkspace,
  id: string,
): DraftWorkspace {
  if (id === workspace.activeId) return workspace;
  return made(workspaceFrom(id, workspace.drafts));
}

/**
 * Takes the draft with that `id` out of `workspace` and returns it as a
 * removal. Every other draft is the same object as before, in the same
 * order.
 *
 * Removing a draft that is not open leaves the open draft open. Removing
 * the open draft opens the one that followed it, else the one before it.
 * Removing the last draft leaves a workspace with no drafts and none open;
 * no blank draft is made to take its place.
 *
 * Throws a `DraftError` when no draft has that `id`.
 */
export function removeDraft(
  workspace: DraftWorkspace,
  id: string,
): { readonly workspace: DraftWorkspace; readonly removed: DraftRemoval } {
  const index = workspace.drafts.findIndex((draft) => draft.id === id);
  const draft = workspace.drafts[index];
  if (!draft) throw new DraftError("unknown-draft");
  const drafts = workspace.drafts.filter((other) => other !== draft);
  const activeId =
    workspace.activeId === id
      ? ((drafts[index] ?? drafts[index - 1])?.id ?? null)
      : workspace.activeId;
  return {
    workspace: made(workspaceFrom(activeId, drafts)),
    removed: { draft, index },
  };
}

/**
 * Reads a saved removal: a draft, read as a workspace reads one, and the
 * position it had. Anything else is `undefined`, including a draft too
 * large for any workspace to take back. The result is built afresh from
 * known fields.
 */
export function restoreDraftRemoval(saved: unknown): DraftRemoval | undefined {
  if (!saved || typeof saved !== "object") return undefined;
  const { draft: entry, index } = saved as Record<string, unknown>;
  if (
    !entry ||
    typeof entry !== "object" ||
    typeof index !== "number" ||
    !Number.isInteger(index) ||
    index < 0 ||
    index >= draftLimits.drafts
  )
    return undefined;
  const { id, name, copy, width } = entry as Record<string, unknown>;
  const draft = draftFrom(id, name, copy, width);
  if (typeof draft === "string") return undefined;
  return typeof workspaceFrom(draft.id, [draft]) === "string"
    ? undefined
    : { draft, index };
}

/**
 * Puts a removed draft back and opens it: the same identity, name, working
 * copy with its selection and Undo history, and width. No other draft
 * changes, whatever has happened to them since the removal.
 *
 * It returns to the position it had, among whichever drafts are there now,
 * or to the end when there are now fewer. With no workspace, it is the only
 * draft.
 *
 * Throws a `DraftError` when a draft with that identity is already there,
 * when there are already `draftLimits.drafts`, or when the workspace would
 * be too large. A refusal changes nothing, so the removal can be tried
 * again later.
 */
export function restoreRemovedDraft(
  workspace: DraftWorkspace | undefined,
  removed: DraftRemoval,
): DraftWorkspace {
  const { id, name, copy, width } = removed.draft;
  const draft = made(draftFrom(id, name, copy, width));
  const current = workspace?.drafts ?? [];
  if (current.some((other) => other.id === draft.id))
    throw new DraftError("already-restored");
  const index = Number.isInteger(removed.index)
    ? Math.min(Math.max(removed.index, 0), current.length)
    : current.length;
  const restored = workspaceFrom(draft.id, [
    ...current.slice(0, index),
    draft,
    ...current.slice(index),
  ]);
  if (typeof restored === "string")
    throw new DraftError(restored, restoringProblems[restored]);
  return restored;
}
