import { proseFitView } from "./prose-fit-view.ts";
import styles from "./prose-fit.css";
import {
  clampWidth,
  maximumWidth,
  minimumWidth,
  widthControl,
} from "./width-control.ts";

const original = "Request-log queries exceed the 30-second runtime budget.";
const wording = {
  short: "Request-log queries timed out.",
  original,
  long: `${original} The remediation plan is to bound the request-log query.`,
};

class ProseFit extends HTMLElement {
  private readonly root = this.attachShadow({ mode: "open" });
  private requestedWidth = 550;
  private disconnect?: () => void;

  constructor() {
    super();
    this.root.innerHTML = `<style>${styles}</style>${proseFitView}`;
  }

  connectedCallback() {
    const viewport = this.root.getElementById("viewport")!;
    const grip = this.root.getElementById("grip")!;
    const input = this.root.getElementById("width") as HTMLInputElement;
    const select = this.root.getElementById("wording") as HTMLSelectElement;
    const abort = new AbortController();
    let limit = maximumWidth;

    const syncWording = () => {
      const text = wording[select.value as keyof typeof wording];
      for (const paragraph of this.root.querySelectorAll(".summary"))
        paragraph.textContent = text;
    };
    const actualWidth = () => Math.min(this.requestedWidth, limit);
    const showWidth = () => {
      input.value = String(actualWidth());
    };
    const syncReadout = (fromGrip = false) => {
      const width = actualWidth();
      grip.setAttribute("aria-valuenow", String(width));
      grip.setAttribute("aria-valuetext", `${width} pixels`);
      // Keep a partially typed number editable until the reader leaves the field.
      if (fromGrip || this.root.activeElement !== input) showWidth();
    };

    const setWidth = (width: number, maximum: number, fromGrip: boolean) => {
      if (!Number.isFinite(width)) return;
      this.requestedWidth = clampWidth(width, maximum);
      viewport.style.setProperty("--example-width", `${this.requestedWidth}px`);
      syncReadout(fromGrip);
    };

    grip.addEventListener(
      "keydown",
      (event) => {
        const step = event.shiftKey ? 32 : 8;
        const direction =
          getComputedStyle(viewport).direction === "rtl" ? -1 : 1;
        const targets: Record<string, number> = {
          Home: minimumWidth,
          End: limit,
          ArrowLeft: actualWidth() - step * direction,
          ArrowRight: actualWidth() + step * direction,
          ArrowDown: actualWidth() - step,
          ArrowUp: actualWidth() + step,
        };
        const target = targets[event.key];
        if (typeof target !== "number") return;
        event.preventDefault();
        setWidth(target, limit, true);
      },
      { signal: abort.signal },
    );

    select.addEventListener("change", syncWording, { signal: abort.signal });
    syncWording();
    setWidth(this.requestedWidth, limit, true);

    const control = widthControl({
      handle: grip,
      viewport,
      input,
      limit: () => limit,
      request: (width, _settled, maximum = limit) =>
        setWidth(width, maximum, control.dragging),
      restore: showWidth,
      signal: abort.signal,
    });
    // Only the available space for the width control is observed. CSS lays
    // out both examples, including when wording or font metrics change.
    const observer = new ResizeObserver(([entry]) => {
      const size = entry!.contentBoxSize[0]!.inlineSize;
      limit = Math.min(maximumWidth, Math.floor(size));
      input.min = String(Math.min(minimumWidth, limit));
      input.max = String(limit);
      grip.setAttribute("aria-valuemin", input.min);
      grip.setAttribute("aria-valuemax", input.max);
      syncReadout();
    });
    observer.observe(this.root.getElementById("width-probe")!);
    this.disconnect = () => {
      control.cancel();
      abort.abort();
      observer.disconnect();
    };
  }

  disconnectedCallback() {
    this.disconnect?.();
  }
}

if (!customElements.get("axiomatic-prose-fit"))
  customElements.define("axiomatic-prose-fit", ProseFit);
