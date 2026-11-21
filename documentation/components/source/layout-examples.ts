import { revision as componentRevision } from "axiomatic:revision";
import styles from "./example.css";
import inspectionStyles from "./inspection.css";
import { inlineObservation } from "./inline-observation.ts";
import { ExampleReadouts } from "./example-readouts.ts";
import {
  widthControl,
  clampWidth,
  minimumWidth,
  maximumWidth,
  type WidthControl,
} from "./width-control.ts";
import {
  updateInspection,
  prepareInspection,
  highlightSource,
  describeSelection,
  currentArrangement,
} from "./inspection.ts";
import { example, exampleNames, declaration } from "./composition.ts";
import primitiveStyles from "./primitives.css";
import { mountComposition, type MountedComposition } from "./primitives.ts";
import { arrangementAttribute } from "./switcher-coordinator.ts";
import type { Composition, ExampleName } from "./composition.ts";
import {
  atPath,
  parentPath,
  groupingReason,
  neighboringMembers,
  groupMembers,
  ungroupMembers,
  restoreGrouping,
} from "./grouping.ts";
import {
  arrangements,
  arrangementContracts,
  isArrangement,
  arrangementTarget,
  arrangeGroup,
  changedArrangements,
  restoreArrangement,
} from "./arrangement.ts";
import {
  restoreComposition,
  restoreSelection,
  chooseMember,
  selectionOf,
} from "./composition-editing.ts";
import palette from "./composition-palette.generated.css";
import "./playground.ts";
import "./playground-page.ts";

let sharedWidth = 600;
let sharedStructure = false;
try {
  const saved = Number(sessionStorage.getItem("axiomatic-example-width"));
  if (saved >= minimumWidth && saved <= maximumWidth) sharedWidth = saved;
} catch {}
const linkedExamples = new Set<AxiomaticExample>();
/** What an exercise lets its reader change. Each is an explicit opt-in. */
type Editing = "grouping" | "arrangement" | "composition";
interface UndoEntry {
  readonly model: Composition;
  readonly chosen: readonly string[];
}
const statusMarkup =
  '<span class="author-status" role="status" aria-live="polite"></span>';
const historyMarkup =
  '<span class="history"><button class="undo-action" type="button" hidden>Undo</button><button class="reset-action" type="button" hidden>Start over</button></span>';
const arrangementMarkup = `<div class="arrangement" role="radiogroup" aria-labelledby="arrangement-label"><span class="arrangement-label" id="arrangement-label"></span><span class="arrangement-options">${arrangements.map((kind) => `<label><input type="radio" name="arrangement" value="${kind}">${kind}</label>`).join("")}</span></div>`;
const groupingMarkup =
  '<button class="group-action" type="button">Group</button><button class="ungroup-action" type="button" hidden>Ungroup</button>';
