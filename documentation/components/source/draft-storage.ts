import {
  activateDraft,
  createDraft,
  draftLimits,
  restoreDraftWorkspace,
  removeDraft,
  restoreDraftRemoval,
  restoreRemovedDraft,
  updateDraft,
  type Draft,
  type DraftWorkspace,
  type DraftRemoval,
} from "./drafts.ts";
import type { Composition } from "./composition.ts";

export const draftStorageKey = "axiomatic-drafts:v1";
export const draftRemovalKey = "axiomatic-last-removal:v1";
export class DraftConflict extends Error {}
export class DraftRemovalReplacement extends Error {}

export interface RemovalStorage {
  read(): string | null;
  write(value: string | null): void;
}
const browserRemoval: RemovalStorage = {
  read: () => sessionStorage.getItem(draftRemovalKey),
  write: (value) => {
    if (value === null) sessionStorage.removeItem(draftRemovalKey);
    else sessionStorage.setItem(draftRemovalKey, value);
  },
};

export interface DraftStorageEnvironment {
  read(): string | null;
  write(value: string): void;
  exclusive<T>(action: () => T): Promise<T>;
}
const browserStorage: DraftStorageEnvironment = {
  read: () => localStorage.getItem(draftStorageKey),
  write: (value) => localStorage.setItem(draftStorageKey, value),
  exclusive: (action) => {
    if (!navigator.locks)
      return Promise.reject(
        new Error(
          "Saving drafts needs HTTPS or localhost in a modern browser.",
        ),
      );
    return navigator.locks.request(draftStorageKey, action);
  },
};

/** Native locks serialize the read/check/write across tabs. Comparing the
 * saved draft with our base prevents a stale editor from overwriting it. */
export class DraftStorage {
  private readonly environment: DraftStorageEnvironment;
  private readonly removal: RemovalStorage;
  constructor(
    environment: DraftStorageEnvironment = browserStorage,
    removal: RemovalStorage = browserRemoval,
  ) {
    this.environment = environment;
    this.removal = removal;
  }
  read(): DraftWorkspace | undefined {
    const raw = this.environment.read();
    if (raw === null) return undefined;
    if (raw.length > draftLimits.characters)
      throw new Error("Stored drafts are too large to open.");
    const value = restoreDraftWorkspace(JSON.parse(raw));
    if (!value)
      throw new Error(
        "Stored drafts could not be read. They have been left unchanged.",
      );
    return value;
  }

  private write(value: DraftWorkspace): DraftWorkspace {
    const restored = restoreDraftWorkspace(value);
    if (!restored)
      throw new Error(
        "These drafts are too large to save. Your previous saved work is unchanged.",
      );
    this.environment.write(JSON.stringify(restored));
    return restored;
  }

  private locked<T>(action: () => T): Promise<T> {
    return this.environment.exclusive(action);
  }

  create(
    tree: Composition,
    name: string,
    state?: Pick<Draft, "copy" | "width">,
  ): Promise<DraftWorkspace> {
    return this.locked(() => {
      const workspace = this.read();
      const names = new Set(workspace?.drafts.map((draft) => draft.name));
      const stem = (name.trim() || "Untitled composition").slice(0, 72);
      let unique = stem;
      for (let index = 2; names.has(unique); index++)
        unique = `${stem} (${index})`;
      const id = crypto.randomUUID();
      let next = createDraft(workspace, tree, unique, id);
      if (state) next = updateDraft(next, id, state.copy, state.width, unique);
      return this.write(next);
    });
  }

  save(draft: Draft, base: Draft | undefined): Promise<DraftWorkspace> {
    return this.locked(() => {
      const workspace = this.read();
      const current = workspace?.drafts.find((item) => item.id === draft.id);
      if (
        !workspace ||
        !base ||
        JSON.stringify(current) !== JSON.stringify(base)
      )
        throw new DraftConflict(
          current
            ? "This draft changed in another tab. Your edits here are still available."
            : "This draft was removed in another tab. Your edits here are still available to save as a new draft.",
        );
      return this.write(
        updateDraft(workspace, draft.id, draft.copy, draft.width, draft.name),
      );
    });
  }

  activate(id: string): Promise<DraftWorkspace> {
    return this.locked(() => {
      const workspace = this.read();
      if (!workspace)
        throw new Error("This saved draft is no longer available.");
      return this.write(activateDraft(workspace, id));
    });
  }

  lastRemoval(): DraftRemoval | undefined {
    const raw = this.removal.read();
    if (raw === null) return undefined;
    if (raw.length > draftLimits.characters)
      throw new Error("The removed draft could not be read.");
    const value: unknown = JSON.parse(raw);
    const restored =
      value &&
      typeof value === "object" &&
      "version" in value &&
      value.version === 1
        ? restoreDraftRemoval(value)
        : undefined;
    if (!restored) throw new Error("The removed draft could not be read.");
    // A successful restoration is durable even if clearing its receipt failed.
    let workspace: DraftWorkspace | undefined;
    try {
      workspace = this.read();
    } catch {
      // The receipt is readable even if durable storage is not. Restoration
      // still refuses to replace unreadable work inside the locked transaction.
    }
    if (workspace?.drafts.some((draft) => draft.id === restored.draft.id))
      return undefined;
    return restored;
  }

  remove(base: Draft, replaceBlockedRemoval = false): Promise<DraftWorkspace> {
    return this.locked(() => {
      const workspace = this.read();
      const current = workspace?.drafts.find((draft) => draft.id === base.id);
      if (!workspace || JSON.stringify(current) !== JSON.stringify(base))
        throw new DraftConflict(
          current
            ? "This draft changed in another tab. Your draft has not been removed."
            : "This draft was already removed in another tab. Your work here is still available.",
        );
      const result = removeDraft(workspace, base.id);
      let previousRemoval: DraftRemoval | undefined;
      try {
        previousRemoval = this.lastRemoval();
      } catch {
        if (!replaceBlockedRemoval)
          throw new DraftRemovalReplacement(
            `The previous Undo removal entry cannot be read. Removing “${base.name || "Untitled composition"}” will replace it.`,
          );
      }
      if (previousRemoval && !replaceBlockedRemoval) {
        try {
          restoreRemovedDraft(workspace, previousRemoval);
        } catch {
          throw new DraftRemovalReplacement(
            `“${previousRemoval.draft.name || "Untitled composition"}” cannot currently be restored. Removing “${base.name || "Untitled composition"}” will replace its Undo removal entry.`,
          );
        }
      }
      const previous = this.removal.read();
      // Save the recovery copy before deleting anything durable. A refusal
      // leaves both the workspace and the previous removal unchanged.
      this.removal.write(JSON.stringify({ version: 1, ...result.removed }));
      try {
        return this.write(result.workspace);
      } catch (error) {
        try {
          this.removal.write(previous);
        } catch (rollbackError) {
          throw new AggregateError(
            [error, rollbackError],
            "The draft was not removed. Storage also refused to recover the previous Undo removal entry.",
          );
        }
        throw error;
      }
    });
  }

  undoRemoval(): Promise<DraftWorkspace> {
    return this.locked(() => {
      const removed = this.lastRemoval();
      if (!removed)
        throw new Error("There is no removed draft to restore in this tab.");
      const workspace = this.write(restoreRemovedDraft(this.read(), removed));
      try {
        this.removal.write(null);
      } catch {
        // The saved draft is authoritative; lastRemoval ignores its old receipt.
      }
      return workspace;
    });
  }
}
