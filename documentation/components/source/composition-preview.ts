/**
 * One hosted view of a composition: a labeled slot, the rendered boxes, and
 * a caption saying what happened in that slot.
 *
 * Several previews can show the same composition at once. Each mounts its
 * own boxes, so each Switcher is decided from the space its own host gives
 * it, and each keeps its inspection anchors inside its own `.rendered` scope.
 * The host's size comes from CSS (`[data-preview]`); a preview with a
 * `width` option also lets the reader request one.
 *
 * The owner supplies the composition and the selection. A preview reports
 * the node a reader points at or chooses, by its authored path.
 */
import type { Composition } from "./composition.ts";
import {
  compositionMembers,
  compositionSelector,
} from "./composition-elements.ts";
import { CompositionReadouts, ExampleReadouts } from "./example-readouts.ts";
import {
  describeSelection,
  prepareInspection,
  updateInspection,
} from "./inspection.ts";
import { mountComposition, type MountedComposition } from "./primitives.ts";
import { arrangementAttribute } from "./switcher-coordinator.ts";
import {
  clampWidth,
  maximumWidth,
  minimumWidth,
  widthControl,
  type WidthControl,
} from "./width-control.ts";

export interface PreviewOptions {
  /** Names the slot for a reader, such as "Wide card". */
  readonly label: string;
  /** Names the slot for CSS, which sizes `[data-preview="…"]`. */
  readonly slot: string;
  /** Present when the reader may request this host's width. */
  readonly width?: {
    readonly initial: number;
    /** Independent space available for resizing when the preview itself
     * shrink-wraps its requested width. Must establish a containing block. */
    readonly availableSpace?: HTMLElement;
    /** `settled` is false while a drag continues. */
    changed(width: number, settled: boolean): void;
  };
  /** The reader clicked the node at `path`. */
  choose(path: string): void;
  /** The pointer is over the node at `path`, or has left the composition. */
  attend(path: string | undefined): void;
}

/** What the owner's selection asks every preview to show. */
export interface PreviewDecoration {
  /** Tint every box so nesting is visible. */
  readonly structure: boolean;
  /** The node whose boundary, gaps and caption are shown. */
  readonly inspected: string | undefined;
  /** The selected nodes. */
  readonly chosen: readonly string[];
  /** A proposed move destination, distinct from the members being moved. */
  readonly destination?: string | undefined;
}

export class CompositionPreview {
  readonly element: HTMLElement;
  readonly #rendered: HTMLElement;
  readonly #caption: HTMLElement;
  readonly #readouts: CompositionReadouts;
  readonly #abort = new AbortController();
  readonly #modeObserver = new MutationObserver(() => this.#refreshModes());
  readonly #captionObserver = new ResizeObserver(() => this.#refreshCaption());
  readonly #widthControl: WidthControl | undefined;
  #mounted: MountedComposition | undefined;
  #modes: string[] = [];
  #inspected: HTMLElement | undefined;

