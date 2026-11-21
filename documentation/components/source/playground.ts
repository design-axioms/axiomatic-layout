/**
 * "Compose your own": an empty composition or a working copy of an exercise
 * that its author can rewrite, add to, rearrange and move members within.
 *
 * There is one composition, one selection, one declaration and one history.
 * Two previews show that composition at once, each in a host of its own
 * size. The hosts are demonstration slots sized by CSS; nothing in the
 * composition knows their widths.
 *
 * The editor has two faces over that one working copy. The same edits,
 * rewording and moves are behind both.
 *
 * - In a lesson (`source-exercise`) it is the strip the lesson teaches. Every
 *   control stays in place, each click builds on the selection, and the
 *   declaration is where a group is chosen. The first composition is empty
 *   or copied, on request, from the live exercise. After that it is saved on
 *   its own and is replaced only when its author asks, as one undoable edit.
 * - On its own page (`standalone`) it is a workbench for someone who has not
 *   read the lesson. A click selects one thing. An outline, or the
 *   declaration in its place, lists every node. An inspector names the
 *   selection and offers what applies to it. The page supplies the working
 *   copy and saves it.
 */
import styles from "./example.css";
import { encodeSnapshot } from "./snapshot.ts";
import { playgroundURL } from "./playground-link.ts";
import primitiveStyles from "./primitives.css";
import inspectionStyles from "./inspection.css";
import palette from "./composition-palette.generated.css";
import playgroundStyles from "./playground.css";
import outlineStyles from "./outline-panel.css";
import {
  arrangeGroup,
  arrangementContracts,
  arrangements,
  isArrangement,
} from "./arrangement.ts";
import {
  example,
  exampleNames,
  Stack,
  type Composition,
  type Primitive,
} from "./composition.ts";
import { chooseMember } from "./composition-editing.ts";
import { CompositionPreview } from "./composition-preview.ts";
import { atPath, parentPath } from "./grouping.ts";
import { OutlinePanel } from "./outline-panel.ts";
import { SourcePanel } from "./source-panel.ts";
import { selectionAfter, subjectOf } from "./workbench-selection.ts";
import {
  moveMembers,
  moveObstacle,
  moveObstacles,
  movesFor,
  placeBefore,
  placeAfter,
  placeAtEnd,
} from "./movement.ts";
import { clampWidth, maximumWidth } from "./width-control.ts";
import {
  addText,
  addGroup,
  blankComposition,
  contentKinds,
  editContentKind,
  isContentKind,
  beginTextEdit,
  cancelTextEdit,
  commitEdit,
  editsFor,
  finishTextEdit,
  releaseGroup,
  removeMember,
  restoreWorkingCopy,
  restoreWorkingTree,
  startWorkingCopy,
  typeText,
  undoEdit,
  wrapMembers,
  type Edited,
  type Insertion,
  type TextEdit,
  type WorkingCopy,
  type WorkingEdits,
} from "./working-copy.ts";

const members = (count: number) =>
  count === 1 ? "1 member" : `${count} members`;

type Placement = "before" | "inside" | "after";
const placements: readonly Placement[] = ["before", "inside", "after"];
const placementLabels = {
  before: "Before",
  inside: "Inside at end",
  after: "After",
};

const roleDescriptions = {
  Text: "Text carries the main wording.",
  Heading: "Heading names a section of the composition.",
  Meta: "Meta supplies supporting context, such as an update time.",
};

/** What each arrangement does, in a few words beside its name. */
const arrangementHints: Record<Primitive, string> = {
  Stack: "one column",
  Shelf: "one row",
  Switcher: "a row when it fits",
};

/** A name grounded in the content, while the highlighted box/code gives its location. */
function describeMember(node: Composition): string {
  const short = (text: string) => {
    const words = text.replace(/\s+/g, " ").trim();
    return words.length > 64 ? `${words.slice(0, 63)}…` : words;
  };
  if (!("children" in node))
    return `${node.kind}: “${short(node.text) || "empty text"}”`;
  if (!node.children.length) return `empty ${node.kind}`;
  const firstText = (member: Composition): string =>
    "children" in member
      ? (member.children.map(firstText).find(Boolean) ?? "")
      : short(member.text);
  const text = firstText(node);
  return `${node.kind}, ${members(node.children.length)}${text ? `, starting with “${short(text)}”` : ""}`;
}

/** Choosing where a move goes. Both faces show it in place of their controls. */
const moveMarkup = `<div class="move-controls" hidden><span class="move-source"></span><span class="move-destination"></span><div class="move-placements" role="group" aria-label="Place the moving members">${placements.map((placement) => `<button class="place-${placement}" type="button">${placementLabels[placement]}</button>`).join("")}<button class="cancel-move" type="button">Cancel</button></div></div>`;

/** The lesson's strip: every control in its place, enabled when it applies. */
const stripMarkup = `
<div class="starter">
  <button class="start-action" type="button">Copy investigation</button>
  <button class="start-blank" type="button">Start blank</button>
  <span class="starter-note"></span>
</div>
<div class="workspace" hidden>
  <div class="bar"><button class="structure" type="button" aria-pressed="false">Show structure</button><button class="open-playground" type="button">Open in playground ↗</button></div>
  <div class="previews"></div>
  <div class="editor-panel">
  <div class="authoring combined working" role="group" aria-label="Edit your composition">
    <label class="edit text-edit">Wording<input class="text-field" type="text" autocomplete="off" spellcheck="true" disabled></label>
    <div class="content-role arrangement" role="radiogroup" aria-labelledby="role-label" aria-describedby="author-status" hidden>
      <span class="arrangement-label" id="role-label">Content role</span>
      <span class="arrangement-options">${contentKinds.map((kind) => `<label><input type="radio" name="content-role" value="${kind}">${kind}</label>`).join("")}</span>
    </div>
    <div class="group-arrangement arrangement" role="radiogroup" aria-labelledby="arrangement-label">
      <span class="arrangement-label" id="arrangement-label"></span>
      <span class="arrangement-options">${arrangements.map((kind) => `<label><input type="radio" name="arrangement" value="${kind}">${kind}</label>`).join("")}</span>
    </div>
    <div class="creation">
      <label>Add <select class="new-member" aria-label="Kind of new member"><option value="Text">Text</option>${arrangements.map((kind) => `<option value="${kind}">Empty ${kind}</option>`).join("")}</select></label>
      <button class="inside-action" type="button"></button>
      <button class="after-action" type="button"></button>
    </div>
    <div class="composition-actions">
      <button class="group-action" type="button">Group</button><button class="ungroup-action" type="button">Ungroup</button><button class="move-action" type="button">Move</button><button class="remove-action" type="button">Remove</button><button class="clear-action" type="button">Clear selection</button>
    </div>
    ${moveMarkup}
    <span class="author-status" id="author-status" role="status" aria-live="polite"></span>
    <span class="history"><button class="undo-action" type="button">Undo</button><button class="blank-action" type="button">Start blank</button><button class="copy-action" type="button"></button></span>
  </div>
  <pre aria-label="Your composition"><code></code></pre>
  </div>
</div>`;

