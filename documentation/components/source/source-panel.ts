/**
 * A composition's declaration, printed to fit its own panel, with every node
 * name a button.
 *
 * The declaration is where any node can always be reached: a group with no
 * members renders nothing in a preview, and its name is still here.
 *
 * The panel responds to its own inputs: the composition, the panel's width
 * and its font. It keeps keyboard focus on the same node when it reprints,
 * and one name in the tab order, moved with the Up and Down keys.
 */
import { declaration, type Composition } from "./composition.ts";
import { atPath } from "./grouping.ts";
import { highlightSource } from "./inspection.ts";
import { inlineObservation } from "./inline-observation.ts";

export interface SourcePanelOptions {
  /** The accessible name of a node's button. */
  describe(path: string, node: Composition): string;
  /**
   * The reader activated a node's name. `extend` is true when Shift was
   * held, which an owner may read as adding to the selection.
   */
  choose(path: string, extend: boolean): void;
  /** The pointer or focus is on a node, or has left the declaration. */
  attend(path: string | undefined): void;
  /**
   * Whether `focus` may scroll the name into view. A panel inside its own
   * scrolling box needs this; a panel in the page's flow keeps the page
   * where its reader left it.
   */
  readonly revealFocus?: boolean;
  readonly signal: AbortSignal;
}

export class SourcePanel {
  readonly code: HTMLElement;
  readonly #options: SourcePanelOptions;
  readonly #observer: ResizeObserver;
  readonly #width: ReturnType<typeof inlineObservation>;
  #model: Composition | undefined;
  #columns = 80;
  #characterWidth = 7.2;
  #inlineSize = 0;
  #roving = "0";
  #chosen: readonly string[] = [];
  #destination: string | undefined;
  #moving = false;
  #structure = false;
  #inspected: string | undefined;