  constructor(document: Document, options: PreviewOptions) {
    const { signal } = this.#abort;
    const element = document.createElement("section");
    element.className = "preview";
    element.dataset.preview = options.slot;
    const labelId = `preview-${options.slot}`;
    element.setAttribute("aria-labelledby", labelId);
    element.innerHTML = `<div class="stage"><div class="viewport"><div class="bar"><span class="preview-label" id="${labelId}"></span>${
      options.width
        ? `<label class="width"><span class="sr-only"></span><input type="number" min="${minimumWidth}" max="${maximumWidth}" step="1"><span aria-hidden="true">px</span></label>`
        : ""
    }</div><div class="frame"><div class="rendered"></div>${
      options.width
        ? '<div class="resize" aria-hidden="true" title="Drag to resize. Edit the width field for keyboard control."></div>'
        : ""
    }</div></div></div><div class="caption"><span class="selection"></span><span class="note"></span></div>`;
    const get = <T extends HTMLElement = HTMLElement>(selector: string) =>
      element.querySelector<T>(selector)!;
    get(".preview-label").textContent = options.label;
    this.element = element;
    this.#rendered = get(".rendered");
    this.#caption = get(".selection");
    const viewport = get(".viewport");
    const directions = () => this.#modes;

    if (options.width) {
      const { changed } = options.width;
      const input = get<HTMLInputElement>(".width input");
      get(".width .sr-only").textContent = `${options.label} width`;
      const readouts = new ExampleReadouts(
        options.width.availableSpace ?? get(".stage"),
        viewport,
        input,
        get(".note"),
        directions,
      );
      this.#readouts = readouts;
      viewport.style.inlineSize = `${options.width.initial}px`;
      this.#widthControl = widthControl({
        handle: get(".resize"),
        viewport,
        input,
        limit: () => readouts.maximum,
        request: (width, settled, maximum = readouts.maximum) => {
          if (!Number.isFinite(width)) {
            readouts.refreshWidth();
            return;
          }
          const next = clampWidth(width, maximum);
          viewport.style.inlineSize = `${next}px`;
          changed(next, settled);
        },
        restore: () => readouts.refreshWidth(),
        signal,
      });
    } else this.#readouts = new CompositionReadouts(get(".note"), directions);

    const frame = get(".frame");
    const pathAt = (target: EventTarget | null) =>
      target instanceof Element
        ? target.closest<HTMLElement>(compositionSelector)?.dataset.path
        : undefined;
    frame.addEventListener(
      "click",
      (event) => {
        const path = pathAt(event.target);
        if (path) options.choose(path);
      },
      { signal },
    );
    frame.addEventListener(
      "pointermove",
      (event) => {
        if (this.#widthControl?.dragging) return;
        const path = pathAt(event.target);
        if (path) options.attend(path);
      },
      { signal },
    );
    frame.addEventListener("pointerleave", () => options.attend(undefined), {
      signal,
    });
    this.#modeObserver.observe(this.#rendered, {
      attributes: true,
      subtree: true,
      attributeFilter: [arrangementAttribute],
    });
  }

  /** Shows `model`. Call `decorate` afterwards: the boxes are new. */
  render(model: Composition, preserveScroll = false) {
    // A wording edit keeps authored paths intact. Native scroll offsets are
    // view state that DOM replacement otherwise loses; CSS cannot transfer
    // them to a replacement box. Capture only for that edit, never on resize
    // or regrouping, and let the browser clamp to the new scrollable extent.
    const scroll = preserveScroll
      ? [
          ...this.#rendered.querySelectorAll<HTMLElement>(
            '[data-kind="Shelf"]',
          ),
        ].map((shelf) => [shelf.dataset.path!, shelf.scrollLeft] as const)
      : [];
    if (this.#mounted) this.#mounted.update(model);
    else this.#mounted = mountComposition(this.#rendered, model);
    for (const [path, offset] of scroll) {
      const shelf = this.#rendered.querySelector<HTMLElement>(
        `[data-kind="Shelf"][data-path="${path}"]`,
      );
      if (shelf) shelf.scrollLeft = offset;
    }
    prepareInspection(this.#rendered);
    // A group with no members and a text with no characters render nothing.
    // Naming them lets CSS mark their place without adding to the layout.
    for (const node of this.#nodes()) {
      const empty = node.classList.contains("leaf")
        ? node.textContent === ""
        : compositionMembers(node).length === 0;
      if (empty) node.dataset.empty = "true";
    }
    this.#inspected = undefined;
    this.#captionObserver.disconnect();
    this.#readouts.observeComposition(this.#rendered);
    this.#refreshModes();
  }

  /** Applies the owner's selection to the boxes shown now. */
  decorate({ structure, inspected, chosen, destination }: PreviewDecoration) {
    for (const node of this.#nodes()) {
      const marked = String(chosen.includes(node.dataset.path!));
      if (node.dataset.chosen !== marked) node.dataset.chosen = marked;
      node.toggleAttribute(
        "data-destination",
        node.dataset.path === destination,
      );
    }
    const selected = updateInspection(this.#rendered, {
      structure,
      selected: inspected,
      preview: [],
    });
    if (selected !== this.#inspected) {
      this.#captionObserver.disconnect();
      this.#inspected = selected;
      if (selected) {
        // A primitive has one uniform gap: the first adjacent pair suffices.
        for (const band of [
          ...selected.querySelectorAll(
            ':scope > [data-decoration="gap"] [data-observation="gap"]',
          ),
        ].slice(0, 2))
          this.#captionObserver.observe(band);
      }
    }
    this.#refreshCaption();
  }

  dispose() {
    this.#abort.abort();
    this.#widthControl?.cancel();
    this.#modeObserver.disconnect();
    this.#captionObserver.disconnect();
    this.#readouts.disconnect();
    this.#mounted?.dispose();
    this.#mounted = undefined;
    this.#inspected = undefined;
    this.element.remove();
  }

  #nodes(): HTMLElement[] {
    return [
      ...this.#rendered.querySelectorAll<HTMLElement>(compositionSelector),
    ];
  }

  /** Effective modes can be derived from an ancestor's published arrangement.
   * Follow that signal, then read CSS for the labels alone. */
  #refreshModes() {
    this.#modes = [
      ...this.#rendered.querySelectorAll<HTMLElement>('[data-kind="Switcher"]'),
    ].map((node) => getComputedStyle(node).flexDirection);
    this.#readouts.refreshModes();
    this.#refreshCaption();
  }

  #refreshCaption() {
    const text = describeSelection(this.#inspected);
    if (this.#caption.textContent !== text) this.#caption.textContent = text;
  }
}
