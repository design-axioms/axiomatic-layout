/** Interaction study. Uses the real composition model and layout runtime;
 * document persistence and move destinations stay in the established editor. */
import base from "../../documentation/components/source/example.css";
import primitive from "../../documentation/components/source/primitives.css";
import inspection from "../../documentation/components/source/inspection.css";
import palette from "../../documentation/components/source/composition-palette.generated.css";
import styles from "./workbench.css";
import {
  Stack,
  Switcher,
  type Composition,
} from "../../documentation/components/source/composition.ts";
import { CompositionPreview } from "../../documentation/components/source/composition-preview.ts";
import { SourcePanel } from "../../documentation/components/source/source-panel.ts";
import {
  atPath,
  parentPath,
} from "../../documentation/components/source/grouping.ts";
import { chooseMember } from "../../documentation/components/source/composition-editing.ts";
import {
  arrangeGroup,
  arrangementContracts,
  arrangements,
  isArrangement,
} from "../../documentation/components/source/arrangement.ts";
import {
  addText,
  addGroup,
  editContentKind,
  contentKinds,
  isContentKind,
  editsFor,
  startWorkingCopy,
  commitEdit,
  undoEdit,
  wrapMembers,
  releaseGroup,
  removeMember,
  beginTextEdit,
  typeText,
  finishTextEdit,
  cancelTextEdit,
  type Edited,
  type TextEdit,
} from "../../documentation/components/source/working-copy.ts";

const sample = Stack(
  { kind: "Heading", text: "Investigation complete" },
  Stack(
    { kind: "Text", text: "Execution completed" },
    { kind: "Meta", text: "Run lasted 4m 1s" },
  ),
  Switcher(
    { kind: "Text", text: "Remediation plan proposed" },
    { kind: "Text", text: "Review the changes" },
    { kind: "Meta", text: "Awaiting approval" },
  ),
);
const initial = Stack({ kind: "Text", text: "New text" });
const rolePurpose = {
  Text: "The main wording of your composition.",
  Heading: "Names a section of your composition.",
  Meta: "Supporting context, such as a time or a source.",
};

class WorkbenchStudy extends HTMLElement {
  readonly root = this.attachShadow({ mode: "open" });
  private copy = {
    ...startWorkingCopy(initial),
    chosen: ["0.0"] as readonly string[],
  };
  private edit: TextEdit | undefined;
  private together = false;
  private insertAfter = false;
  private structure = false;
  private views: CompositionPreview[] = [];
  private source: SourcePanel | undefined;
  private abort = new AbortController();