/**
 * The workbench: the result in two spaces above; below, the hierarchy beside
 * an inspector for whatever is selected in it. Undo and the blank start act
 * on the whole composition, so they sit apart from the inspector.
 */
const workbenchMarkup = `
<div class="workspace workbench" hidden>
  <section class="results" aria-labelledby="results-title">
    <div class="results-head">
      <div><h2 id="results-title">One composition, two spaces</h2><p class="results-hint">Select a part in either view. Drag the wide card’s edge to change its space.</p></div>
      <div class="document-actions"><button class="undo-action" type="button">Undo</button><button class="blank-action" type="button" title="Replace this composition with an empty one. Undo restores it.">Start blank</button><button class="structure" type="button" aria-pressed="false">Show structure</button></div>
    </div>
    <div class="result-views" role="group" aria-label="Wide card and narrow rail" tabindex="0">
      <div class="preview-limit" aria-hidden="true"></div>
      <div class="previews"></div>
      <p class="empty-hint" hidden>This composition is empty. Add text or an empty group below.</p>
    </div>
  </section>
  <div class="editing" role="group" aria-label="Edit your composition">
    <section class="hierarchy" aria-labelledby="hierarchy-title">
      <div class="hierarchy-head"><h2 id="hierarchy-title">Composition</h2><button class="several" type="button" aria-pressed="false">Select several</button></div>
      <div class="view-choice" role="group" aria-label="Show the composition as"><button class="show-outline" type="button" aria-pressed="true">Outline</button><button class="show-code" type="button" aria-pressed="false">Code</button></div>
      <p class="select-help" hidden>Choose neighboring members to group or move them together.</p>
      <div class="outline" role="group" aria-label="Composition outline"></div>
      <div class="source" hidden><pre aria-label="Composition code"><code></code></pre></div>
    </section>
    <section class="inspector" aria-label="Selected part">
      <div class="inspector-body">
        <div class="selection-context"><button class="parent" type="button" hidden></button><h2 class="selected-title"></h2><span class="selected-detail"></span></div>
        <label class="wording">Wording<input class="text-field" type="text" autocomplete="off" spellcheck="true" disabled></label>
        <fieldset class="content-role choice" aria-describedby="role-purpose" hidden>
          <legend>Content role</legend>
          ${contentKinds.map((kind) => `<label><input type="radio" name="content-role" value="${kind}">${kind}</label>`).join("")}
          <p class="role-purpose" id="role-purpose"></p>
        </fieldset>
        <fieldset class="group-arrangement choice" aria-describedby="arrangement-purpose" hidden>
          <legend>Arrangement</legend>
          ${arrangements.map((kind) => `<label><input type="radio" name="arrangement" value="${kind}"><span>${kind} <small>${arrangementHints[kind]}</small></span></label>`).join("")}
          <p class="arrangement-purpose" id="arrangement-purpose"></p>
        </fieldset>
        <div class="add-area">
          <span class="insertion-context"></span><button class="place-toggle" type="button" hidden></button>
          <div class="add-actions"><button class="add-text" type="button">Add text</button><span class="add-groups" role="group" aria-label="Add an empty group"><span>or an empty group</span>${arrangements.map((kind) => `<button type="button" data-add="${kind}" title="Arranged as ${arrangementHints[kind]}">${kind}</button>`).join("")}</span></div>
        </div>
        <div class="selection-actions"><button class="group-action" type="button">Group in a Stack</button><button class="ungroup-action" type="button">Ungroup</button><button class="move-action" type="button">Move</button><button class="remove-action" type="button">Remove</button></div>
      </div>
      ${moveMarkup}
      <p class="author-status" id="author-status" role="status" aria-live="polite"></p>
    </section>
  </div>
</div>`;

/** Where keyboard focus belongs after an edit. */
type Focus =
  /** The name of the node at this path in the hierarchy. */
  | { readonly name: string }
  /** The text field, with its text selected for replacement. */
  | "text"
  /** Ready to fill a just-created empty group. */
  | "inside"
  /** A completed move returns directly to its controls. */
  | "move"
  /** Where the author put it, unless that control is now unavailable. */
  | "stay";

/**
 * A view of the hierarchy in which any node can be chosen, including a group
 * with no members: the declaration, or the outline.
 */
interface HierarchyView {
  show(model: Composition): void;
  mark(chosen: readonly string[]): void;
  destination(path: string | undefined, moving: boolean): void;
  inspect(structure: boolean, path: string | undefined): void;
  rove(path: string): void;
  focus(path: string): void;
}

/** Which hierarchy a workbench shows. It outlasts one draft's editor. */
let preferredHierarchy: "outline" | "code" = "outline";

export interface PlaygroundState {
  readonly copy: WorkingCopy;
  readonly width: number;
}

