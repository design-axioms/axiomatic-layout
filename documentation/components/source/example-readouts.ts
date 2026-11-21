import { inlineObservation } from "./inline-observation.ts";
import {
  compositionMembers,
  compositionAnchorName,
} from "./composition-elements.ts";

/**
 * What a rendered composition reports about itself in any host: which
 * Switchers are rows now, and whether a Shelf has more than it can show.
 * An overflowing Shelf also becomes reachable from the keyboard.
 *
 * Teaching chrome observes only the boxes whose sizes it displays. It never
 * determines the arrangement of a primitive.
 */
export class CompositionReadouts {
  protected readonly observer: ResizeObserver;
  private readonly shelves = new Set<HTMLElement>();
  private readonly shelfInputs = new Set<Element>();
  private readonly shelfObservations: ReturnType<typeof inlineObservation>[] =
    [];
  private scrollable = false;
  private readonly note: HTMLElement;
  private readonly directions: () => readonly string[];

  constructor(note: HTMLElement, directions: () => readonly string[]) {
    this.note = note;
    this.directions = directions;
    this.observer = new ResizeObserver((entries) => this.receive(entries));
  }

  protected receive(entries: readonly ResizeObserverEntry[]) {
    if (entries.some((entry) => this.shelfInputs.has(entry.target)))
      this.refreshOverflow();
  }

  /** Call after a composition edit; content-sized children expose overflow changes. */
  observeComposition(rendered: HTMLElement) {
    for (const input of this.shelfInputs) this.observer.unobserve(input);
    this.shelfInputs.clear();
    this.shelves.clear();
    for (const observation of this.shelfObservations) observation.dispose();
    this.shelfObservations.length = 0;
    for (const marker of rendered.querySelectorAll(
      '[data-decoration="overflow-extent"]',
    ))
      marker.remove();
    for (const shelf of rendered.querySelectorAll<HTMLElement>(
      '[data-kind="Shelf"]',
    )) {
      this.shelves.add(shelf);
      const width = inlineObservation(shelf);
      this.shelfObservations.push(width);
      this.shelfInputs.add(width.target);
      const members = compositionMembers(shelf);
      if (members.length) {
        const extent = shelf.ownerDocument.createElement("span");
        extent.className = "overflow-extent";
        extent.dataset.decoration = "overflow-extent";
        extent.setAttribute("aria-hidden", "true");
        extent.style.setProperty(
          "--extent-first",
          compositionAnchorName(members[0]!.dataset.path!),
        );
        extent.style.setProperty(
          "--extent-last",
          compositionAnchorName(members.at(-1)!.dataset.path!),
        );
        shelf.append(extent);
        this.shelfInputs.add(extent);
      }
    }
    for (const input of this.shelfInputs) {
      this.observer.observe(input);
    }
    this.scrollable = false;
    this.refreshModes();
  }

  refreshOverflow() {
    this.scrollable = false;
    for (const shelf of this.shelves) {
      // Scroll extent is the input to keyboard accessibility, not a fit decision.
      const overflow = shelf.scrollWidth > shelf.clientWidth + 1;
      const tabIndex = overflow ? 0 : -1;
      if (shelf.tabIndex !== tabIndex) shelf.tabIndex = tabIndex;
      if (overflow) {
        if (shelf.getAttribute("role") !== "group")
          shelf.setAttribute("role", "group");
        if (shelf.getAttribute("aria-label") !== "Scrollable row")
          shelf.setAttribute("aria-label", "Scrollable row");
        this.scrollable = true;
      } else {
        shelf.removeAttribute("role");
        shelf.removeAttribute("aria-label");
      }
    }
    this.refreshModes();
  }

  refreshModes() {
    // Naming the primitive keeps this apart from a selected group's caption.
    const modes = this.directions().map((direction) =>
      direction === "row" ? "one row" : "one column",
    );
    const note = this.scrollable
      ? "Scroll the row to read all its members."
      : modes.length
        ? `${modes.length > 1 ? "Switchers" : "Switcher"}: ${modes.join(" · ")}`
        : "";
    if (this.note.textContent !== note) this.note.textContent = note;
  }

  disconnect() {
    this.observer.disconnect();
    for (const observation of this.shelfObservations) observation.dispose();
    this.shelfObservations.length = 0;
    this.shelves.clear();
    this.shelfInputs.clear();
  }
}

/** Adds the width a resizable example has, and the widest it may request. */
export class ExampleReadouts extends CompositionReadouts {
  private actualWidth = 0;
  private maximumWidth = 720;
  private readonly stage: ReturnType<typeof inlineObservation>;
  private readonly viewport: ReturnType<typeof inlineObservation>;
  private readonly input: HTMLInputElement;

  constructor(
    stage: HTMLElement,
    viewport: HTMLElement,
    input: HTMLInputElement,
    note: HTMLElement,
    directions: () => readonly string[],
  ) {
    super(note, directions);
    this.stage = inlineObservation(stage);
    this.viewport = inlineObservation(viewport);
    this.input = input;
    this.observer.observe(this.stage.target);
    this.observer.observe(this.viewport.target);
  }

  protected override receive(entries: readonly ResizeObserverEntry[]) {
    for (const entry of entries) {
      const size = entry.contentBoxSize[0]!.inlineSize;
      if (entry.target === this.stage.target)
        this.maximumWidth = Math.max(1, Math.min(720, size));
      if (entry.target === this.viewport.target)
        this.actualWidth = Math.round(size);
    }
    this.refreshWidth();
    super.receive(entries);
  }

  get maximum(): number {
    return this.maximumWidth;
  }

  refreshWidth() {
    this.input.min = String(Math.min(160, this.maximumWidth));
    this.input.max = String(Math.floor(this.maximumWidth));
    const root = this.input.getRootNode();
    if (root instanceof ShadowRoot && root.activeElement === this.input) return;
    if (this.actualWidth) this.input.value = String(this.actualWidth);
  }

  override disconnect() {
    super.disconnect();
    this.stage.dispose();
    this.viewport.dispose();
  }
}
