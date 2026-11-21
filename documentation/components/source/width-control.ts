/**
 * Asking for an example's width: a grip to drag and a number field to type in.
 *
 * This is interaction state only. It reads one rectangle when a drag begins
 * and afterwards turns pointer positions into requested widths. The owner
 * applies a request to its host; CSS and the composition do the rest.
 */

export const minimumWidth = 160,
  maximumWidth = 720;

/** A whole width between the smallest useful example and `maximum`. */
export function clampWidth(width: number, maximum: number): number {
  return Math.round(
    Math.min(maximum, Math.max(Math.min(minimumWidth, maximum), width)),
  );
}

export interface WidthControlOptions {
  /** The grip. It tracks the pointer while linked hosts reflow around it. */
  readonly handle: HTMLElement;
  /** The box whose inline size is being requested. */
  readonly viewport: HTMLElement;
  /** The number field showing that size. */
  readonly input: HTMLInputElement;
  /** The widest request the surrounding stage allows now. */
  limit(): number;
  /**
   * Receives a requested width, which may not be finite when the field holds
   * no number. `settled` is false during a drag. A drag passes the `maximum`
   * it began with, so the limit cannot move under the pointer.
   */
  request(width: number, settled: boolean, maximum?: number): void;
  /** Shows the actual width again when the reader leaves the field. */
  restore(): void;
  readonly signal: AbortSignal;
}

export interface WidthControl {
  /** True from pointer down on the grip until the drag ends. */
  readonly dragging: boolean;
  /** Abandons a drag in progress without requesting a width. */
  cancel(): void;
}

export function widthControl({
  handle,
  viewport,
  input,
  limit,
  request,
  restore,
  signal,
}: WidthControlOptions): WidthControl {
  let frame = 0;
  let drag:
    | {
        pointer: number;
        direction: number;
        x: number;
        width: number;
        maximum: number;
        nextWidth: number;
      }
    | undefined;

  input.addEventListener(
    "input",
    () => {
      if (Number.isFinite(input.valueAsNumber))
        request(input.valueAsNumber, true);
    },
    { signal },
  );
  input.addEventListener("change", () => request(input.valueAsNumber, true), {
    signal,
  });
  input.addEventListener("blur", () => restore(), { signal });
  input.addEventListener(
    "keydown",
    (event) => {
      if (event.key === "Enter") input.blur();
    },
    { signal },
  );
  handle.addEventListener(
    "pointerdown",
    (event) => {
      if (event.button !== 0) return;
      const initialWidth = viewport.getBoundingClientRect().width;
      drag = {
        pointer: event.pointerId,
        direction: getComputedStyle(viewport).direction === "rtl" ? -1 : 1,
        x: event.clientX,
        width: initialWidth,
        nextWidth: initialWidth,
        maximum: limit(),
      };
      handle.dataset.dragging = "true";
      handle.style.setProperty("--grip-y", `${event.clientY}px`);
      handle.setPointerCapture(event.pointerId);
      event.preventDefault();
    },
    { signal },
  );
  handle.addEventListener(
    "pointermove",
    (event) => {
      if (drag?.pointer !== event.pointerId) return;
      drag.nextWidth = drag.width + (event.clientX - drag.x) * drag.direction;
      handle.style.setProperty("--grip-y", `${event.clientY}px`);
      if (!frame)
        frame = requestAnimationFrame(() => {
          frame = 0;
          if (drag) request(drag.nextWidth, false, drag.maximum);
        });
    },
    { signal },
  );
  const release = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    drag = undefined;
    delete handle.dataset.dragging;
    handle.style.removeProperty("--grip-y");
  };
  const end = () => {
    if (!drag) return;
    cancelAnimationFrame(frame);
    frame = 0;
    request(drag.nextWidth, true, drag.maximum);
    release();
  };
  handle.addEventListener("pointerup", end, { signal });
  handle.addEventListener("pointercancel", end, { signal });
  handle.addEventListener("lostpointercapture", end, { signal });

  return {
    get dragging() {
      return drag !== undefined;
    },
    cancel: release,
  };
}
