import { registerAuthoredComposition } from "../../documentation/components/source/authored-elements.ts";
import "../../documentation/components/source/primitives.css";
import "../../documentation/components/source/authored-elements.css";
import {
  widthControl,
  clampWidth,
} from "../../documentation/components/source/width-control.ts";
import "./experiment.css";

// This is application code: it creates the controls and owns their state.
// The adapter receives these elements; it never renders their contents.
let following = false;
const followButtons: HTMLButtonElement[] = [];
const views: InvestigationView[] = [];
const status = document.querySelector<HTMLElement>("#app-status")!;

function action(text: string, href: string) {
  const element = document.createElement("a");
  element.textContent = text;
  element.href = href;
  element.setAttribute("data-axiomatic-atom", "");
  return element;
}
function updateFollowing() {
  for (const button of followButtons) {
    button.setAttribute("aria-pressed", String(following));
    button.textContent = following
      ? "Following investigation"
      : "Follow investigation";
  }
  status.textContent = following
    ? "Following this investigation. Your choice is shared across the four views."
    : "Not following this investigation.";
}

class InvestigationView {
  readonly primary = action("Open investigation session", "#session");
  readonly alert = action("Alert in Vercel", "#alert");
  readonly follow = document.createElement("button");
  readonly root = document.createElement("nav");
  readonly inner = document.createElement("div");
  readonly element = document.createElement("div");
  readonly mounted: ReturnType<typeof registerAuthoredComposition>;
  readonly #widthObserver: ResizeObserver;
  readonly #modeObserver: MutationObserver;
  readonly #events = new AbortController();
  #frame = 0;