export class AxiomaticPlayground extends HTMLElement {
  /** The standalone host supplies and persists editor state. */
  initialState: PlaygroundState | undefined;
  get isMoving(): boolean {
    return !!this.moving;
  }
  finishEditing(): PlaygroundState | undefined {
    this.finishText();
    return this.workingState;
  }
  prepareToLeave(): PlaygroundState | undefined {
    if (this.moving) this.cancelMove(false);
    if (this.several) {
      this.several = false;
      this.refresh();
    }
    return this.finishEditing();
  }
  get workingState(): PlaygroundState | undefined {
    if (!this.copy) return undefined;
    return {
      copy: this.textEdit
        ? finishTextEdit(this.copy, this.textEdit)
        : this.copy,
      width: this.width,
    };
  }
  readonly root = this.attachShadow({ mode: "open" });
  /** The exercise whose composition this working copy starts from. */
  private source = "";
  /** On its own page: the workbench, with state held by the page. */
  private standalone = false;
  private copy: WorkingCopy | undefined;
  /** The rewording in progress. Typing changes the copy; history waits. */
  private textEdit: TextEdit | undefined;
  /** A proposed destination; the authored model and source selection stay put. */
  private moving:
    { readonly members: readonly string[]; target?: string } | undefined;
  /** Workbench: the author asked for clicks to build on the selection. */
  private several = false;
  /** Workbench: add after the selected group, where inside is the default. */
  private addAfter = false;
  private structure = false;
  /** The node under the pointer or focus, shown while structure is on. */
  private attended: string | undefined;
  private width = 600;
  private previews: CompositionPreview[] = [];
  private code: SourcePanel | undefined;
  private outline: OutlinePanel | undefined;
  private abort: AbortController | undefined;

  connectedCallback() {
    const source = this.getAttribute("source-exercise");
    this.standalone = this.hasAttribute("standalone");
    if (!source && !this.standalone)
      throw new Error("A playground needs a source-exercise");
    this.source = source ?? "investigation";
    this.abort = new AbortController();
    const signal = this.abort.signal;
    this.root.innerHTML = `<style>${styles}${primitiveStyles}${palette}${inspectionStyles}${playgroundStyles}${this.standalone ? outlineStyles : ""}</style>${this.standalone ? workbenchMarkup : stripMarkup}`;
    this.classList.add("editable");
    this.wireEditing(signal);
    if (this.standalone) this.wireWorkbench(signal);
    else this.wireStrip(signal);

    if (this.standalone) {
      this.copy = this.withSubject(
        this.initialState?.copy ?? startWorkingCopy(Stack()),
      );
      this.width = this.initialState?.width ?? 600;
    } else this.copy = this.load();
    this.previews = [
      new CompositionPreview(this.ownerDocument, {
        label: "Wide card",
        slot: "wide",
        width: {
          initial: this.width,
          // The workbench's card is as wide as it was asked to be, so it
          // cannot say how wide it may become. An independent box does.
          ...(this.standalone
            ? { availableSpace: this.get(".preview-limit") }
            : {}),
          changed: (width, settled) => {
            this.width = width;
            if (settled) this.save();
          },
        },
        choose: (path) => this.choose(path),
        attend: (path) => this.attend(path),
      }),
      new CompositionPreview(this.ownerDocument, {
        label: "Narrow rail",
        slot: "rail",
        choose: (path) => this.choose(path),
        attend: (path) => this.attend(path),
      }),
    ];
    this.get(".previews").append(
      ...this.previews.map((preview) => preview.element),
    );
    this.code = new SourcePanel(this.get("pre"), {
      describe: (path, node) => this.describe(path, node),
      choose: (path, extend) => this.choose(path, extend),
      attend: (path) => this.attend(path),
      // The workbench's declaration scrolls in a box of its own.
      revealFocus: this.standalone,
      signal,
    });

    if (this.copy) this.open();
  }

  disconnectedCallback() {
    this.finishText();
    this.abort?.abort();
    this.abort = undefined;
    for (const preview of this.previews) preview.dispose();
    this.previews = [];
    this.code?.dispose();
    this.code = undefined;
    this.outline = undefined;
    this.copy = undefined;
    this.moving = undefined;
    this.several = false;
    this.addAfter = false;
    this.attended = undefined;
  }

