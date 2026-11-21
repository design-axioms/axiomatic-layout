import styles from "./playground-page.css";
import primitiveStyles from "./primitives.css";
import { Stack, declaration, type Composition } from "./composition.ts";
import { AxiomaticPlayground, type PlaygroundState } from "./playground.ts";
import { mountComposition, type MountedComposition } from "./primitives.ts";
import { decodeSnapshot, encodeSnapshot } from "./snapshot.ts";
import {
  type Draft,
  type DraftWorkspace,
  type DraftRemoval,
} from "./drafts.ts";
import {
  DraftConflict,
  DraftRemovalReplacement,
  DraftStorage,
  draftStorageKey,
} from "./draft-storage.ts";
import { playgroundURL } from "./playground-link.ts";
import { startWorkingCopy } from "./working-copy.ts";

const message = (error: unknown) =>
  error instanceof Error ? error.message : "The action could not be completed.";
const markup = `
<section class="editor-view" hidden>
  <div class="workspace-tools">
    <div class="draft-heading"><label class="draft-title"><span class="sr-only">Draft name</span><input maxlength="80" autocomplete="off" placeholder="Untitled composition"></label><p class="save-status" role="status" aria-live="polite"></p></div>
    <label class="draft-picker">Your drafts<select aria-label="Your drafts"></select></label>
    <div class="actions"><button class="new-draft">New draft</button><button class="share">Copy snapshot link</button><button class="remove-draft">Remove draft</button></div>
  </div>
  <div class="removal" hidden><p class="removal-note" role="status"></p><button class="undo-removal">Undo removal</button></div>
  <p class="removal-error" role="alert" hidden></p>
  <div class="replace-removal" hidden><div class="actions"><button class="confirm-removal">Remove and replace Undo</button><button class="cancel-removal">Keep drafts as they are</button></div></div>
  <div class="recovery" hidden><p class="problem" role="alert"></p><div class="actions"><button class="retry">Retry save</button><button class="fork">Save mine as a new draft</button><button class="reload-draft">Load saved draft</button></div></div>
  <div class="link-result" hidden><p class="link-message" role="status"></p><label><span class="sr-only">Snapshot link</span><input class="snapshot-link" readonly></label><p class="local-note"></p></div>
  <div class="editor-host"></div>
  <p class="empty-workspace" hidden>No drafts here yet. Create a new draft, or undo your last removal.</p>
  <p class="privacy">Drafts are saved in this browser. A snapshot link contains a fixed copy of its composition; anyone with the link can open it.</p>
</section>
<section class="snapshot-view" hidden>
  <h1>Composition snapshot</h1>
  <p class="snapshot-note">A fixed copy, adapting to the space on this page. Editing a copy keeps the snapshot and your existing drafts intact.</p>
  <div class="actions"><button class="edit-copy">Edit a copy</button><button class="return-drafts">Return to my drafts</button></div>
  <p class="snapshot-error" role="alert" hidden></p>
  <div class="snapshot-surface"></div>
  <details class="snapshot-source"><summary>See the composition</summary><pre></pre></details>
</section>`;

/** Owns documents and persistence. The editor continues to own tree edits;
 * the snapshot uses the same bare runtime in one native, fluid slot. */