  constructor(parent: HTMLElement, nested: boolean, rail: boolean) {
    const label = rail ? "Narrow rail" : "Wide card";
    this.element.className = `view ${rail ? "rail" : "wide"}`;
    this.element.innerHTML = `
      <div class="available-probe" aria-hidden="true"></div>
      <div class="view-header"><span>${label}</span><label class="width-label">${rail ? "<output></output>" : '<input class="width-input" type="number" min="160" max="720" step="1">'} px</label></div>
      <div class="frame"><article class="card" tabindex="0" aria-label="${nested ? "Nested" : "Flat"} investigation, ${label.toLowerCase()}"><p class="investigation-label">Current investigation</p><h3>Bound the request-log query</h3></article>${rail ? "" : '<button class="grip" type="button" aria-label="Resize available space"></button>'}</div>
      <p class="mode" aria-live="off"></p>`;
    this.primary.dataset.primary = "";
    this.follow.type = "button";
    this.follow.setAttribute("data-axiomatic-atom", "");
    this.follow.setAttribute("aria-pressed", String(following));
    this.follow.textContent = following
      ? "Following investigation"
      : "Follow investigation";
    this.follow.addEventListener(
      "click",
      () => {
        following = !following;
        updateFollowing();
      },
      { signal: this.#events.signal },
    );
    followButtons.push(this.follow);
    const secondary = [action("Other runs", "#runs"), this.alert, this.follow];
    this.root.className = "actions";
    this.root.dataset.axiomatic = "Switcher";
    this.root.setAttribute(
      "aria-label",
      `${nested ? "Nested" : "Flat"} investigation actions, ${label.toLowerCase()}`,
    );
    if (nested) {
      this.inner.dataset.axiomatic = "Switcher";
      this.inner.append(...secondary);
      this.root.append(this.primary, this.inner);
    } else {
      this.root.append(this.primary, ...secondary);
    }
    this.element.querySelector("article")!.append(this.root);
    parent.append(this.element);
    this.mounted = registerAuthoredComposition(this.root);
    const input = this.element.querySelector<HTMLInputElement>("input");
    input?.setAttribute(
      "aria-label",
      `${nested ? "Nested" : "Flat"} wide card width`,
    );
    const output = this.element.querySelector<HTMLOutputElement>("output");
    const frame = this.element.querySelector<HTMLElement>(".frame")!;
    let requested = rail ? 284 : 720;
    let available = requested;
    const applyWidth = (restoreInput = false) => {
      const actual = Math.min(requested, available);
      this.element.style.setProperty("--view-width", `${actual}px`);
      if (input && (restoreInput || document.activeElement !== input))
        input.value = String(Math.round(actual));
      if (output) output.value = String(Math.round(actual));
    };
    this.#widthObserver = new ResizeObserver((entries) => {
      available = entries[0]!.contentBoxSize[0]!.inlineSize;
      applyWidth();
    });
    this.#widthObserver.observe(
      this.element.querySelector(".available-probe")!,
    );
    if (input) {
      const grip = this.element.querySelector<HTMLButtonElement>(".grip")!;
      widthControl({
        handle: grip,
        viewport: frame,
        input,
        limit: () => Math.min(720, available),
        request: (width, _settled, maximum = Math.min(720, available)) => {
          if (Number.isFinite(width)) requested = clampWidth(width, maximum);
          applyWidth();
        },
        restore: () => applyWidth(true),
        signal: this.#events.signal,
      });
      grip.addEventListener(
        "keydown",
        (event) => {
          const step = event.shiftKey ? 32 : 8;
          if (event.key === "ArrowLeft")
            requested = clampWidth(
              Math.min(requested, available) - step,
              Math.min(720, available),
            );
          else if (event.key === "ArrowRight")
            requested = clampWidth(
              Math.min(requested, available) + step,
              Math.min(720, available),
            );
          else return;
          event.preventDefault();
          applyWidth();
        },
        { signal: this.#events.signal },
      );
    }
    const mode = this.element.querySelector<HTMLElement>(".mode")!;
    const describe = (group: HTMLElement) =>
      getComputedStyle(group).flexDirection === "row" ? "row" : "column";
    const updateMode = () => {
      cancelAnimationFrame(this.#frame);
      this.#frame = requestAnimationFrame(() => {
        mode.textContent = nested
          ? `Outer: ${describe(this.root)} · Secondary actions: ${describe(this.inner)}`
          : `One ${describe(this.root)}`;
      });
    };
    this.#modeObserver = new MutationObserver(updateMode);
    this.#modeObserver.observe(this.root, {
      subtree: true,
      attributes: true,
      attributeFilter: ["data-axiomatic-arrangement"],
    });
    applyWidth();
    updateMode();
  }
  dispose() {
    this.#events.abort();
    this.#widthObserver.disconnect();
    this.#modeObserver.disconnect();
    cancelAnimationFrame(this.#frame);
    this.mounted.dispose();
  }
}

for (const parent of document.querySelectorAll<HTMLElement>(".views")) {
  for (const rail of [false, true])
    views.push(
      new InvestigationView(parent, parent.dataset.example === "nested", rail),
    );
}
document
  .querySelector<HTMLInputElement>("#long-label")!
  .addEventListener("change", (event) => {
    const long = (event.target as HTMLInputElement).checked;
    for (const view of views)
      view.primary.textContent = long
        ? "Open the request-log investigation session"
        : "Open investigation session";
  });
document
  .querySelector<HTMLInputElement>("#show-alert")!
  .addEventListener("change", (event) => {
    const show = (event.target as HTMLInputElement).checked;
    for (const view of views) {
      view.alert.hidden = !show;
    }
  });
document
  .querySelector<HTMLInputElement>("#structure")!
  .addEventListener("change", (event) => {
    document.body.toggleAttribute(
      "data-show-groups",
      (event.target as HTMLInputElement).checked,
    );
  });
const dialog = document.querySelector<HTMLDialogElement>("#notes-dialog")!;
document
  .querySelector("#open-notes")!
  .addEventListener("click", () => dialog.showModal());
window.addEventListener("pagehide", (event) => {
  if (!event.persisted) for (const view of views) view.dispose();
});