  constructor(pre: HTMLElement, options: SourcePanelOptions) {
    const code = pre.querySelector("code");
    if (!code) throw new Error("A source panel needs a code element");
    this.code = code;
    this.#options = options;
    const { signal } = options;
    this.#width = inlineObservation(pre);
    this.#observer = new ResizeObserver((entries) => {
      const size = entries.at(-1)?.contentBoxSize[0];
      if (!size) return;
      this.#inlineSize = size.inlineSize;
      this.#fit();
    });
    this.#observer.observe(this.#width.target);
    const measureFont = () => {
      if (signal.aborted) return;
      const context = code.ownerDocument
        .createElement("canvas")
        .getContext("2d");
      if (context) {
        context.font = getComputedStyle(pre).font;
        this.#characterWidth = context.measureText("0").width || 7.2;
      }
      this.#fit();
    };
    code.ownerDocument.fonts.addEventListener("loadingdone", measureFont, {
      signal,
    });
    void code.ownerDocument.fonts.ready.then(measureFont);

    const pathAt = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLElement>("[data-path]")?.dataset.path
        : undefined;
    code.addEventListener(
      "click",
      (event) => {
        const path = pathAt(event.target);
        if (path) options.choose(path, event.shiftKey);
      },
      { signal },
    );
    code.addEventListener(
      "pointerover",
      (event) => {
        const path = pathAt(event.target);
        if (path) options.attend(path);
      },
      { signal },
    );
    code.addEventListener("pointerleave", () => options.attend(undefined), {
      signal,
    });
    code.addEventListener(
      "focusin",
      (event) => {
        const name = event.target;
        if (!(name instanceof HTMLElement) || !name.dataset.path) return;
        this.rove(name.dataset.path);
        options.attend(name.dataset.path);
      },
      { signal },
    );
    code.addEventListener(
      "focusout",
      (event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !code.contains(event.relatedTarget)
        )
          options.attend(undefined);
      },
      { signal },
    );
    code.addEventListener(
      "keydown",
      (event) => {
        if (
          (event.key !== "ArrowUp" && event.key !== "ArrowDown") ||
          !(event.target instanceof HTMLElement) ||
          !event.target.classList.contains("code-name")
        )
          return;
        const names = this.#names();
        const next =
          names[
            names.indexOf(event.target) + (event.key === "ArrowDown" ? 1 : -1)
          ];
        event.preventDefault();
        next?.focus();
      },
      { signal },
    );
  }

  /** Prints `model`. Focus on a name stays with the node at the same path. */
  show(model: Composition) {
    this.#model = model;
    this.#print();
  }

  /** Marks the selection: each selected node, and the lines it spans. */
  mark(chosen: readonly string[]) {
    this.#chosen = chosen;
    for (const element of this.code.querySelectorAll<HTMLElement>(
      "[data-path]",
    )) {
      const path = element.dataset.path!;
      element.dataset.chosen = String(
        chosen.some(
          (choice) => path === choice || path.startsWith(`${choice}.`),
        ),
      );
      if (element.classList.contains("code-name")) {
        // In move mode these buttons choose a destination, not the moving
        // selection. Their names describe sources; aria-current marks target.
        if (this.#moving) element.removeAttribute("aria-pressed");
        else
          element.setAttribute("aria-pressed", String(chosen.includes(path)));
      }
    }
  }

  /** Marks a proposed move destination without changing the selection. */
  destination(path: string | undefined, moving = false) {
    this.#destination = path;
    this.#moving = moving;
    for (const name of this.#names()) {
      name.toggleAttribute("data-destination", name.dataset.path === path);
      if (name.dataset.path === path) name.setAttribute("aria-current", "true");
      else name.removeAttribute("aria-current");
      const member = this.#model && atPath(this.#model, name.dataset.path!);
      if (member)
        name.setAttribute(
          "aria-label",
          this.#options.describe(name.dataset.path!, member),
        );
    }
  }

  /** Marks the node whose boundary the previews are showing. */
  inspect(structure: boolean, path: string | undefined) {
    this.#structure = structure;
    this.#inspected = path;
    this.code.classList.toggle("inspecting", structure);
    highlightSource(this.code, structure, path);
  }

  /** Puts the name at `path`, or the root's, in the tab order. */
  rove(path: string) {
    const names = this.#names();
    const target = names.find((name) => name.dataset.path === path) ?? names[0];
    this.#roving = target?.dataset.path ?? "0";
    for (const name of names) name.tabIndex = name === target ? 0 : -1;
  }

  /** Moves keyboard focus to the name at `path`. */
  focus(path: string) {
    this.rove(path);
    this.code
      .querySelector<HTMLElement>('.code-name[tabindex="0"]')
      ?.focus({ preventScroll: !this.#options.revealFocus });
  }

  dispose() {
    this.#observer.disconnect();
    this.#width.dispose();
  }

  #names(): HTMLElement[] {
    return [...this.code.querySelectorAll<HTMLElement>(".code-name")];
  }

  #fit() {
    if (!this.#inlineSize) return;
    const columns = Math.max(
      16,
      Math.min(80, Math.floor(this.#inlineSize / this.#characterWidth)),
    );
    if (columns === this.#columns) return;
    this.#columns = columns;
    this.#print();
  }

  #print() {
    const model = this.#model;
    if (!model) return;
    const root = this.code.getRootNode() as Document | ShadowRoot;
    const active = root.activeElement;
    const focused =
      active instanceof HTMLElement && this.code.contains(active)
        ? active.dataset.path
        : undefined;
    const fragment = this.code.ownerDocument.createDocumentFragment();
    for (const line of declaration(model, "0", 0, this.#columns)) {
      const row = this.code.ownerDocument.createElement("span");
      row.className = "code-line";
      row.style.setProperty("--continuation", `${(line.depth + 1) * 2}ch`);
      if (line.path) row.dataset.path = line.path;
      for (const token of line.tokens) {
        const span = this.code.ownerDocument.createElement(
          token.kind ? "button" : "span",
        );
        span.className = `token ${token.tone ?? "plain"}${token.kind ? " code-name" : ""}`;
        span.textContent = token.text;
        if (token.path) span.dataset.path = token.path;
        if (token.kind && token.path) {
          span.setAttribute("type", "button");
          const node = atPath(model, token.path);
          if (node)
            span.setAttribute(
              "aria-label",
              this.#options.describe(token.path, node),
            );
        }
        row.append(span);
      }
      fragment.append(row);
    }
    this.code.replaceChildren(fragment);
    this.mark(this.#chosen);
    this.destination(this.#destination, this.#moving);
    this.inspect(this.#structure, this.#inspected);
    if (focused) this.focus(focused);
    else this.rove(this.#roving);
  }
}