const authoringMarkup: Record<Editing, string> = {
  grouping: `<div class="authoring" role="group" aria-label="Edit grouping">${statusMarkup}${groupingMarkup}${historyMarkup}</div>`,
  arrangement: `<div class="authoring" role="group" aria-label="Edit arrangement">${arrangementMarkup}${statusMarkup}${historyMarkup}</div>`,
  composition: `<div class="authoring combined" role="group" aria-label="Edit composition">${arrangementMarkup}<div class="composition-actions">${groupingMarkup}<button class="clear-action" type="button" hidden>Clear selection</button></div>${statusMarkup}${historyMarkup}</div>`,
};
function saveWidth() {
  try {
    sessionStorage.setItem("axiomatic-example-width", String(sharedWidth));
  } catch {}
}
function publishWidth(width: number, persist = true) {
  sharedWidth = width;
  if (persist) saveWidth();
  for (const example of linkedExamples) example.receiveWidth(width);
}
/** What follows a tree edit in an exercise. */
interface AppliedEdit {
  /** Replaces the default status once. */
  readonly message?: string;
  /** The selection after the edit. */
  readonly chosen?: readonly string[];
  /** A code name to focus. Without one, focus stays where the reader put it. */
  readonly focus?: string;
}
class AxiomaticExample extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });
  private name: ExampleName = "flat";
  private model: Composition = example("flat");
  /** Names this exercise's saved state. */
  private exercise: string | undefined;
  private editing: Editing | undefined;
  private chosen: string[] = [];
  private undo: UndoEntry[] = [];
  private width = sharedWidth;
  private linked = true;
  private structure = false;
  private selected: string | undefined;
  private pinned: string | undefined;
  private sourceColumns = 80;
  private characterWidth = 7.2;
  private sourceInlineSize = 0;
  private mounted: MountedComposition | undefined;
  private readonly modes = new Map<string, string>();
  private readonly modeObserver = new MutationObserver(() =>
    this.refreshModes(),
  );
  private observer?: ResizeObserver;
  private sourceObservation?: ReturnType<typeof inlineObservation>;
  private readouts: ExampleReadouts | undefined;
  private frame!: HTMLDivElement;
  private viewport!: HTMLDivElement;
  private input!: HTMLInputElement;
  private handle!: HTMLDivElement;
  private code!: HTMLElement;
  private inspected: HTMLElement | undefined;
  private captionObserver = new ResizeObserver(() => this.refreshCaption());
  private abort?: AbortController;
  private widthControl: WidthControl | undefined;
  connectedCallback() {
    const name = this.getAttribute("example");
    const known = exampleNames.find((candidate) => candidate === name);
    if (!known) throw new Error(`Unknown example ${name}`);
    this.name = known;
    this.model = example(this.name);
    this.exercise = this.getAttribute("exercise") || undefined;
    const edits = this.getAttribute("edits") ?? "grouping";
    if (
      edits !== "grouping" &&
      edits !== "arrangement" &&
      edits !== "composition"
    )
      throw new Error(`Unknown edits ${edits}`);
    if (!this.exercise && this.hasAttribute("edits"))
      throw new Error("An example with edits needs an exercise name");
    this.editing = this.exercise ? edits : undefined;
    if (this.exercise) {
      // Saved state may contain only the edits this exercise offers.
      const restore =
        this.editing === "arrangement"
          ? restoreArrangement
          : this.editing === "composition"
            ? restoreComposition
            : restoreGrouping;
      const initial = this.model;
      try {
        const saved = JSON.parse(
          sessionStorage.getItem(`axiomatic-exercise:v1:${this.exercise}`) ||
            "null",
        );
        this.model = restore(saved?.model, initial) ?? initial;
        this.undo = Array.isArray(saved?.undo)
          ? saved.undo
              .slice(-25)
              .map((value: unknown): UndoEntry | undefined => {
                // Accept the earlier tree-only history as well as snapshots.
                const entry =
                  value && typeof value === "object" && "model" in value
                    ? value
                    : { model: value, chosen: [] };
                const model = restore(entry.model, initial);
                return model
                  ? {
                      model,
                      chosen: restoreSelection(
                        "chosen" in entry ? entry.chosen : [],
                        model,
                      ),
                    }
                  : undefined;
              })
              .filter(
                (value: UndoEntry | undefined): value is UndoEntry => !!value,
              )
          : [];
        if (this.editing === "composition")
          this.chosen = [...restoreSelection(saved?.chosen, this.model)];
      } catch {
        /* A fresh exercise also works without storage. */
      }
    }
    // The arrangement experiment opens with a group that has a parent selected,
    // so the first choice needs no selection gesture.
    if (this.editing === "arrangement" && "children" in this.model) {
      const inner = this.model.children.findIndex(
        (member) => "children" in member,
      );
      this.chosen = [inner < 0 ? "0" : `0.${inner}`];
    }
    this.abort = new AbortController();
    const signal = this.abort.signal;
    this.root.innerHTML = `<style>${styles}${primitiveStyles}${palette}${inspectionStyles}</style><div class="stage"><div class="viewport"><div class="bar"><button class="structure" type="button" aria-pressed="false">Show structure</button><div class="tools"><button class="link" type="button" aria-pressed="true" title="Resize linked examples together">Linked</button><label class="width"><span class="sr-only">Example width</span><input type="number" min="${minimumWidth}" max="${maximumWidth}" step="1"><span aria-hidden="true">px</span></label></div></div><div class="frame"><div class="rendered"></div><div class="resize" aria-hidden="true" title="Drag to resize. Edit the width field for keyboard control."></div></div></div></div><div class="caption"><span class="selection"></span><span class="note"></span></div>${this.name === "switcher" ? '<label class="edit">Second item label<input value="Run lasted 4m 1s" maxlength="90"></label>' : ""}${this.editing ? authoringMarkup[this.editing] : ""}<pre aria-label="Composition"><code></code></pre>`;
    this.frame = this.get<HTMLDivElement>(".frame");
    this.viewport = this.get<HTMLDivElement>(".viewport");
    this.input = this.get<HTMLInputElement>(".width input");
    this.handle = this.get<HTMLDivElement>(".resize");
    this.code = this.get("code");
    this.readouts = new ExampleReadouts(
      this.get(".stage"),
      this.viewport,
      this.input,
      this.get(".note"),
      () => [...this.modes.values()],
    );
    if (this.editing) {
      this.root.host.classList.add("editable");
      for (const [selector, act] of [
        [".undo-action", () => this.undoEdit()],
        [".reset-action", () => this.startOver()],
      ] as const) {
        const button = this.get(selector);
        button.addEventListener(
          "click",
          () => {
            const focused = this.root.activeElement === button;
            act();
            // History becomes unavailable when nothing is left to do. Keep
            // the reader in the editor when that happens to its focused button.
            if (
              this.editing !== "grouping" &&
              focused &&
              (button.hidden ||
                (button instanceof HTMLButtonElement && button.disabled))
            )
              this.focusArrangement();
          },
          { signal },
        );
      }
    }
    if (this.editing === "arrangement" || this.editing === "composition")
      this.get(".arrangement").addEventListener(
        "change",
        (event) => {
          const target = arrangementTarget(this.model, this.chosen);
          const kind = (event.target as HTMLInputElement).value;
          if (!target || !isArrangement(kind)) return;
          const next = arrangeGroup(this.model, target.path, kind);
          // The strip is not rerendered, so focus stays on the chosen radio.
          if (next !== this.model) this.commit(next, { chosen: [target.path] });
        },
        { signal },
      );
    if (this.editing === "composition") {
      this.get(".clear-action").addEventListener(
        "click",
        () => {
          const path = this.chosen[0] ?? "0";
          this.chosen = [];
          this.select(undefined);
          this.updateAuthoring(
            "Selection cleared. Choose a member or a group.",
          );
          this.code
            .querySelector<HTMLElement>(`.code-name[data-path="${path}"]`)
            ?.focus({ preventScroll: true });
        },
        { signal },
      );
    }
    if (this.editing === "grouping" || this.editing === "composition") {
      this.get(".group-action").addEventListener(
        "click",
        () => {
          if (groupingReason(this.model, this.chosen)) return;
          const paths = [...this.chosen];
          const first = Math.min(
            ...paths.map((path) => Number(path.split(".").at(-1))),
          );
          const group = `${parentPath(paths[0]!)}.${first}`;
          this.commit(groupMembers(this.model, paths), {
            message:
              "Grouped. Neighbors outside this group remain separate members.",
            focus: group,
            chosen: [group],
          });
        },
        { signal },
      );
      this.get(".ungroup-action").addEventListener(
        "click",
        () => {
          const path = this.chosen[0];
          if (!path || !this.canUngroup()) return;
          const node = atPath(this.model, path)!;
          if (!("children" in node)) return;
          const first = Number(path.split(".").at(-1));
          this.commit(ungroupMembers(this.model, path), {
            message: "Ungrouped. The members keep their reading order.",
            focus: path,
            chosen: node.children.map(
              (_, i) => `${parentPath(path)}.${first + i}`,
            ),
          });
        },
        { signal },
      );
    }
    this.get(".link").addEventListener(
      "click",
      () => {
        this.linked = !this.linked;
        this.get(".link").setAttribute("aria-pressed", String(this.linked));
        this.get(".link").textContent = this.linked ? "Linked" : "Independent";
        if (this.linked) {
          linkedExamples.add(this);
          this.receiveWidth(sharedWidth);
          this.setStructure(sharedStructure);
        } else linkedExamples.delete(this);
      },
      { signal },
    );
    this.get(".structure").addEventListener(
      "click",
      () => {
        const next = !this.structure;
        if (this.linked) {
          sharedStructure = next;
          for (const example of linkedExamples) example.setStructure(next);
        } else this.setStructure(next);
      },
      { signal },
    );
    this.widthControl = widthControl({
      handle: this.handle,
      viewport: this.viewport,
      input: this.input,
      limit: () => this.limit(),
      request: (width, settled, maximum) =>
        this.setWidth(width, settled, maximum),
      restore: () => this.readouts?.refreshWidth(),
      signal,
    });
    this.root.querySelector<HTMLInputElement>(".edit input")?.addEventListener(
      "input",
      (event) => {
        this.model = example(
          this.name,
          (event.target as HTMLInputElement).value,
        );
        this.render();
      },
      { signal },
    );
    this.frame.addEventListener(
      "pointermove",
      (event) => {
        if (
          this.widthControl?.dragging ||
          !this.structure ||
          !(event.target instanceof Element)
        )
          return;
        const node = event.target.closest<HTMLElement>(".node,.leaf");
        if (node?.dataset.path) this.select(node.dataset.path);
      },
      { signal },
    );
    this.code.addEventListener(
      "pointerover",
      (event) => {
        if (this.structure && event.target instanceof Element) {
          const path =
            event.target.closest<HTMLElement>("[data-path]")?.dataset.path;
          if (path) this.select(path);
        }
      },
      { signal },
    );
    this.code.addEventListener(
      "focusin",
      (event) => {
        if (
          this.structure &&
          event.target instanceof HTMLElement &&
          event.target.dataset.path
        )
          this.select(event.target.dataset.path);
        if (
          event.target instanceof HTMLElement &&
          event.target.classList.contains("code-name")
        )
          this.rove(event.target.dataset.path!);
      },
      { signal },
    );
    this.code.addEventListener(
      "click",
      (event) => {
        if (event.target instanceof Element) {
          const path =
            event.target.closest<HTMLElement>("[data-path]")?.dataset.path;
          if (path && this.exercise) {
            this.choose(path);
            return;
          }
          if (path) {
            this.setStructure(true);
            this.pinned = path;
            this.select(path);
          }
        }
      },
      { signal },
    );
    this.frame.addEventListener(
      "click",
      (event) => {
        if (
          (this.structure || this.exercise) &&
          event.target instanceof Element
        ) {
          const path =
            event.target.closest<HTMLElement>(".node,.leaf")?.dataset.path;
          if (path && this.exercise) {
            this.choose(path);
            return;
          }
          if (path) {
            this.pinned = path;
            this.select(path);
          }
        }
      },
      { signal },
    );
    this.frame.addEventListener(
      "pointerleave",
      () => this.select(this.inspectionFallback()),
      { signal },
    );
    this.code.addEventListener(
      "pointerleave",
      () => this.select(this.inspectionFallback()),
      {
        signal,
      },
    );
    this.code.addEventListener(
      "focusout",
      (event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !this.code.contains(event.relatedTarget)
        )
          this.select(this.inspectionFallback());
      },
      { signal },
    );
    this.root.addEventListener(
      "keydown",
      (event) => {
        const key = event as KeyboardEvent;
        if (key.key === "Escape") {
          this.pinned = undefined;
          this.select(undefined);
          if (this.editing) {
            const choosing =
              this.root.activeElement?.closest(
                this.editing === "composition" ? ".authoring" : ".arrangement",
              ) != null;
            this.chosen = [];
            this.updateAuthoring(
              this.editing === "grouping" ? "Selection cleared." : undefined,
            );
            // With no group selected the choice is disabled; continue from
            // the code, where a group can be selected.
            if (choosing) this.focusArrangement();
          }
        }
        if (
          (this.structure || this.exercise) &&
          (key.key === "ArrowUp" || key.key === "ArrowDown") &&
          event.target instanceof HTMLElement &&
          event.target.classList.contains("code-name")
        ) {
          const names = [
            ...this.code.querySelectorAll<HTMLButtonElement>(".code-name"),
          ];
          const index = names.indexOf(event.target as HTMLButtonElement);
          const next = names[index + (key.key === "ArrowDown" ? 1 : -1)];
          key.preventDefault();
          if (next) {
            next.focus();
          }
        }
      },
      { signal },
    );
    this.sourceObservation = inlineObservation(this.get("pre"));
    this.observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === this.sourceObservation?.target) {
          this.sourceInlineSize = entry.contentBoxSize[0]!.inlineSize;
          this.fitSource();
        }
      }
    });
    this.observer.observe(this.sourceObservation.target);
    this.modeObserver.observe(this.get(".rendered"), {
      attributes: true,
      subtree: true,
      attributeFilter: [arrangementAttribute],
    });
    if (this.linked) {
      linkedExamples.add(this);
      this.width = sharedWidth;
      this.structure = sharedStructure;
    }
    this.render();
    this.setStructure(this.structure);
    const refreshSourceFont = () => {
      if (signal.aborted) return;
      const context = document.createElement("canvas").getContext("2d");
      if (context) {
        context.font = getComputedStyle(this.get("pre")).font;
        this.characterWidth = context.measureText("0").width || 7.2;
      }
      this.fitSource();
    };
    document.fonts.addEventListener("loadingdone", refreshSourceFont, {
      signal,
    });
    void document.fonts.ready.then(refreshSourceFont);
  }

  disconnectedCallback() {
    this.abort?.abort();
    this.observer?.disconnect();
    this.sourceObservation?.dispose();
    this.readouts?.disconnect();
    this.modeObserver.disconnect();
    this.mounted?.dispose();
    this.mounted = undefined;
    this.captionObserver.disconnect();
    this.inspected = undefined;
    linkedExamples.delete(this);
    this.widthControl?.cancel();
    this.widthControl = undefined;
  }
  private get<T extends Element = HTMLElement>(selector: string): T {
    const element = this.root.querySelector<T>(selector);
    if (!element) throw new Error(`Missing ${selector}`);
    return element;
  }
  /**
   * The composition this example shows now, including its reader's edits.
   * A composition is an immutable value, so a caller may keep it: later
   * edits here produce a new one. A working copy starts from this.
   */
  snapshot(): Composition {
    return this.model;
  }
  receiveWidth(width: number) {
    this.width = width;
    this.viewport.style.inlineSize = `${width}px`;
  }
  private limit() {
    return this.readouts?.maximum ?? maximumWidth;
  }
  private setWidth(width: number, persist = true, maximum = this.limit()) {
    if (!Number.isFinite(width)) {
      this.readouts?.refreshWidth();
      return;
    }
    this.width = clampWidth(width, maximum);
    if (this.linked) publishWidth(this.width, persist);
    else this.receiveWidth(this.width);
  }
  private render() {
    const rendered = this.get(".rendered");
    if (this.mounted) this.mounted.update(this.model);
    else this.mounted = mountComposition(rendered, this.model);
    prepareInspection(rendered);
    this.renderCode();
    this.refreshModes();
    this.readouts?.observeComposition(rendered);
    if (this.exercise) this.updateAuthoring();
    else this.updateInspection();
    this.receiveWidth(this.width);
  }
  private fitSource() {
    if (!this.sourceInlineSize) return;
    const columns = Math.max(
      16,
      Math.min(80, Math.floor(this.sourceInlineSize / this.characterWidth)),
    );
    if (columns === this.sourceColumns) return;
    this.sourceColumns = columns;
    const active = this.root.activeElement;
    const focused =
      active instanceof HTMLElement && active.classList.contains("code-name")
        ? active.dataset.path
        : undefined;
    this.renderCode();
    if (this.exercise) this.updateAuthoring();
    if (focused) {
      this.rove(focused);
      this.code
        .querySelector<HTMLElement>(`.code-name[data-path="${focused}"]`)
        ?.focus({ preventScroll: true });
    }
  }
  private renderCode() {
    const lines = declaration(this.model, "0", 0, this.sourceColumns);
    const fragment = document.createDocumentFragment();
    for (const line of lines) {
      const row = document.createElement("span");
      row.className = "code-line";
      row.style.setProperty("--continuation", `${(line.depth + 1) * 2}ch`);
      if (line.path) row.dataset.path = line.path;
      for (const token of line.tokens) {
        const span = document.createElement(token.kind ? "button" : "span");
        span.className = `token ${token.tone ?? "plain"}${token.kind ? " code-name" : ""}`;
        span.textContent = token.text;
        if (token.path) span.dataset.path = token.path;
        if (token.kind) {
          span.setAttribute("type", "button");
          const node = atPath(this.model, token.path!);
          span.setAttribute(
            "aria-label",
            node && !("children" in node)
              ? `${this.exercise ? "Select" : "Inspect"} ${node.kind}: ${node.text}`
              : `${this.exercise ? "Select" : "Inspect"} ${token.kind} group`,
          );
          span.tabIndex = this.structure || this.exercise ? 0 : -1;
        }
        row.append(span);
      }
      fragment.append(row);
    }
    this.code.replaceChildren(fragment);
    if (this.exercise) this.rove("0");
    highlightSource(this.code, this.structure, this.selected);
    this.refreshAccessibleNames();
  }
  private canUngroup() {
    const node =
      this.chosen.length === 1
        ? atPath(this.model, this.chosen[0]!)
        : undefined;
    return !!node && "children" in node && this.chosen[0] !== "0";
  }
  private inspectionFallback() {
    return this.exercise
      ? this.chosen.length === 1
        ? this.chosen[0]
        : undefined
      : this.pinned;
  }
  private rove(path: string) {
    for (const name of this.code.querySelectorAll<HTMLElement>(".code-name"))
      name.tabIndex = name.dataset.path === path ? 0 : -1;
  }
  private choose(path: string) {
    if (!atPath(this.model, path)) return;
    let notice: string | undefined;
    if (this.editing === "composition") {
      this.chosen = [...chooseMember(this.model, this.chosen, path)];
    } else if (this.editing === "arrangement") {
      // One node at a time, at any level; Escape clears it. A fact can be
      // selected, and then there is no group to arrange: it never stands for
      // its parent.
      this.chosen = [path];
    } else if (path === "0") {
      this.chosen = [];
      notice =
        "This Stack holds the whole example. Choose members inside it to make a group.";
    } else if (this.chosen.includes(path)) {
      this.chosen = this.chosen.filter((value) => value !== path);
      // Removing the middle of a run starts a fresh selection as well.
      if (
        this.chosen.length > 1 &&
        !neighboringMembers(this.model, this.chosen)
      )
        this.chosen = [this.chosen[0]!];
    } else {
      const next = [...this.chosen, path];
      if (this.chosen.length && !neighboringMembers(this.model, next)) {
        this.chosen = [path];
        notice = "Only neighbors can be grouped here. Order stays as written.";
      } else this.chosen = next;
    }
    this.rove(path);
    this.select(this.inspectionFallback());
    this.updateAuthoring(notice);
  }
  /** Shows the grouping actions the selection permits; returns its status. */
  private updateGrouping(): string {
    const reason = groupingReason(this.model, this.chosen);
    const group = this.get<HTMLButtonElement>(".group-action");
    group.hidden = !!reason;
    group.textContent = `Group ${this.chosen.length} members`;
    this.get<HTMLButtonElement>(".ungroup-action").hidden = !this.canUngroup();
    return this.canUngroup()
      ? "Add a neighbor to compose a larger group."
      : this.chosen.length === 1
        ? "1 member selected. Select a neighbor to group them."
        : this.chosen.length >= 2
          ? reason || `${this.chosen.length} members selected. Ready to group.`
          : "Choose two neighboring facts.";
  }
  /** Points the arrangement choice at the selected group; returns its status. */
  private updateArrangement(): string {
    const target = arrangementTarget(this.model, this.chosen);
    const choice = this.get(".arrangement");
    choice.setAttribute("aria-disabled", String(!target));
    const count = target?.group.children.length;
    this.get(".arrangement-label").textContent = !target
      ? "Arrange a group as"
      : count === 1
        ? "Arrange this member as"
        : `Arrange these ${count} members as`;
    for (const input of choice.querySelectorAll("input")) {
      input.disabled = !target;
      input.checked = input.value === target?.group.kind;
    }
    if (target) return arrangementContracts[target.group.kind];
    const [path] = this.chosen;
    const selected = path === undefined ? undefined : atPath(this.model, path);
    return selected
      ? `${selected.kind} is content, with no members to arrange. Select a group's name in the code.`
      : "Select a group's name in the code to arrange its members.";
  }
  /** Returns focus to the arrangement choice, or to the code when no group
   * is selected and the choice is disabled. */
  private focusArrangement() {
    (
      this.root.querySelector<HTMLElement>(".arrangement input:checked") ??
      this.code.querySelector<HTMLElement>('.code-name[tabindex="0"]')
    )?.focus({ preventScroll: true });
  }
  private updateAuthoring(message?: string) {
    let status: string;
    if (this.editing === "composition") {
      const arrangement = this.updateArrangement();
      const selected = selectionOf(this.model, this.chosen);
      const group = this.get<HTMLButtonElement>(".group-action");
      group.hidden = false;
      group.disabled = selected.selected !== "members" || !selected.canGroup;
      group.textContent = "Group";
      const ungroup = this.get<HTMLButtonElement>(".ungroup-action");
      ungroup.hidden = false;
      ungroup.disabled = selected.selected !== "group" || !selected.canUngroup;
      const clear = this.get<HTMLButtonElement>(".clear-action");
      clear.hidden = false;
      clear.disabled = !this.chosen.length;
      switch (selected.selected) {
        case "group":
          status = arrangement;
          break;
        case "members":
          status = selected.canGroup
            ? `${this.chosen.length} members selected. Group them, or select one again to leave it out.`
            : "These are all the members of one group. Select that group's name to arrange it.";
          break;
        case "content":
          status = "1 member selected. Select a neighbor to group them.";
          break;
        case "nothing":
          status =
            "Select neighboring facts to group them, or a group's name to arrange it.";
      }
    } else
      status =
        this.editing === "arrangement"
          ? this.updateArrangement()
          : this.updateGrouping();
    const undo = this.get<HTMLButtonElement>(".undo-action");
    const reset = this.get<HTMLButtonElement>(".reset-action");
    const initial =
      JSON.stringify(this.model) === JSON.stringify(example(this.name));
    undo.hidden = this.editing !== "composition" && !this.undo.length;
    reset.hidden = this.editing !== "composition" && initial;
    undo.disabled = !this.undo.length;
    reset.disabled = initial;
    this.get(".author-status").textContent = message ?? status;
    for (const element of this.frame.querySelectorAll<HTMLElement>(
      ".node,.leaf",
    )) {
      const chosen = this.chosen.includes(element.dataset.path!);
      element.dataset.chosen = String(chosen);
    }
    for (const element of this.code.querySelectorAll<HTMLElement>(
      "[data-path]",
    )) {
      const path = element.dataset.path!;
      element.dataset.chosen = String(
        this.chosen.some(
          (choice) => path === choice || path.startsWith(`${choice}.`),
        ),
      );
      if (element.classList.contains("code-name"))
        element.setAttribute(
          "aria-pressed",
          String(this.chosen.includes(path)),
        );
    }
    this.updateInspection();
  }
  private undoEdit() {
    const entry = this.undo.pop();
    if (!entry) return;
    const previous = entry.model;
    if (this.editing === "composition") {
      this.applyEdit(previous, {
        message: "Undid the last change. Restored its selection.",
        chosen: entry.chosen,
      });
      return;
    }
    if (this.editing !== "arrangement") {
      this.applyEdit(previous, {
        message: "Undid the last change.",
        focus: "0",
      });
      return;
    }
    // Arrangement edits keep every path, so the group whose arrangement comes
    // back can be selected to show what was undone.
    const changed = changedArrangements(this.model, previous);
    const restored =
      changed.length === 1 ? arrangementTarget(previous, changed) : undefined;
    this.applyEdit(previous, {
      message: restored
        ? `Undid the last change. This group is a ${restored.group.kind} again.`
        : "Undid the last change.",
      chosen: restored ? [restored.path] : this.chosen,
    });
  }
  private startOver() {
    if (this.editing === "composition") {
      this.commit(example(this.name), {
        message: "Returned to one sequence. Undo restores your composition.",
        chosen: [],
      });
    } else if (this.editing === "arrangement")
      this.commit(example(this.name), {
        message:
          "Returned to the starting arrangement. Undo restores your choices.",
        chosen: this.chosen,
      });
    else
      this.commit(example(this.name), {
        message: "Returned to one sequence. Undo can restore your grouping.",
        focus: "0",
      });
  }
  private commit(next: Composition, edit: AppliedEdit) {
    this.undo = [
      ...this.undo.slice(-24),
      { model: this.model, chosen: [...this.chosen] },
    ];
    this.applyEdit(next, edit);
  }
  private applyEdit(
    next: Composition,
    { message, chosen = [], focus }: AppliedEdit,
  ) {
    this.model = next;
    this.chosen = [...chosen];
    this.pinned = undefined;
    this.selected = undefined;
    this.render();
    this.selected = this.inspectionFallback();
    this.rove(focus ?? this.chosen[0] ?? "0");
    this.updateAuthoring(message);
    try {
      sessionStorage.setItem(
        `axiomatic-exercise:v1:${this.exercise}`,
        JSON.stringify({
          model: this.model,
          undo: this.undo,
          chosen: this.chosen,
        }),
      );
    } catch {}
    if (focus)
      this.code
        .querySelector<HTMLButtonElement>(`.code-name[data-path="${focus}"]`)
        ?.focus({ preventScroll: true });
  }
  private setStructure(value: boolean) {
    this.structure = value;
    this.get(".structure").setAttribute("aria-pressed", String(value));
    this.get(".structure").textContent = value
      ? "Hide structure"
      : "Show structure";
    this.code.classList.toggle("inspecting", value);
    if (!value) {
      this.selected = undefined;
      this.pinned = undefined;
    }
    for (const b of this.code.querySelectorAll<HTMLElement>(".code-name"))
      b.tabIndex = value || this.exercise ? 0 : -1;
    if (this.exercise) {
      this.rove(this.chosen[0] ?? "0");
      this.selected = this.inspectionFallback();
    }
    this.updateInspection();
  }
  private select(path: string | undefined) {
    if (this.selected === path) return;
    this.selected = path;
    this.updateInspection();
  }
  /** Effective modes can be derived from an ancestor's published arrangement.
   * Observe that semantic signal, then read CSS only for the teaching labels. */
  private refreshModes() {
    this.modes.clear();
    for (const node of this.get(".rendered").querySelectorAll<HTMLElement>(
      '[data-kind="Switcher"]',
    )) {
      this.modes.set(node.dataset.path!, getComputedStyle(node).flexDirection);
    }
    this.readouts?.refreshModes();
    this.refreshAccessibleNames();
    this.refreshCaption();
  }
  private refreshAccessibleNames() {
    // Grouping exercises contain Stacks alone; their names say what a click does.
    if (this.editing === "grouping") return;
    for (const button of this.code.querySelectorAll<HTMLElement>(
      ".code-name",
    )) {
      const path = button.dataset.path!;
      const node = atPath(this.model, path);
      if (!node || !("children" in node)) continue;
      const direction =
        node.kind === "Stack"
          ? "column"
          : node.kind === "Shelf"
            ? "row"
            : (this.modes.get(path) ?? "column");
      const name = `${this.editing ? "Select" : "Inspect"} ${node.kind}, ${currentArrangement(node.kind, direction === "row")}, ${node.children.length} members`;
      if (button.getAttribute("aria-label") !== name)
        button.setAttribute("aria-label", name);
    }
  }
  private updateInspection() {
    highlightSource(this.code, this.structure, this.selected);
    const selected = updateInspection(this.get(".rendered"), {
      structure: this.structure,
      selected:
        this.structure || this.chosen.length ? this.selected : undefined,
      preview:
        this.editing === "grouping" && !groupingReason(this.model, this.chosen)
          ? this.chosen
          : [],
    });
    if (selected !== this.inspected) {
      this.captionObserver.disconnect();
      this.inspected = selected;
      if (selected) {
        // A primitive has one uniform gap: the first adjacent pair suffices.
        for (const band of [
          ...selected.querySelectorAll(
            ':scope > [data-decoration="gap"] [data-observation="gap"]',
          ),
        ].slice(0, 2))
          this.captionObserver.observe(band);
      }
    }
    this.refreshCaption();
  }
  private refreshCaption() {
    const caption = this.get(".selection");
    const text = describeSelection(this.inspected);
    if (caption.textContent !== text) caption.textContent = text;
  }
}
if (!customElements.get("axiomatic-example"))
  customElements.define("axiomatic-example", AxiomaticExample);

// The pinned reader emits this event when source inputs change. Until it exposes
// a component lifecycle hook, refresh only when this component's bundle changed.
if (
  document
    .querySelector('meta[name="reader-sources"]')
    ?.getAttribute("content") !== "fixed"
) {
  document.addEventListener("reader-sources-changed", () => {
    void fetch(import.meta.url, { cache: "no-store" })
      .then((response) => (response.ok ? response.text() : ""))
      .then((source) => {
        const revision = source.match(/axiomatic-revision:([a-f0-9]+)/)?.[1];
        if (revision && `axiomatic-revision:${revision}` !== componentRevision)
          location.reload();
      })
      .catch(() => {
        /* Preserve the live example if the local reader is restarting. */
      });
  });
}
