/**
 * A composition as an outline: one row for each node, indented by nesting.
 *
 * This is the hierarchy for an author who has not learned to read the
 * declaration. Every node has a row, so a group can be chosen whether or not
 * it has members, and each row says in words what it is.
 *
 * It shows the same model and selection as `SourcePanel`, through the same
 * calls, so an editor can offer either one as its view of the hierarchy.
 */
import type { Composition } from "./composition.ts";
import { atPath } from "./grouping.ts";

/** What a row says about its node, beside the node's kind. */
export function outlineLabel(node: Composition, root: boolean): string {
  if (!("children" in node)) return node.text || "Empty text";
  const count = node.children.length;
  if (root) return count ? "Whole composition" : "Whole composition, empty";
  return count === 0
    ? "Empty group"
    : count === 1
      ? "1 member"
      : `${count} members`;
}

export interface OutlinePanelOptions {
  /** The accessible name of a node's row. */
  describe(path: string, node: Composition): string;
  /**
   * The author activated a node's row. `extend` is true when Shift was held,
   * which an owner may read as adding to the selection.
   */
  choose(path: string, extend: boolean): void;
  /** The pointer or focus is on a node, or has left the outline. */
  attend(path: string | undefined): void;
  readonly signal: AbortSignal;
}

export class OutlinePanel {
  readonly #host: HTMLElement;
  readonly #options: OutlinePanelOptions;
  #model: Composition | undefined;
  #roving = "0";
  #chosen: readonly string[] = [];
  #destination: string | undefined;
  #moving = false;
  #inspected: string | undefined;

  constructor(host: HTMLElement, options: OutlinePanelOptions) {
    this.#host = host;
    this.#options = options;
    const { signal } = options;
    const pathAt = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLElement>("[data-path]")?.dataset.path
        : undefined;
    host.addEventListener(
      "click",
      (event) => {
        const path = pathAt(event.target);
        if (path) options.choose(path, event.shiftKey);
      },
      { signal },
    );
    host.addEventListener(
      "pointerover",
      (event) => {
        const path = pathAt(event.target);
        if (path) options.attend(path);
      },
      { signal },
    );
    host.addEventListener("pointerleave", () => options.attend(undefined), {
      signal,
    });
    host.addEventListener(
      "focusin",
      (event) => {
        const path = pathAt(event.target);
        if (!path) return;
        this.rove(path);
        options.attend(path);
      },
      { signal },
    );
    host.addEventListener(
      "focusout",
      (event) => {
        if (
          !(event.relatedTarget instanceof Node) ||
          !host.contains(event.relatedTarget)
        )
          options.attend(undefined);
      },
      { signal },
    );
    host.addEventListener(
      "keydown",
      (event) => {
        const rows = this.#rows();
        const at = rows.indexOf(event.target as HTMLElement);
        const to: Record<string, number> = {
          ArrowDown: at + 1,
          ArrowUp: at - 1,
          Home: 0,
          End: rows.length - 1,
        };
        const next = to[event.key];
        if (at < 0 || next === undefined) return;
        event.preventDefault();
        rows[next]?.focus();
      },
      { signal },
    );
  }

  /** Lists `model`. Focus on a row stays with the node at the same path. */
  show(model: Composition) {
    this.#model = model;
    const document = this.#host.ownerDocument;
    const root = this.#host.getRootNode() as Document | ShadowRoot;
    const active = root.activeElement;
    const focused =
      active instanceof HTMLElement && this.#host.contains(active)
        ? active.dataset.path
        : undefined;
    const item = (node: Composition, path: string, depth: number) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "outline-row";
      row.dataset.path = path;
      // CSS turns the depth into an indent.
      row.style.setProperty("--depth", String(depth));
      const empty = "children" in node ? !node.children.length : !node.text;
      row.toggleAttribute("data-empty", empty);
      for (const [name, text] of [
        ["row-kind", node.kind],
        ["row-label", outlineLabel(node, path === "0")],
        ["row-state", ""],
      ] as const) {
        const part = document.createElement("span");
        part.className = name;
        part.textContent = text;
        row.append(part);
      }
      const entry = document.createElement("li");
      entry.append(row);
      if ("children" in node && node.children.length) {
        const members = document.createElement("ul");
        node.children.forEach((child, index) =>
          members.append(item(child, `${path}.${index}`, depth + 1)),
        );
        entry.append(members);
      }
      return entry;
    };
    const list = document.createElement("ul");
    list.append(item(model, "0", 0));
    this.#host.replaceChildren(list);
    this.#decorate();
    if (focused) this.focus(focused);
    else this.rove(this.#roving);
  }

  /** Marks the selection. */
  mark(chosen: readonly string[]) {
    this.#chosen = chosen;
    this.#decorate();
  }

  /** Marks a proposed move destination without changing the selection. */
  destination(path: string | undefined, moving = false) {
    this.#destination = path;
    this.#moving = moving;
    this.#decorate();
  }

  /** Marks the node whose boundary the previews are showing. */
  inspect(structure: boolean, path: string | undefined) {
    this.#inspected = structure ? path : undefined;
    this.#decorate();
  }

  /** Puts the row at `path`, or the root's, in the tab order. */
  rove(path: string) {
    const rows = this.#rows();
    const target = rows.find((row) => row.dataset.path === path) ?? rows[0];
    this.#roving = target?.dataset.path ?? "0";
    for (const row of rows) row.tabIndex = row === target ? 0 : -1;
  }

  /** Moves keyboard focus to the row at `path`, scrolling it into view. */
  focus(path: string) {
    this.rove(path);
    this.#host
      .querySelector<HTMLElement>('.outline-row[tabindex="0"]')
      ?.focus();
  }

  #rows(): HTMLElement[] {
    return [...this.#host.querySelectorAll<HTMLElement>(".outline-row")];
  }

  #decorate() {
    for (const row of this.#rows()) {
      const path = row.dataset.path!;
      const chosen = this.#chosen.includes(path);
      const target = path === this.#destination;
      row.dataset.chosen = String(chosen);
      row.toggleAttribute("data-destination", target);
      row.toggleAttribute("data-inspected", path === this.#inspected);
      // While moving, a row chooses a destination. The selection is what
      // moves, so it is named in words and is no longer a pressed choice.
      if (this.#moving) row.removeAttribute("aria-pressed");
      else row.setAttribute("aria-pressed", String(chosen));
      if (target) row.setAttribute("aria-current", "true");
      else row.removeAttribute("aria-current");
      const state = target
        ? "destination"
        : this.#moving && chosen
          ? "moving"
          : "";
      const note = row.querySelector(".row-state")!;
      if (note.textContent !== state) note.textContent = state;
      const node = this.#model && atPath(this.#model, path);
      if (node)
        row.setAttribute("aria-label", this.#options.describe(path, node));
    }
  }
}