  private get<T extends Element = HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing ${selector}`);
    return element;
  }
  private on(selector: string, type: string, listener: () => void) {
    this.get(selector).addEventListener(type, listener, {
      signal: this.abort!.signal,
    });
  }
  private get storageKey() {
    return `axiomatic-playground:v1:${this.source}`;
  }

  /** The hierarchy on screen: the declaration, or the workbench's outline. */
  private get hierarchy(): HierarchyView | undefined {
    return this.standalone && preferredHierarchy === "outline"
      ? this.outline
      : this.code;
  }

  /** A working copy as this face shows it. The workbench always has a
   * subject; a lesson's strip may have nothing selected. */
  private withSubject(copy: WorkingCopy): WorkingCopy {
    return this.standalone ? { ...copy, chosen: subjectOf(copy.chosen) } : copy;
  }

  /** The accessible name of a node in the hierarchy. */
  private describe(path: string, node: Composition): string {
    if (this.moving)
      return `${this.moving.members.includes(path) ? (path === this.moving.target ? "Moving member, chosen as destination" : "Moving member") : path === this.moving.target ? "Destination" : "Choose destination"}: ${describeMember(node)}`;
    if (this.standalone)
      return `${path === "0" ? "Whole composition: " : ""}${describeMember(node)}`;
    return "children" in node
      ? `Select ${node.kind} group, ${node.children.length ? members(node.children.length) : "empty"}`
      : `Select ${node.kind}: ${node.text || "empty"}`;
  }

  /** The controls both faces have: one composition, edited the same way. */
  private wireEditing(signal: AbortSignal) {
    this.on(".blank-action", "click", () => this.startBlank());
    this.on(".structure", "click", () => {
      this.structure = !this.structure;
      if (!this.structure) this.attended = undefined;
      this.refresh();
    });
    this.on(".text-field", "input", () => this.typeText());
    this.on(".text-field", "blur", () => {
      if (this.finishText()) this.refresh();
    });
    this.get(".text-field").addEventListener(
      "keydown",
      (event) => {
        // Enter and Escape that confirm or cancel an input method's
        // composition belong to it, not to this edit.
        if (event.isComposing || event.keyCode === 229) {
          event.stopPropagation();
          return;
        }
        if (event.key === "Enter") {
          if (this.finishText()) this.refresh();
        } else if (event.key === "Escape" && this.textEdit) {
          // The first Escape abandons the rewording; the selection stays.
          event.stopPropagation();
          this.cancelText();
        }
      },
      { signal },
    );
    this.get(".group-arrangement").addEventListener(
      "change",
      (event) => {
        if (this.moving) return;
        const kind = (event.target as HTMLInputElement).value;
        const target = this.edits()?.arrange;
        if (!this.copy || !target || !isArrangement(kind)) return;
        const tree = arrangeGroup(this.copy.model, target.path, kind);
        // The controls are not rerendered, so focus stays on the chosen radio.
        if (tree !== this.copy.model)
          this.apply({ tree, chosen: [target.path] });
      },
      { signal },
    );
    this.get(".content-role").addEventListener(
      "change",
      (event) => {
        if (this.moving) return;
        this.finishText();
        const kind = (event.target as HTMLInputElement).value;
        const target = this.edits()?.text;
        if (!this.copy || !target || !isContentKind(kind)) return;
        const tree = editContentKind(this.copy.model, target.path, kind);
        // The workbench keeps each role's purpose beside the choice.
        if (tree !== this.copy.model)
          this.apply(
            { tree, chosen: [target.path] },
            this.standalone ? undefined : roleDescriptions[kind],
          );
      },
      { signal },
    );
    this.act(".group-action", (model, edits) => {
      if (!edits.wrap) return undefined;
      const edited = wrapMembers(model, edits.wrap);
      return [
        edited,
        `Grouped ${members(edits.wrap.length)} in a new Stack.`,
        { name: edited.chosen[0]! },
      ];
    });
    this.act(".ungroup-action", (model, edits) => {
      if (!edits.release) return undefined;
      const edited = releaseGroup(model, edits.release);
      return [
        edited,
        "Ungrouped. The members keep their reading order.",
        { name: edited.chosen[0]! },
      ];
    });
    this.act(".remove-action", (model, edits) => {
      if (!edits.remove) return undefined;
      const removed = atPath(model, edits.remove)!;
      const edited = removeMember(model, edits.remove);
      const parent = atPath(edited.tree, parentPath(edits.remove))!;
      const left =
        "children" in parent && !parent.children.length
          ? `This ${parent.kind} is now empty and keeps its place.`
          : "Undo restores it.";
      return [
        edited,
        "children" in removed
          ? `Removed the ${removed.kind} and its ${members(removed.children.length)}. ${left}`
          : `Removed. ${left}`,
        "stay",
      ];
    });
    this.on(".move-action", "click", () => this.beginMove());
    this.on(".cancel-move", "click", () => this.cancelMove());
    for (const placement of placements)
      this.on(`.place-${placement}`, "click", () => this.placeMove(placement));
    this.on(".undo-action", "click", () => {
      if (this.moving) return;
      this.finishText();
      const before = this.copy && undoEdit(this.copy);
      if (!before) return;
      this.copy = this.withSubject(before);
      this.show("Undid the last change. Restored its selection.", "stay");
    });
    this.root.addEventListener(
      "keydown",
      (event) => {
        if ((event as KeyboardEvent).key !== "Escape" || !this.copy) return;
        if (this.moving) {
          event.preventDefault();
          this.cancelMove();
          return;
        }
        if (this.standalone) {
          // Something is always selected here; Escape only ends a mode.
          if (this.several) {
            this.several = false;
            this.refresh();
          }
          return;
        }
        const editing = this.root.activeElement?.closest(".authoring") != null;
        const path = this.copy.chosen[0] ?? "0";
        this.finishText();
        this.attended = undefined;
        this.select([]);
        // The controls for a selection are now unavailable; continue from
        // the declaration, where something can be selected.
        if (editing) this.hierarchy?.focus(path);
      },
      { signal },
    );
  }

  /** The strip's own controls: its starting choices, its kind-and-place
   * additions, and clearing the selection its clicks build up. */
  private wireStrip(signal: AbortSignal) {
    this.get(".starter-note").textContent =
      `Starts from the ${this.source} composition as it is now.`;
    this.get(".copy-action").textContent = `Copy ${this.source}`;
    this.get(".start-action").textContent = `Copy ${this.source}`;
    this.on(".open-playground", "click", () => {
      if (!this.copy || this.moving) return;
      this.finishText();
      try {
        location.assign(
          playgroundURL("edit", encodeSnapshot(this.copy.model)).href,
        );
      } catch (error) {
        this.status(
          error instanceof Error
            ? error.message
            : "This composition could not be opened.",
        );
      }
    });
    this.on(".start-action", "click", () => this.start());
    this.on(".start-blank", "click", () => this.startBlank());
    this.get(".new-member").addEventListener(
      "keydown",
      (event) => {
        // Dismissing the native picker should preserve the insertion target.
        if (event.key === "Escape") event.stopPropagation();
      },
      { signal },
    );
    this.act(".inside-action", (model, edits) =>
      edits.inside ? this.createMember(model, edits.inside) : undefined,
    );
    this.act(".after-action", (model, edits) =>
      edits.after ? this.createMember(model, edits.after) : undefined,
    );
    this.on(".clear-action", "click", () => {
      if (!this.copy || this.moving) return;
      const path = this.copy.chosen[0] ?? "0";
      this.finishText();
      this.select([]);
      this.status("Selection cleared. Choose a member or a group.");
      this.hierarchy?.focus(path);
    });
    this.on(".copy-action", "click", () => {
      if (this.moving) return;
      const tree = this.sourceComposition();
      if (!tree) {
        this.status(`The ${this.source} exercise is not on this page.`);
        return;
      }
      this.apply(
        { tree, chosen: [] },
        `Copied the ${this.source} composition as it is now. Undo restores your working copy.`,
        "stay",
      );
    });
  }

  /** The workbench's own controls: the outline, the choice of hierarchy,
   * asking for several, the way to a parent, and adding by name. */
  private wireWorkbench(signal: AbortSignal) {
    this.outline = new OutlinePanel(this.get(".outline"), {
      describe: (path, node) => this.describe(path, node),
      choose: (path, extend) => this.choose(path, extend),
      attend: (path) => this.attend(path),
      signal,
    });
    this.showHierarchy(preferredHierarchy);
    this.on(".show-outline", "click", () => this.showHierarchy("outline"));
    this.on(".show-code", "click", () => this.showHierarchy("code"));
    this.on(".several", "click", () => {
      if (this.moving) return;
      this.several = !this.several;
      this.refresh();
    });
    this.on(".parent", "click", () => {
      const path = parentPath(this.copy?.chosen[0] ?? "0");
      if (!path || this.moving) return;
      this.finishText();
      this.several = false;
      this.select([path]);
      this.hierarchy?.focus(path);
    });
    this.on(".place-toggle", "click", () => {
      this.addAfter = !this.addAfter;
      this.refresh();
    });
    this.act(".add-text", (model, edits) => {
      const at = this.insertion(edits);
      return (
        at && [
          addText(model, at),
          "Added text. Type to replace its wording.",
          "text",
        ]
      );
    });
    for (const kind of arrangements)
      this.act(`[data-add="${kind}"]`, (model, edits) => {
        const at = this.insertion(edits);
        if (!at) return;
        const added = addGroup(model, at, kind);
        const canFill = !!editsFor(added.tree, added.chosen).inside;
        return [
          added,
          canFill
            ? `Added an empty ${kind}. Add text inside it to begin filling it.`
            : `Added an empty ${kind} at the nesting limit. You can change its arrangement or move it to a shallower group.`,
          "inside",
        ];
      });
  }

  /** Shows the composition as an outline or as its declaration. Focus stays
   * on the choice; the hierarchy that appears is brought up to date. */
  private showHierarchy(view: "outline" | "code") {
    preferredHierarchy = view;
    this.get(".outline").hidden = view !== "outline";
    this.get(".source").hidden = view !== "code";
    for (const name of ["outline", "code"])
      this.get(`.show-${name}`).setAttribute(
        "aria-pressed",
        String(name === view),
      );
    if (!this.copy) return;
    this.hierarchy?.show(this.copy.model);
    this.hierarchy?.rove(this.moving?.target ?? this.copy.chosen[0] ?? "0");
    this.decorate();
  }

  /** The source exercise's composition now, or its starting composition when
   * that exercise is not on the page. */
  private sourceComposition(): Composition | undefined {
    const scope = this.getRootNode() as Document | ShadowRoot;
    const live: unknown = scope.querySelector(
      `axiomatic-example[exercise="${CSS.escape(this.source)}"]`,
    );
    if (
      live &&
      typeof live === "object" &&
      "snapshot" in live &&
      typeof live.snapshot === "function"
    )
      return restoreWorkingTree(live.snapshot());
    const known = exampleNames.find((name) => name === this.source);
    return known ? restoreWorkingTree(example(known)) : undefined;
  }

  private load(): WorkingCopy | undefined {
    try {
      const saved: unknown = JSON.parse(
        sessionStorage.getItem(this.storageKey) || "null",
      );
      const copy = restoreWorkingCopy(saved);
      const width =
        saved && typeof saved === "object" && "width" in saved
          ? saved.width
          : undefined;
      if (copy && typeof width === "number" && Number.isFinite(width))
        this.width = clampWidth(width, maximumWidth);
      return copy;
    } catch {
      /* A working copy also starts without storage. */
      return undefined;
    }
  }
  /** Saves the working copy. A rewording in progress is saved as finished,
   * so reopening mid-edit keeps the words and can still undo them. */
  private save() {
    if (!this.copy) return;
    if (this.standalone) {
      this.dispatchEvent(
        new CustomEvent<PlaygroundState>("composition-change", {
          detail: this.workingState!,
        }),
      );
      return;
    }
    const copy = this.textEdit
      ? finishTextEdit(this.copy, this.textEdit)
      : this.copy;
    try {
      sessionStorage.setItem(
        this.storageKey,
        JSON.stringify({ ...copy, width: this.width }),
      );
    } catch {}
  }

  private start() {
    const tree = this.sourceComposition();
    if (!tree) {
      this.get(".starter-note").textContent =
        `The ${this.source} exercise is not on this page.`;
      return;
    }
    this.copy = startWorkingCopy(tree);
    this.save();
    this.open();
    this.status(
      "This copy is yours. Select a fact to reword it, or a group to add to it.",
    );
    this.hierarchy?.focus("0");
  }
  /** An empty root is a place to compose; replacing work is one Undo step. */
  private startBlank() {
    if (this.moving) return;
    this.finishText();
    this.several = false;
    let replaced = false;
    if (!this.copy) {
      this.copy = { ...startWorkingCopy(Stack()), chosen: ["0"] };
      this.open();
    } else {
      const edited = blankComposition(this.copy.model);
      if (edited.tree !== this.copy.model) {
        replaced = true;
        this.apply(edited);
      } else this.select(["0"]);
    }
    this.status(
      `An empty Stack. Add content or an empty group inside it.${replaced ? " Undo restores your previous composition." : ""}`,
    );
    this.get<HTMLElement>(
      this.standalone ? ".add-text" : ".new-member",
    ).focus();
  }

  /** The strip's addition: the kind its picker shows, at the place asked for. */
  private createMember(
    model: Composition,
    at: Insertion,
  ): [Edited, string, Focus] {
    const kind = this.get<HTMLSelectElement>(".new-member").value;
    if (isArrangement(kind)) {
      const edited = addGroup(model, at, kind);
      this.get<HTMLSelectElement>(".new-member").value = "Text";
      return [
        edited,
        `Added an empty ${kind}. Add Text inside it to begin filling the group.`,
        "inside",
      ];
    }
    return [
      addText(model, at),
      "Added Text. Type to replace its wording, then choose its content role.",
      "text",
    ];
  }

  /**
   * Where the workbench's additions go. A selected group takes them inside
   * unless its author asked for after it; anything else takes them after.
   */
  private insertion(edits: WorkingEdits): Insertion | undefined {
    return this.addAfter ? edits.after : (edits.inside ?? edits.after);
  }

  private open() {
    if (!this.standalone) this.get(".starter").hidden = true;
    this.get(".workspace").hidden = false;
    this.show();
  }

  private edits(): WorkingEdits | undefined {
    return this.copy && editsFor(this.copy.model, this.copy.chosen);
  }

  /** Wires an edit button: the edit its selection permits, a message, and
   * where focus goes. */
  private act(
    selector: string,
    edit: (
      model: Composition,
      edits: WorkingEdits,
    ) => [Edited, string, Focus] | undefined,
  ) {
    this.on(selector, "click", () => {
      if (this.moving) return;
      // A click may not blur the text field, so end its edit here.
      this.finishText();
      const edits = this.edits();
      const applied = this.copy && edits && edit(this.copy.model, edits);
      if (applied) this.apply(...applied);
    });
  }

  /** Makes one undoable edit. */
  private apply(edited: Edited, message?: string, focus: Focus = "stay") {
    if (!this.copy) return;
    this.finishText();
    this.copy = commitEdit(this.copy, edited.tree, edited.chosen);
    this.show(message, focus);
  }

  /** Shows a changed composition everywhere, then saves it. */
  private show(
    message?: string,
    focus: Focus = "stay",
    preserveScroll = false,
  ) {
    if (!this.copy) return;
    // Read before the controls change: one that disappears loses focus.
    const focused = this.root.activeElement;
    this.attended = undefined;
    // A changed composition ends the modes that referred to the old one.
    this.several = false;
    this.addAfter = false;
    for (const preview of this.previews)
      preview.render(this.copy.model, preserveScroll);
    this.hierarchy?.show(this.copy.model);
    this.hierarchy?.rove(this.copy.chosen[0] ?? "0");
    this.refresh(message);
    this.save();
    const field = this.get<HTMLInputElement>(".text-field");
    if (focus === "text" && !field.disabled) {
      field.focus({ preventScroll: true });
      field.select();
    } else if (focus === "inside") {
      const fill = this.get<HTMLButtonElement>(
        this.standalone ? ".add-text" : ".inside-action",
      );
      // At the node/depth limit the empty group is still authored and can
      // change arrangement. Keep focus on a usable, visible control.
      const next =
        fill.disabled || !this.edits()?.inside
          ? this.get<HTMLInputElement>(".group-arrangement input:checked")
          : fill;
      next.focus({ preventScroll: true });
    } else if (focus === "move") {
      const move = this.get<HTMLButtonElement>(".move-action");
      const next = move.disabled
        ? this.get<HTMLButtonElement>(".undo-action")
        : move;
      next.focus({ preventScroll: true });
    } else if (typeof focus === "object") this.hierarchy?.focus(focus.name);
    else this.keepFocus(focused);
  }

  /** A focused control that became unavailable hands focus to the selected
   * node's name, so the keyboard stays inside the editor. */
  private keepFocus(focused: Element | null) {
    const unavailable =
      ((focused instanceof HTMLButtonElement ||
        focused instanceof HTMLInputElement) &&
        focused.disabled) ||
      focused?.closest("[hidden]") != null;
    if (unavailable) this.hierarchy?.focus(this.copy?.chosen[0] ?? "0");
  }

  /**
   * The author chose a node in a preview or the hierarchy. A lesson teaches
   * that each choice builds on the selection, so there it always does. The
   * workbench selects the one thing chosen unless its author asked for
   * several, by mode or, with `extend`, for this one choice.
   */
  private choose(path: string, extend = false) {
    if (!this.copy) return;
    if (this.moving) {
      this.moving = { ...this.moving, target: path };
      this.attended = undefined;
      this.refresh();
      this.hierarchy?.rove(path);
      return;
    }
    this.finishText();
    const { model, chosen } = this.copy;
    this.select(
      this.standalone
        ? selectionAfter(model, chosen, path, this.several || extend)
        : chooseMember(model, chosen, path),
    );
    this.hierarchy?.rove(path);
  }
  private select(chosen: readonly string[]) {
    if (!this.copy) return;
    this.copy = { ...this.copy, chosen };
    this.addAfter = false;
    this.refresh();
    this.save();
  }
  private attend(path: string | undefined) {
    const next = this.structure && !this.moving ? path : undefined;
    if (next === this.attended) return;
    this.attended = next;
    this.decorate();
  }

  private typeText() {
    if (this.moving) return;
    const target = this.edits()?.text;
    if (!this.copy || !target) return;
    this.textEdit ??= beginTextEdit(this.copy, target.path);
    this.copy = typeText(
      this.copy,
      this.textEdit,
      this.get<HTMLInputElement>(".text-field").value,
    );
    // The field is outside everything this replaces, so the caret stays.
    for (const preview of this.previews) preview.render(this.copy.model, true);
    this.hierarchy?.show(this.copy.model);
    this.refresh();
    this.save();
  }
  /** Ends a rewording in progress as one undoable step. Returns whether
   * there was one. */
  private finishText(): boolean {
    if (!this.copy || !this.textEdit) return false;
    this.copy = finishTextEdit(this.copy, this.textEdit);
    this.textEdit = undefined;
    this.save();
    return true;
  }
  private cancelText() {
    if (!this.copy || !this.textEdit) return;
    this.copy = cancelTextEdit(this.copy, this.textEdit);
    this.textEdit = undefined;
    this.show("Restored the text from before this edit.", "stay", true);
  }

  private beginMove() {
    if (!this.copy || this.moving) return;
    this.finishText();
    const moves = movesFor(this.copy.model, this.copy.chosen);
    if (!moves?.places.length) return;
    this.moving = { members: moves.members };
    this.several = false;
    this.attended = undefined;
    this.refresh();
    // A visible escape route keeps focus with the controls. Names in the
    // hierarchy keep their keyboard order for choosing a destination.
    this.get<HTMLButtonElement>(".cancel-move").focus({ preventScroll: true });
  }

  private cancelMove(restoreFocus = true) {
    if (!this.moving) return;
    this.moving = undefined;
    this.attended = undefined;
    this.hierarchy?.rove(this.copy?.chosen[0] ?? "0");
    this.refresh("Move cancelled. Your composition is unchanged.");
    // Escape may come from far down a long declaration. Native focus scrolling
    // brings the controls back into view without measuring their rectangles.
    if (restoreFocus) this.get<HTMLButtonElement>(".move-action").focus();
  }

  private movePlace(placement: Placement): Insertion | undefined {
    if (!this.copy || !this.moving?.target) return undefined;
    const target = this.moving.target;
    const node = atPath(this.copy.model, target);
    if (!node) return undefined;
    if (placement === "inside")
      return "children" in node
        ? placeAtEnd(this.copy.model, target)
        : undefined;
    if (target === "0") return undefined;
    return placement === "before" ? placeBefore(target) : placeAfter(target);
  }

  private movingName(): string {
    const moving = this.moving;
    if (!moving || !this.copy) return "";
    return moving.members.length === 1
      ? describeMember(atPath(this.copy.model, moving.members[0]!)!)
      : `${members(moving.members.length)} together`;
  }

  private refreshMove() {
    if (!this.copy || !this.moving) return;
    const { model } = this.copy;
    const target = this.moving.target && atPath(model, this.moving.target);
    this.get(".move-source").textContent = `Moving ${this.movingName()}`;
    const parent =
      this.moving.target && this.moving.target !== "0"
        ? atPath(model, parentPath(this.moving.target))
        : undefined;
    const context = parent
      ? ` in the surrounding ${parent.kind}`
      : " in the whole composition";
    this.get(".move-destination").textContent = target
      ? `Destination: ${describeMember(target)}${parent ? ` · inside ${parent.kind}` : " · whole composition"}`
      : "Choose a destination in either view or the composition.";
    const reasons = new Set<string>();
    const available: Placement[] = [];
    for (const placement of placements) {
      const button = this.get<HTMLButtonElement>(`.place-${placement}`);
      const place = this.movePlace(placement);
      const obstacle = place && moveObstacle(model, this.moving.members, place);
      const unavailable = !place || !!obstacle;
      button.disabled = unavailable;
      button.setAttribute(
        "aria-label",
        target
          ? `Move ${placement === "inside" ? "inside at end of" : placement} ${describeMember(target)}`
          : placementLabels[placement],
      );
      const reason = obstacle
        ? moveObstacles[obstacle]
        : !place
          ? placement === "inside"
            ? "Choose a group to move inside."
            : "The whole composition has no surrounding group."
          : "";
      button.title = target ? reason : "Choose a destination first.";
      if (obstacle) reasons.add(moveObstacles[obstacle]);
      if (!unavailable) available.push(placement);
    }
    const beside = available.filter((placement) => placement !== "inside");
    const guidance = [
      beside.length && target
        ? `${beside.map((placement) => placementLabels[placement]).join(" or ")} places the moving members${context}, alongside this ${target.kind}.`
        : "",
      available.includes("inside") && target
        ? `Inside at end adds them to ${this.moving.target === "0" ? "the whole composition" : `this ${target.kind}`}.`
        : "",
    ]
      .filter(Boolean)
      .join(" ");
    this.status(
      !target
        ? "The solid selection is what travels. Choosing a destination does not move it yet."
        : guidance || [...reasons].join(" ") || "Choose another destination.",
    );
  }

  private placeMove(placement: Placement) {
    if (!this.copy || !this.moving?.target) return;
    const place = this.movePlace(placement);
    if (!place || moveObstacle(this.copy.model, this.moving.members, place))
      return;
    const name = this.movingName();
    const target = describeMember(atPath(this.copy.model, this.moving.target)!);
    const edited = moveMembers(this.copy.model, this.moving.members, place);
    if (edited.tree === this.copy.model) return;
    const former = atPath(edited.tree, edited.from);
    const emptied =
      former && "children" in former && !former.children.length
        ? ` The ${former.kind} it left is empty and keeps its arrangement.`
        : "";
    this.moving = undefined;
    this.apply(
      edited,
      `Moved ${name} ${placement === "inside" ? "inside, at the end of" : placement} ${target}.${emptied} Undo restores the previous composition.`,
      "move",
    );
  }

  private status(message: string) {
    this.get(".author-status").textContent = message;
  }

  /** Shows the selection in every view. */
  private decorate() {
    if (!this.copy) return;
    const { chosen } = this.copy;
    const inspected =
      this.attended ?? (chosen.length === 1 ? chosen[0] : undefined);
    for (const preview of this.previews)
      preview.decorate({
        structure: this.structure,
        inspected,
        chosen,
        destination: this.moving?.target,
      });
    this.hierarchy?.destination(this.moving?.target, !!this.moving);
    this.hierarchy?.mark(chosen);
    this.hierarchy?.inspect(this.structure, inspected);
  }

  /** Brings the controls and every view up to date with the selection. */
  private refresh(message?: string) {
    const edits = this.edits();
    if (!this.copy || !edits) return;
    if (this.standalone)
      this.dispatchEvent(
        new CustomEvent("composition-interaction", {
          detail: { moving: !!this.moving },
        }),
      );
    const { model, chosen } = this.copy;
    const structure = this.get(".structure");
    structure.setAttribute("aria-pressed", String(this.structure));
    structure.textContent = this.structure
      ? "Hide structure"
      : "Show structure";

    const field = this.get<HTMLInputElement>(".text-field");
    field.disabled = !edits.text;
    // Writing an unchanged value would move the caret while typing.
    const text = edits.text?.content.text ?? "";
    if (field.value !== text) field.value = text;
    for (const input of this.root.querySelectorAll<HTMLInputElement>(
      ".content-role input",
    )) {
      input.disabled = !edits.text;
      input.checked = input.value === edits.text?.content.kind;
    }
    for (const input of this.root.querySelectorAll<HTMLInputElement>(
      ".group-arrangement input",
    )) {
      input.disabled = !edits.arrange;
      input.checked = input.value === edits.arrange?.group.kind;
    }
    this.enable(".group-action", !!edits.wrap);
    this.enable(".ungroup-action", !!edits.release);
    this.enable(".move-action", !!movesFor(model, chosen)?.places.length);
    this.enable(".remove-action", !!edits.remove);
    // A rewording in progress is undone as the step it is about to become.
    this.enable(
      ".undo-action",
      !this.moving && (this.copy.undo.length > 0 || !!this.textEdit),
    );
    this.enable(".blank-action", !this.moving);

    const status = this.standalone
      ? this.refreshInspector(edits, message)
      : this.refreshStrip(edits, message);
    this.get(".workspace").toggleAttribute("data-moving", !!this.moving);
    this.get(".move-controls").hidden = !this.moving;
    if (this.moving) this.refreshMove();
    else this.status(status);
    this.decorate();
  }

  private enable(selector: string, available: boolean, label?: string) {
    const button = this.get<HTMLButtonElement>(selector);
    button.disabled = !available;
    if (label !== undefined) button.textContent = label;
  }

  /** The strip keeps every control in place and says what each needs.
   * Returns what its status line should say. */
  private refreshStrip(edits: WorkingEdits, message?: string): string {
    const { model, chosen } = this.copy!;
    this.get<HTMLInputElement>(".text-field").placeholder = edits.text
      ? ""
      : "Select one fact to edit its text";
    this.get(".content-role").hidden = !edits.text;
    const choice = this.get(".group-arrangement");
    choice.hidden = !!edits.text;
    const target = edits.arrange;
    choice.setAttribute("aria-disabled", String(!target));
    const count = target?.group.children.length;
    this.get(".group-arrangement .arrangement-label").textContent = !target
      ? "Arrange a group as"
      : count === 0
        ? "Arrange this empty group as"
        : count === 1
          ? "Arrange this group as"
          : `Arrange these ${count} members as`;

    const selected =
      chosen[0] === undefined ? undefined : atPath(model, chosen[0]);
    this.enable(
      ".inside-action",
      !!edits.inside,
      edits.arrange
        ? `Inside ${edits.arrange.group.kind}`
        : edits.inside
          ? "Inside composition"
          : "Inside group",
    );
    this.enable(
      ".after-action",
      !!edits.after,
      chosen.length > 1
        ? "After selection"
        : `After ${edits.remove && selected ? selected.kind : "member"}`,
    );
    this.enable(".open-playground", !this.moving);
    this.enable(".clear-action", chosen.length > 0);

    if (edits.full)
      return "This selection reaches a size or nesting limit. You can still use the enabled actions.";
    if (message !== undefined) return message;
    if (target)
      return target.group.children.length
        ? arrangementContracts[target.group.kind]
        : `This ${target.group.kind} is empty and keeps its arrangement. Add a member inside it${edits.remove ? ", or remove it" : ""}.`;
    if (edits.text)
      return `${roleDescriptions[edits.text.content.kind]} Changing its role keeps its wording and membership.`;
    if (chosen.length > 1)
      return `${members(chosen.length)} selected. Group them, move them, or add a member after them.`;
    return "Select a fact to reword it, or a group's name in the code to arrange or add to it.";
  }

  /** The inspector names what is selected and shows what applies to it.
   * Returns what its status line should say. */
  private refreshInspector(edits: WorkingEdits, message?: string): string {
    const { model, chosen } = this.copy!;
    const path = chosen[0] ?? "0";
    const node = atPath(model, path) ?? model;
    const single = chosen.length < 2;
    this.get(".inspector").toggleAttribute("data-multiple", !single);
    this.get(".selected-title").textContent = single
      ? node.kind
      : `${chosen.length} members selected`;
    this.get(".selected-detail").textContent =
      single && "children" in node
        ? `${path === "0" ? "the whole composition · " : ""}${node.children.length ? members(node.children.length) : "empty"}`
        : "";
    const parent = path === "0" ? undefined : atPath(model, parentPath(path));
    const up = this.get<HTMLButtonElement>(".parent");
    up.hidden = !parent;
    if (parent) {
      up.textContent = `↑ In ${parent.kind}`;
      up.setAttribute(
        "aria-label",
        `Select the ${parent.kind} ${single ? "this is" : "these are"} in`,
      );
    }

    this.get(".wording").hidden = !edits.text;
    this.get(".content-role").hidden = !edits.text;
    this.get(".role-purpose").textContent = edits.text
      ? roleDescriptions[edits.text.content.kind]
      : "";
    this.get(".group-arrangement").hidden = !edits.arrange;
    this.get(".arrangement-purpose").textContent = edits.arrange
      ? arrangementContracts[edits.arrange.group.kind]
      : "";

    const place = this.insertion(edits);
    const inside = edits.inside && place === edits.inside ? edits.inside : null;
    this.get(".insertion-context").textContent = !place
      ? "Nothing more can be added here."
      : inside
        ? `Add inside this ${inside.group.kind}`
        : single
          ? `Add after this ${node.kind}`
          : "Add after these members";
    const toggle = this.get<HTMLButtonElement>(".place-toggle");
    toggle.hidden = !(edits.inside && edits.after);
    toggle.textContent = inside
      ? "Add after it instead"
      : "Add inside it instead";
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(
      ".add-text, [data-add]",
    ))
      button.disabled = !place;

    const several = this.get<HTMLButtonElement>(".several");
    several.disabled = !!this.moving;
    several.setAttribute("aria-pressed", String(this.several));
    several.textContent = this.several ? "Done selecting" : "Select several";
    this.get(".select-help").hidden = !this.several;
    this.get(".empty-hint").hidden =
      !("children" in model) || model.children.length > 0;

    return [
      message,
      edits.full
        ? "This selection is at a size or nesting limit, so some actions are unavailable."
        : "",
    ]
      .filter(Boolean)
      .join(" ");
  }
}

if (!customElements.get("axiomatic-playground"))
  customElements.define("axiomatic-playground", AxiomaticPlayground);