  connectedCallback() {
    this.root.innerHTML = `<style>${base}${primitive}${inspection}${palette}${styles}</style>
      <div class="document-bar"><div><h1>Your composition</h1><p class="subtitle">Choose a part. Change its content or how its members belong together.</p></div><div class="document-actions"><button class="undo" disabled>Undo</button><details class="examples"><summary>Try a starting point</summary><div><button data-start="blank">Empty composition</button><button data-start="simple">One line of text</button><button data-start="investigation">Investigation</button></div></details></div></div>
      <div class="workbench">
        <aside class="editing" aria-label="Composition editor">
          <section class="outline-section"><div class="section-head"><h2>Composition</h2><button class="together" aria-pressed="false">Select several</button></div><p class="select-help" hidden>Select neighboring items to group them.</p><div class="view-choice" role="group" aria-label="Composition view"><button class="show-outline" aria-pressed="true">Outline</button><button class="show-code" aria-pressed="false">Code</button></div><nav class="outline" aria-label="Composition outline"></nav><div class="source" hidden><pre aria-label="Composition code"><code></code></pre></div></section>
          <section class="inspector" aria-label="Selected part"><div class="selection-context"><button class="parent"></button><h2 class="selected-title"></h2><span class="selected-detail"></span></div>
            <label class="wording">Wording<input class="words" autocomplete="off"></label>
            <fieldset class="roles"><legend>Content role</legend>${contentKinds.map((k) => `<label><input type="radio" name="role" value="${k}">${k}</label>`).join("")}<p class="role-purpose"></p></fieldset>
            <fieldset class="arrangements"><legend>Arrangement</legend>${arrangements.map((k) => `<label><input type="radio" name="arrangement" value="${k}"><span>${k} <small>${k === "Stack" ? "One column" : k === "Shelf" ? "One row" : "Row when it fits"}</small></span></label>`).join("")}<p class="arrangement-purpose"></p></fieldset>
            <div class="add-area"><p class="insertion-context"></p><button class="insert-after" hidden></button><div class="add-actions"><button class="add-text primary">+ Add text</button><details class="add-group"><summary>+ Add group</summary><div>${arrangements.map((k) => `<button data-add="${k}">${k} <small>${k === "Stack" ? "One column" : k === "Shelf" ? "One row" : "Row when it fits"}</small></button>`).join("")}</div></details></div></div>
            <div class="selection-actions"><button class="group">Group in a Stack</button><button class="ungroup">Ungroup</button><button class="remove">Remove</button></div>
          </section>
          <p class="feedback" role="status" aria-live="polite"></p>
        </aside>
        <section class="results" aria-label="Composition results"><div class="result-heading"><div><h2>One composition, two spaces</h2><p>Select in either view. Drag the card’s edge to change its space.</p></div><button class="structure" aria-pressed="false">Show structure</button></div><div class="preview-limit" aria-hidden="true"></div><div class="previews"></div><p class="empty-hint" hidden>Your composition is empty. Add text or a group to begin.</p></section>
      </div>`;
    this.get(".workbench").prepend(this.get(".results"));
    const signal = this.abort.signal;
    const on = (selector: string, callback: () => void) =>
      this.get(selector).addEventListener("click", callback, { signal });
    for (const view of ["outline", "code"] as const)
      on(`.show-${view}`, () => {
        this.get(".outline").hidden = view !== "outline";
        this.get(".source").hidden = view !== "code";
        this.get(".show-outline").setAttribute(
          "aria-pressed",
          String(view === "outline"),
        );
        this.get(".show-code").setAttribute(
          "aria-pressed",
          String(view === "code"),
        );
      });
    on(".undo", () => {
      this.finish();
      const before = undoEdit(this.copy);
      if (before) {
        this.copy = before;
        this.insertAfter = false;
        this.render("Undid the last change.");
        if (this.get<HTMLButtonElement>(".undo").disabled) {
          const path = this.copy.chosen[0] ?? "0";
          if (this.get(".outline").hidden) this.source?.focus(path);
          else
            this.get<HTMLButtonElement>(
              `[data-outline-path="${path}"]`,
            )?.focus();
        }
      }
    });
    on(".together", () => {
      this.finish();
      this.together = !this.together;
      if (!this.together)
        this.copy = { ...this.copy, chosen: this.copy.chosen.slice(0, 1) };
      this.refresh();
    });
    on(".parent", () => {
      const path = parentPath(this.copy.chosen[0] ?? "0");
      this.choose(path, true);
      if (this.get(".outline").hidden) this.source?.focus(path);
      else
        this.get<HTMLButtonElement>(`[data-outline-path="${path}"]`)?.focus();
    });
    on(".structure", () => {
      this.structure = !this.structure;
      this.refresh();
    });
    on(".insert-after", () => {
      this.insertAfter = !this.insertAfter;
      this.refresh();
    });
    on(".add-text", () => this.add("Text"));
    on(".group", () => {
      const e = editsFor(this.copy.model, this.copy.chosen);
      if (e.wrap) {
        this.together = false;
        this.apply(
          wrapMembers(this.copy.model, e.wrap),
          "Grouped the selection in a Stack.",
        );
      }
    });
    on(".ungroup", () => {
      const e = editsFor(this.copy.model, this.copy.chosen);
      if (e.release)
        this.apply(
          releaseGroup(this.copy.model, e.release),
          "Ungrouped. The members keep their order.",
        );
    });
    on(".remove", () => {
      const e = editsFor(this.copy.model, this.copy.chosen);
      if (e.remove)
        this.apply(
          removeMember(this.copy.model, e.remove),
          "Removed. Undo restores it.",
        );
    });
    this.root.addEventListener(
      "click",
      (event) => {
        const target = event.target as Element;
        const add = target.closest<HTMLElement>("[data-add]")?.dataset.add;
        if (add && isArrangement(add)) this.add(add);
        const start =
          target.closest<HTMLElement>("[data-start]")?.dataset.start;
        if (start) {
          this.get<HTMLDetailsElement>(".examples").open = false;
          this.together = false;
          if (start === "investigation")
            this.get(".preview[data-preview=wide] .viewport").style.inlineSize =
              "600px";
          this.apply(
            {
              tree:
                start === "blank"
                  ? Stack()
                  : start === "simple"
                    ? initial
                    : sample,
              chosen: ["0"],
            },
            "Loaded a starting point. Undo restores your previous work.",
          );
        }
      },
      { signal },
    );
    this.get(".outline").addEventListener(
      "click",
      (event) => {
        const path = (event.target as Element).closest<HTMLElement>(
          "[data-outline-path]",
        )?.dataset.outlinePath;
        if (path) this.choose(path, false, (event as MouseEvent).shiftKey);
      },
      { signal },
    );
    this.get(".outline").addEventListener(
      "keydown",
      (event) => {
        const key = (event as KeyboardEvent).key;
        if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(key)) return;
        const buttons = [
          ...this.get(".outline").querySelectorAll<HTMLButtonElement>("button"),
        ];
        const i = buttons.indexOf(event.target as HTMLButtonElement);
        const next =
          key === "Home"
            ? 0
            : key === "End"
              ? buttons.length - 1
              : i + (key === "ArrowDown" ? 1 : -1);
        event.preventDefault();
        buttons[next]?.focus();
      },
      { signal },
    );
    this.get<HTMLInputElement>(".words").addEventListener(
      "input",
      () => {
        const at = editsFor(this.copy.model, this.copy.chosen).text;
        if (!at) return;
        this.edit ??= beginTextEdit(this.copy, at.path);
        this.copy = typeText(
          this.copy,
          this.edit,
          this.get<HTMLInputElement>(".words").value,
        );
        this.render();
      },
      { signal },
    );
    this.get(".words").addEventListener(
      "blur",
      () => {
        this.finish();
        this.refresh();
      },
      { signal },
    );
    this.root.addEventListener(
      "keydown",
      (event) => {
        const key = event as KeyboardEvent;
        if (key.isComposing || key.keyCode === 229) return;
        if (key.key === "Escape") {
          if (event.target === this.get(".words") && this.edit) {
            this.copy = cancelTextEdit(this.copy, this.edit);
            this.edit = undefined;
            this.render("Restored the wording before this edit.");
            event.preventDefault();
            return;
          }
          const details = (event.target as Element).closest("details[open]");
          if (details instanceof HTMLDetailsElement) {
            details.open = false;
            details.querySelector("summary")?.focus();
            event.preventDefault();
          }
        }
        if (key.key === "Enter" && event.target === this.get(".words")) {
          this.finish();
          this.refresh();
        }
      },
      { signal },
    );
    this.root.addEventListener(
      "change",
      (event) => {
        const input = event.target as HTMLInputElement;
        this.finish();
        const e = editsFor(this.copy.model, this.copy.chosen);
        if (input.name === "role" && isContentKind(input.value) && e.text)
          this.apply({
            tree: editContentKind(this.copy.model, e.text.path, input.value),
            chosen: this.copy.chosen,
          });
        if (
          input.name === "arrangement" &&
          isArrangement(input.value) &&
          e.arrange
        )
          this.apply({
            tree: arrangeGroup(this.copy.model, e.arrange.path, input.value),
            chosen: this.copy.chosen,
          });
      },
      { signal },
    );
    this.views = [
      new CompositionPreview(this.ownerDocument, {
        label: "Resizable card",
        slot: "wide",
        width: {
          initial: 445,
          availableSpace: this.get(".preview-limit"),
          changed: () => {},
        },
        choose: (path) => this.choose(path),
        attend: () => {},
      }),
      new CompositionPreview(this.ownerDocument, {
        label: "Narrow rail",
        slot: "rail",
        choose: (path) => this.choose(path),
        attend: () => {},
      }),
    ];
    this.get(".previews").append(...this.views.map((v) => v.element));
    this.source = new SourcePanel(this.get("pre"), {
      describe: (_path, node) =>
        `Select ${node.kind}${"text" in node ? `: ${node.text}` : " group"}`,
      choose: (path) => this.choose(path),
      attend: () => {},
      signal,
    });
    this.render();
  }
  private get<T extends HTMLElement = HTMLElement>(selector: string): T {
    return this.root.querySelector<T>(selector)!;
  }
  private finish() {
    if (this.edit) {
      this.copy = finishTextEdit(this.copy, this.edit);
      this.edit = undefined;
    }
  }
  private choose(path: string, single = false, extend = false) {
    this.finish();
    const selected =
      !single && (this.together || extend)
        ? chooseMember(this.copy.model, this.copy.chosen, path)
        : [path];
    this.copy = { ...this.copy, chosen: selected.length ? selected : [path] };
    this.insertAfter = false;
    if (single) this.together = false;
    this.refresh();
  }
  private apply(edited: Edited, message = "") {
    this.finish();
    if (JSON.stringify(edited.tree) === JSON.stringify(this.copy.model)) {
      this.copy = { ...this.copy, chosen: edited.chosen };
      this.refresh();
      return;
    }
    this.insertAfter = false;
    this.copy = commitEdit(this.copy, edited.tree, edited.chosen);
    this.render(message);
    const path = this.copy.chosen[0] ?? "0";
    const active = this.root.activeElement as HTMLElement | null;
    if (active?.matches("input[type=radio]")) return;
    if (this.get(".outline").hidden) this.source?.focus(path);
    else
      this.get<HTMLButtonElement>(`[data-outline-path="${path}"]`)?.focus({
        preventScroll: true,
      });
  }
  private add(kind: "Text" | "Stack" | "Shelf" | "Switcher") {
    this.finish();
    const e = editsFor(this.copy.model, this.copy.chosen);
    const place = this.insertAfter ? e.after : (e.inside ?? e.after);
    if (!place) return;
    this.get<HTMLDetailsElement>(".add-group").open = false;
    this.together = false;
    this.apply(
      kind === "Text"
        ? addText(this.copy.model, place)
        : addGroup(this.copy.model, place, kind),
      kind === "Text"
        ? "Added text. You can write now."
        : `Added an empty ${kind}. Add content inside it.`,
    );
    if (kind === "Text") {
      const input = this.get<HTMLInputElement>(".words");
      input.focus();
      input.select();
    } else this.get<HTMLButtonElement>(".add-text").focus();
  }
  private render(message = "") {
    for (const view of this.views) view.render(this.copy.model, true);
    this.source?.show(this.copy.model);
    const focused = (this.root.activeElement as HTMLElement | null)?.dataset
      .outlinePath;
    const list = (node: Composition, path: string): HTMLLIElement => {
      const li = document.createElement("li");
      const button = document.createElement("button");
      button.dataset.outlinePath = path;
      const kind = document.createElement("span");
      kind.className = "kind";
      kind.textContent = node.kind;
      const label = document.createElement("span");
      label.className = "node-label";
      label.textContent =
        "children" in node
          ? path === "0"
            ? "Whole composition"
            : node.children.length
              ? `${node.children.length} ${node.children.length === 1 ? "member" : "members"}`
              : "Empty group"
          : node.text || "Empty text";
      button.append(kind, label);
      button.title = `${node.kind}: ${label.textContent}`;
      li.append(button);
      if ("children" in node && node.children.length) {
        const ul = document.createElement("ul");
        node.children.forEach((child, i) =>
          ul.append(list(child, `${path}.${i}`)),
        );
        li.append(ul);
      }
      return li;
    };
    const ul = document.createElement("ul");
    ul.append(list(this.copy.model, "0"));
    this.get(".outline").replaceChildren(ul);
    this.refresh();
    if (focused)
      this.get<HTMLButtonElement>(`[data-outline-path="${focused}"]`)?.focus({
        preventScroll: true,
      });
    this.get(".feedback").textContent = message;
  }
  private refresh() {
    const { model, chosen } = this.copy;
    const e = editsFor(model, chosen);
    const path = chosen[0] ?? "0";
    const node = atPath(model, path)!;
    const one = chosen.length < 2;
    this.get(".inspector").toggleAttribute("data-multiple", !one);
    this.get(".selected-title").textContent = one
      ? node.kind
      : `${chosen.length} members selected`;
    this.get(".selected-detail").textContent =
      one && "children" in node
        ? `${node.children.length} ${node.children.length === 1 ? "member" : "members"}`
        : "";
    const parent = this.get(".parent");
    parent.hidden = path === "0";
    parent.textContent =
      path === "0" ? "" : `↑ In ${atPath(model, parentPath(path))!.kind}`;
    this.get(".wording").hidden = !e.text;
    const words = this.get<HTMLInputElement>(".words");
    if (words.value !== e.text?.content.text)
      words.value = e.text?.content.text ?? "";
    this.get(".roles").hidden = !e.text;
    this.get(".arrangements").hidden = !e.arrange;
    this.get(".role-purpose").textContent = e.text
      ? rolePurpose[e.text.content.kind]
      : "";
    this.get(".arrangement-purpose").textContent = e.arrange
      ? arrangementContracts[e.arrange.group.kind]
      : "";
    for (const input of this.root.querySelectorAll<HTMLInputElement>(
      "input[type=radio]",
    ))
      input.checked =
        input.name === "role"
          ? input.value === e.text?.content.kind
          : input.value === e.arrange?.group.kind;
    this.get(".insert-after").hidden = !(e.inside && e.after);
    this.get(".insert-after").textContent = this.insertAfter
      ? "Add inside this group instead"
      : "Add after this group instead";
    this.get(".insertion-context").textContent =
      e.inside && !this.insertAfter
        ? `Add inside this ${e.inside.group.kind}`
        : chosen.length > 1
          ? "Add after these members"
          : `Add after this ${node.kind}`;
    this.get<HTMLButtonElement>(".add-text").disabled = !(e.inside || e.after);
    this.get(".add-group").hidden = !(e.inside || e.after);
    this.get(".group").hidden = !e.wrap;
    this.get(".ungroup").hidden = !e.release;
    this.get(".remove").hidden = !e.remove;
    this.get<HTMLButtonElement>(".undo").disabled =
      !this.edit && !this.copy.undo.length;
    this.get(".together").textContent = this.together
      ? "Done selecting"
      : "Select several";
    this.get(".together").setAttribute("aria-pressed", String(this.together));
    this.get(".select-help").hidden = !this.together;
    this.get(".structure").textContent = this.structure
      ? "Hide structure"
      : "Show structure";
    this.get(".structure").setAttribute("aria-pressed", String(this.structure));
    this.get(".empty-hint").hidden = !(
      "children" in model && model.children.length === 0
    );
    for (const button of this.root.querySelectorAll<HTMLButtonElement>(
      "[data-outline-path]",
    )) {
      button.setAttribute(
        "aria-pressed",
        String(chosen.includes(button.dataset.outlinePath!)),
      );
      button.tabIndex = button.dataset.outlinePath === path ? 0 : -1;
    }
    for (const view of this.views)
      view.decorate({
        chosen,
        inspected: chosen.length === 1 ? chosen[0] : undefined,
        structure: this.structure,
      });
    this.source?.mark(chosen);
    this.source?.rove(path);
    this.source?.inspect(
      this.structure,
      chosen.length === 1 ? chosen[0] : undefined,
    );
  }
  disconnectedCallback() {
    this.abort.abort();
    for (const view of this.views) view.dispose();
    this.source?.dispose();
  }
}
customElements.define("axiomatic-workbench-study", WorkbenchStudy);