class AxiomaticWorkspace extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });
  private readonly storage = new DraftStorage();
  private workspace: DraftWorkspace | undefined;
  private active: Draft | undefined;
  private base: Draft | undefined;
  private editor: AxiomaticPlayground | undefined;
  private pending: Draft | undefined;
  private saving: Promise<void> | undefined;
  private blocked = false;
  private transitioning = false;
  private routeRevision = 0;
  private editorRevision = 0;
  private snapshot: Composition | undefined;
  private mounted: MountedComposition | undefined;
  private removed: DraftRemoval | undefined;
  private removalChange: Promise<void> | undefined;
  private abort = new AbortController();

  connectedCallback() {
    this.root.innerHTML = `<style>${styles}${primitiveStyles}</style>${markup}`;
    const on = (
      selector: string,
      event: string,
      callback: () => void | Promise<void>,
    ) =>
      this.get(selector).addEventListener(
        event,
        () => {
          void callback();
        },
        { signal: this.abort.signal },
      );
    on(".new-draft", "click", () =>
      this.newDraft(Stack(), "Untitled composition"),
    );
    on(".remove-draft", "click", () => this.changeRemoval(false));
    on(".undo-removal", "click", () => this.changeRemoval(true));
    on(".confirm-removal", "click", () => this.changeRemoval(false, true));
    on(".cancel-removal", "click", () => {
      this.removalError();
      this.get(".remove-draft").focus();
    });
    on(".draft-picker select", "change", () =>
      this.chooseDraft(
        this.get<HTMLSelectElement>(".draft-picker select").value,
      ),
    );
    on(".draft-title input", "input", () => {
      if (!this.active || this.editor?.isMoving) return;
      this.active = {
        ...this.active,
        name: this.get<HTMLInputElement>(".draft-title input").value,
      };
      this.queue(this.active);
    });
    on(".share", "click", () => this.share());
    on(".retry", "click", async () => {
      if (!this.base && this.active) {
        await this.retryUnsaved();
        return;
      }
      this.blocked = false;
      this.get(".recovery").hidden = true;
      if (this.active) this.queue(this.active);
      await this.flush();
    });
    on(
      ".fork",
      "click",
      () =>
        this.active &&
        this.newDraft(
          this.active.copy.model,
          `${this.active.name || "Untitled"} copy`,
          true,
          this.routeRevision,
          this.active,
        ),
    );
    on(".reload-draft", "click", () => this.loadSaved());
    on(
      ".edit-copy",
      "click",
      () =>
        this.snapshot && this.newDraft(this.snapshot, "Snapshot copy", true),
    );
    on(".return-drafts", "click", () => this.returnToDrafts());
    window.addEventListener(
      "hashchange",
      () => {
        void this.route();
      },
      { signal: this.abort.signal },
    );
    window.addEventListener(
      "storage",
      (event) => {
        if (event.key === draftStorageKey) this.observeStorage();
      },
      { signal: this.abort.signal },
    );
    window.addEventListener(
      "beforeunload",
      (event) => {
        if (this.pending || this.saving || this.blocked) {
          event.preventDefault();
          event.returnValue = "";
        }
      },
      { signal: this.abort.signal },
    );
    void this.route();
  }

  disconnectedCallback() {
    this.abort.abort();
    this.mounted?.dispose();
  }
  private get<T extends HTMLElement = HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing workspace control ${selector}`);
    return element;
  }
  private status(value: string) {
    this.get(".save-status").textContent = value;
  }
  private controls() {
    const moving = !!this.editor?.isMoving;
    if (this.editor) this.editor.inert = this.transitioning;
    this.get<HTMLSelectElement>(".draft-picker select").disabled =
      moving ||
      this.blocked ||
      !!this.saving ||
      this.transitioning ||
      !this.workspace?.drafts.length;
    this.get<HTMLButtonElement>(".new-draft").disabled =
      moving || this.blocked || !!this.saving || this.transitioning;
    this.get<HTMLInputElement>(".draft-title input").disabled =
      moving || !this.active || this.transitioning;
    this.get<HTMLButtonElement>(".share").disabled =
      moving || !this.active || this.transitioning;
    this.get<HTMLButtonElement>(".remove-draft").disabled =
      !this.base ||
      moving ||
      this.blocked ||
      !!this.saving ||
      this.transitioning;
    this.get<HTMLButtonElement>(".undo-removal").disabled =
      !this.removed ||
      moving ||
      this.blocked ||
      !!this.saving ||
      this.transitioning;
    this.get<HTMLButtonElement>(".confirm-removal").disabled =
      !this.base ||
      moving ||
      this.blocked ||
      !!this.saving ||
      this.transitioning;
    this.get<HTMLButtonElement>(".edit-copy").disabled =
      !this.snapshot || this.blocked || this.transitioning;
    this.get<HTMLButtonElement>(".return-drafts").disabled = this.transitioning;
  }
  private problem(error: unknown) {
    this.blocked = true;
    this.status("Not saved — your edits are still here.");
    this.get(".problem").textContent = message(error);
    this.get(".recovery").hidden = false;
    this.get<HTMLButtonElement>(".reload-draft").disabled = !this.base;
    this.get(".reload-draft").textContent =
      this.base &&
      !this.workspace?.drafts.some((draft) => draft.id === this.base!.id)
        ? "Close removed draft"
        : "Load saved draft";
    this.get(".retry").hidden = error instanceof DraftConflict;
    this.controls();
  }

  private list() {
    const select = this.get<HTMLSelectElement>(".draft-picker select");
    const drafts = [...(this.workspace?.drafts ?? [])];
    if (this.active && !drafts.some((draft) => draft.id === this.active!.id))
      drafts.push(this.active);
    select.replaceChildren(
      ...drafts.map((draft) => {
        const option = document.createElement("option");
        option.value = draft.id;
        option.textContent = draft.name || "Untitled composition";
        return option;
      }),
    );
    if (!this.active && drafts.length) {
      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Choose a draft";
      placeholder.disabled = true;
      select.prepend(placeholder);
    }
    select.value = this.active?.id ?? "";
  }

  private open(draft: Draft, persisted = true) {
    this.editorRevision++;
    this.removalError();
    this.active = draft;
    this.base = persisted ? draft : undefined;
    this.pending = undefined;
    this.blocked = false;
    this.get(".recovery").hidden = true;
    this.get(".link-result").hidden = true;
    this.get(".empty-workspace").hidden = true;
    this.get<HTMLInputElement>(".draft-title input").value = draft.name;
    this.list();
    let mounting = true;
    const editor = document.createElement(
      "axiomatic-playground",
    ) as AxiomaticPlayground;
    editor.setAttribute("standalone", "");
    editor.initialState = { copy: draft.copy, width: draft.width };
    editor.addEventListener("composition-change", (event) => {
      if (mounting || this.editor !== editor || !this.active) return;
      const state = (event as CustomEvent<PlaygroundState>).detail;
      this.active = { ...this.active, copy: state.copy, width: state.width };
      this.queue(this.active);
    });
    editor.addEventListener("composition-interaction", () => this.controls());
    this.editor = editor;
    this.get(".editor-host").replaceChildren(editor);
    mounting = false;
    this.get(".editor-view").hidden = false;
    this.get(".snapshot-view").hidden = true;
    this.mounted?.dispose();
    this.mounted = undefined;
    this.status(
      persisted
        ? "Saved in this browser"
        : "Not saved — your edits are still here.",
    );
    this.controls();
  }

  private emptyWorkspace() {
    this.editorRevision++;
    this.removalError();
    this.editor = undefined;
    this.active = undefined;
    this.base = undefined;
    this.pending = undefined;
    this.blocked = false;
    this.get(".editor-host").replaceChildren();
    this.get<HTMLInputElement>(".draft-title input").value = "";
    this.get(".recovery").hidden = true;
    this.get(".link-result").hidden = true;
    this.get(".empty-workspace").hidden = false;
    this.get(".editor-view").hidden = false;
    this.get(".snapshot-view").hidden = true;
    this.mounted?.dispose();
    this.mounted = undefined;
    this.list();
    this.status("No saved drafts");
    history.replaceState(null, "", location.pathname);
    this.controls();
  }

  private removalError(error?: unknown) {
    this.get(".removal-error").hidden = !error;
    this.get(".removal-error").textContent = error ? message(error) : "";
    this.get(".replace-removal").hidden = !(
      error instanceof DraftRemovalReplacement
    );
  }

  private refreshRemoval() {
    try {
      this.removed = this.storage.lastRemoval();
      this.get(".removal").hidden = !this.removed;
      this.get(".removal-note").textContent = this.removed
        ? `Removed “${this.removed.draft.name || "Untitled composition"}”. Undo removal is available in this tab until you remove another draft or close the tab.`
        : "";
      this.get(".empty-workspace").textContent =
        this.workspace?.drafts.length && !this.editor
          ? "Choose a draft above to continue working."
          : this.removed
            ? "No saved drafts. Create a new draft, or undo your last removal."
            : "No saved drafts. Create a new draft to begin.";
    } catch (error) {
      this.removed = undefined;
      this.get(".removal").hidden = true;
      if (this.get(".removal-error").hidden) this.removalError(error);
    }
    this.controls();
  }

  private openWorkspace(workspace: DraftWorkspace) {
    this.workspace = workspace;
    const draft = workspace.drafts.find(
      (item) => item.id === workspace.activeId,
    );
    if (draft) {
      this.open(draft);
      history.replaceState(null, "", `#draft=${draft.id}`);
    } else this.emptyWorkspace();
    this.refreshRemoval();
  }

  private changeRemoval(
    restore: boolean,
    replaceBlockedRemoval = false,
  ): Promise<void> | undefined {
    if (
      this.removalChange ||
      this.blocked ||
      this.transitioning ||
      this.editor?.isMoving ||
      (restore ? !this.removed : !this.base)
    )
      return;
    const operation = this.performRemoval(restore, replaceBlockedRemoval);
    this.removalChange = operation;
    void operation.finally(() => {
      this.removalChange = undefined;
    });
    return operation;
  }

  private async performRemoval(
    restore: boolean,
    replaceBlockedRemoval: boolean,
  ) {
    const revision = this.routeRevision;
    this.transitioning = true;
    this.controls();
    this.removalError();
    let completed = false;
    let failed = false;
    try {
      await this.flush();
      if (this.blocked || revision !== this.routeRevision) return;
      const workspace = restore
        ? await this.storage.undoRemoval()
        : await this.storage.remove(this.base!, replaceBlockedRemoval);
      // Navigation waits for this transaction, then reads the resulting state.
      // It owns the view and focus if the author navigated in the meantime.
      if (revision !== this.routeRevision) {
        this.workspace = workspace;
        this.editorRevision++;
        this.editor = undefined;
        this.active = undefined;
        this.base = undefined;
        this.pending = undefined;
        this.blocked = false;
        this.get(".editor-host").replaceChildren();
        return;
      }
      this.openWorkspace(workspace);
      if (restore) this.status("Draft restored. Saved in this browser.");
      completed = true;
    } catch (error) {
      if (revision !== this.routeRevision) return;
      failed = true;
      if (!(error instanceof DraftConflict)) this.removalError(error);
      this.observeStorage();
      this.refreshRemoval();
    } finally {
      this.transitioning = false;
      this.controls();
      if (completed && revision === this.routeRevision)
        this.get(restore ? ".draft-title input" : ".undo-removal").focus();
      else if (failed && revision === this.routeRevision)
        this.get(
          !this.get(".replace-removal").hidden
            ? ".cancel-removal"
            : this.blocked
              ? ".fork"
              : restore
                ? ".undo-removal"
                : ".remove-draft",
        ).focus();
    }
  }

  private queue(draft: Draft) {
    if (JSON.stringify(draft) === JSON.stringify(this.base) && !this.pending)
      return;
    this.pending = draft;
    if (this.blocked || this.saving) return;
    this.status("Saving…");
    this.saving = this.drain().finally(() => {
      this.saving = undefined;
      this.controls();
      if (!this.blocked) this.observeStorage();
      if (this.pending && !this.blocked) this.queue(this.pending);
    });
    this.controls();
  }
  private async drain() {
    const revision = this.editorRevision;
    while (this.pending && !this.blocked) {
      const draft = this.pending;
      this.pending = undefined;
      try {
        const workspace = await this.storage.save(draft, this.base);
        if (revision !== this.editorRevision) return;
        this.workspace = workspace;
        this.base = workspace.drafts.find((item) => item.id === draft.id);
        this.list();
        if (!this.pending) this.status("Saved in this browser");
      } catch (error) {
        if (revision !== this.editorRevision) return;
        this.pending ??= draft;
        this.problem(error);
      }
    }
  }
  private async flush() {
    this.editor?.finishEditing();
    await this.saving;
  }

  private async retryUnsaved() {
    if (!this.active || this.transitioning) return;
    const draft = this.active;
    this.transitioning = true;
    this.controls();
    try {
      this.workspace = await this.storage.create(
        draft.copy.model,
        draft.name,
        draft,
      );
      const saved = this.workspace.drafts.find(
        (item) => item.id === this.workspace!.activeId,
      )!;
      this.open(saved);
      history.replaceState(null, "", `#draft=${saved.id}`);
    } catch (error) {
      this.problem(error);
    } finally {
      this.transitioning = false;
      this.controls();
    }
  }

  private async newDraft(
    tree: Composition,
    name: string,
    recovery = false,
    revision = this.routeRevision,
    state?: Pick<Draft, "copy" | "width">,
  ) {
    if (this.blocked && this.editor && tree !== this.active?.copy.model) {
      this.showSnapshot(
        tree,
        "Your current draft has unsaved changes. Return to your drafts to save them before editing this copy.",
      );
      return;
    }
    if (
      this.transitioning ||
      this.editor?.isMoving ||
      (this.blocked && !recovery)
    )
      return;
    this.transitioning = true;
    this.controls();
    try {
      await this.flush();
      if (revision !== this.routeRevision || (this.blocked && !recovery))
        return;
      if (this.blocked && this.editor && tree !== this.active?.copy.model) {
        this.showSnapshot(
          tree,
          "Your current draft has unsaved changes. Return to your drafts to save them before editing this copy.",
        );
        return;
      }
      const created = await this.storage.create(tree, name.slice(0, 80), state);
      if (revision !== this.routeRevision) return;
      this.workspace = created;
      const draft = this.workspace.drafts.find(
        (item) => item.id === this.workspace!.activeId,
      )!;
      this.open(draft);
      history.replaceState(null, "", `#draft=${draft.id}`);
      this.get<HTMLInputElement>(".draft-title input").focus();
    } catch (error) {
      if (revision !== this.routeRevision) return;
      // Keep imported work visible and its fragment recoverable if persistence fails.
      if (!this.editor || (recovery && !this.blocked))
        this.open(
          {
            id: crypto.randomUUID(),
            name,
            copy: { ...startWorkingCopy(tree), chosen: ["0"] },
            width: 600,
          },
          false,
        );
      this.problem(error);
    } finally {
      this.transitioning = false;
      this.controls();
    }
  }
  private async chooseDraft(id: string, discard = false) {
    if (this.transitioning || this.editor?.isMoving) return;
    const revision = this.routeRevision;
    this.transitioning = true;
    this.controls();
    try {
      if (discard) await this.saving;
      else {
        await this.flush();
        if (this.blocked) return;
      }
      if (revision !== this.routeRevision) return;
      const workspace = await this.storage.activate(id);
      if (revision !== this.routeRevision) return;
      this.workspace = workspace;
      const draft = workspace.drafts.find((item) => item.id === id)!;
      this.open(draft);
      history.replaceState(null, "", `#draft=${id}`);
    } catch (error) {
      this.problem(error);
    } finally {
      this.transitioning = false;
      this.controls();
    }
  }

  private async loadSaved() {
    if (!this.base || this.transitioning || this.editor?.isMoving) return;
    const revision = this.routeRevision;
    const base = this.base;
    try {
      await this.saving;
      if (revision !== this.routeRevision) return;
      const workspace = this.storage.read();
      if (workspace?.drafts.some((draft) => draft.id === base.id)) {
        await this.chooseDraft(base.id, true);
      } else {
        this.openWorkspace(
          workspace ?? { version: 1, activeId: null, drafts: [] },
        );
        this.get(this.active ? ".draft-title input" : ".new-draft").focus();
      }
    } catch (error) {
      this.problem(error);
    }
  }

  private observeStorage() {
    try {
      const workspace = this.storage.read();
      this.workspace = workspace;
      if (this.base && !this.saving) {
        const current = workspace?.drafts.find(
          (draft) => draft.id === this.base!.id,
        );
        if (JSON.stringify(current) !== JSON.stringify(this.base)) {
          this.problem(
            new DraftConflict(
              current
                ? "This draft changed in another tab. Keep your edits as a new draft, or load the saved version."
                : "This draft was removed in another tab. Save your work as a new draft, or close this editor to return to saved drafts.",
            ),
          );
          return;
        }
      }
      this.workspace = workspace;
      this.list();
      if (
        !this.editor &&
        !this.get(".editor-view").hidden &&
        workspace?.drafts.length
      ) {
        this.status("Choose a saved draft, or create a new one.");
      }
      this.refreshRemoval();
    } catch (error) {
      if (this.editor) this.problem(error);
    }
  }

  private async route() {
    const revision = ++this.routeRevision;
    const hash = location.hash.slice(1);
    await this.removalChange;
    if (revision !== this.routeRevision) return;
    this.removalError();
    this.refreshRemoval();
    this.editor?.prepareToLeave();
    await this.flush();
    if (revision !== this.routeRevision) return;
    if (hash.startsWith("snapshot=") || hash.startsWith("edit=")) {
      try {
        const tree = decodeSnapshot(hash.slice(hash.indexOf("=") + 1));
        if (hash.startsWith("edit="))
          await this.newDraft(tree, "From the guide", true, revision);
        else this.showSnapshot(tree);
      } catch (error) {
        this.showSnapshot(undefined, message(error));
      }
      return;
    }
    if (this.editor && !hash.startsWith("draft=")) {
      this.observeStorage();
      if (this.active && this.base)
        history.replaceState(null, "", `#draft=${this.active.id}`);
      this.get(".editor-view").hidden = false;
      this.get(".snapshot-view").hidden = true;
      this.mounted?.dispose();
      this.mounted = undefined;
      return;
    }
    if (this.editor && this.blocked) {
      this.get(".editor-view").hidden = false;
      this.get(".snapshot-view").hidden = true;
      return;
    }
    try {
      this.workspace = this.storage.read();
      const id = hash.startsWith("draft=")
        ? hash.slice(6)
        : this.workspace?.activeId;
      const draft = this.workspace?.drafts.find((item) => item.id === id);
      if (draft) {
        this.open(draft);
        history.replaceState(null, "", `#draft=${draft.id}`);
      } else if (this.workspace?.drafts.length)
        this.openWorkspace(this.workspace);
      else if (this.workspace) this.emptyWorkspace();
      else await this.newDraft(Stack(), "Untitled composition");
    } catch (error) {
      this.open(
        {
          id: crypto.randomUUID(),
          name: "Untitled composition",
          copy: { ...startWorkingCopy(Stack()), chosen: ["0"] },
          width: 600,
        },
        false,
      );
      this.problem(error);
    }
  }
  private showSnapshot(tree: Composition | undefined, error?: string) {
    this.snapshot = tree;
    this.get(".editor-view").hidden = true;
    this.get(".snapshot-view").hidden = false;
    this.get(".snapshot-error").hidden = !error;
    this.get(".snapshot-error").textContent = error ?? "";
    this.get<HTMLButtonElement>(".edit-copy").disabled = !tree || this.blocked;
    this.get(".snapshot-source").hidden = !tree;
    this.get(".snapshot-surface").hidden = !tree;
    this.mounted?.dispose();
    this.mounted = undefined;
    this.get(".snapshot-surface").replaceChildren();
    if (tree) {
      this.mounted = mountComposition(this.get(".snapshot-surface"), tree);
      this.get(".snapshot-source pre").textContent = declaration(tree)
        .map((line) => line.tokens.map((token) => token.text).join(""))
        .join("\n");
    }
  }
  private async returnToDrafts() {
    history.replaceState(null, "", location.pathname);
    await this.route();
  }
  private async share() {
    if (!this.editor || this.editor.isMoving) return;
    const state = this.editor.finishEditing();
    if (!state) return;
    try {
      const link = playgroundURL(
        "snapshot",
        encodeSnapshot(state.copy.model),
      ).href;
      const field = this.get<HTMLInputElement>(".snapshot-link");
      field.value = link;
      field.parentElement!.hidden = false;
      this.get(".link-result").hidden = false;
      this.get(".local-note").textContent = [
        "localhost",
        "127.0.0.1",
        "[::1]",
      ].includes(location.hostname)
        ? "This link works on this computer while the local server is running. Sharing across devices will be available after hosting."
        : "This is a fixed copy. Later edits to your draft leave this link unchanged.";
      try {
        await navigator.clipboard.writeText(link);
        this.get(".link-message").textContent = "Snapshot link copied.";
      } catch {
        this.get(".link-message").textContent =
          "Copy this link to share the snapshot.";
        field.focus();
        field.select();
      }
    } catch (error) {
      this.get(".link-result").hidden = false;
      this.get(".link-message").textContent = message(error);
      this.get<HTMLInputElement>(".snapshot-link").value = "";
      this.get<HTMLInputElement>(".snapshot-link").parentElement!.hidden = true;
      this.get(".local-note").textContent = "";
    }
  }
}
if (!customElements.get("axiomatic-workspace"))
  customElements.define("axiomatic-workspace", AxiomaticWorkspace);
