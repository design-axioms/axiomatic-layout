import {
  compositionMembers,
  compositionAnchorName as anchorName,
  compositionSelector,
} from "./composition-elements.ts";

export interface InspectionState {
  readonly structure: boolean;
  readonly selected: string | undefined;
  readonly preview: readonly string[];
}

/** Structural decoration metadata changes with the composition, never on resize. */
export function prepareInspection(rendered: HTMLElement) {
  const nodes = [
    ...rendered.querySelectorAll<HTMLElement>(compositionSelector),
  ];
  const maxDepth = Math.max(
    1,
    ...nodes.map((node) => node.dataset.path!.split(".").length),
  );
  rendered.style.setProperty(
    "--inspection-fill",
    `color-mix(in srgb, var(--ink) ${12 / maxDepth}%, transparent)`,
  );
  for (const node of nodes)
    node.style.setProperty("anchor-name", anchorName(node.dataset.path!));
  for (const old of rendered.querySelectorAll(
    ':scope > [data-decoration="run-preview"]',
  ))
    old.remove();
  const run = document.createElement("div");
  run.className = "run-preview";
  run.dataset.decoration = "run-preview";
  run.setAttribute("aria-hidden", "true");
  run.hidden = true;
  rendered.append(run);
}

/** Selection updates attributes and sibling references; CSS follows layout. */
export function updateInspection(
  rendered: HTMLElement,
  state: InspectionState,
): HTMLElement | undefined {
  const nodes = [
    ...rendered.querySelectorAll<HTMLElement>(compositionSelector),
  ];
  rendered.dataset.structure = String(state.structure);
  const previous = nodes.find((node) => node.dataset.inspected === "true");
  const selected = nodes.find((node) => node.dataset.path === state.selected);
  for (const node of nodes) {
    const inspected = String(node === selected);
    if (node.dataset.inspected !== inspected)
      node.dataset.inspected = inspected;
  }
  if (previous !== selected) {
    for (const band of rendered.querySelectorAll('[data-decoration="gap"]'))
      band.remove();
    if (selected?.classList.contains("node")) {
      const children = compositionMembers(selected);
      for (let index = 1; index < children.length; index++) {
        for (const axis of ["block", "inline"]) {
          const band = document.createElement("span");
          band.className = "inspection-gap";
          band.dataset.decoration = "gap";
          band.dataset.axis = axis;
          band.setAttribute("aria-hidden", "true");
          band.style.setProperty(
            "--before",
            anchorName(children[index - 1]!.dataset.path!),
          );
          band.style.setProperty(
            "--after",
            anchorName(children[index]!.dataset.path!),
          );
          // Observe only the gap axis, below the Switcher's own targets.
          // A member changing height must not invalidate an ancestor caption.
          const wrapper = document.createElement("span");
          const target = document.createElement("span");
          target.dataset.observation = "gap";
          wrapper.append(target);
          band.append(wrapper);
          selected.append(band);
        }
      }
    }
  }
  const run = rendered.querySelector<HTMLElement>(
    ':scope > [data-decoration="run-preview"]',
  )!;
  const preview = nodes.filter((node) =>
    state.preview.includes(node.dataset.path!),
  );
  run.hidden = preview.length < 2;
  if (preview.length > 1) {
    run.style.setProperty("--run-first", anchorName(preview[0]!.dataset.path!));
    run.style.setProperty(
      "--run-last",
      anchorName(preview.at(-1)!.dataset.path!),
    );
  }
  return selected;
}

/** Source formatting changes only the source's selection marks. */
export function highlightSource(
  code: HTMLElement,
  structure: boolean,
  selected: string | undefined,
) {
  const includes = (path: string | undefined) =>
    structure &&
    selected !== undefined &&
    (path === selected || path?.startsWith(`${selected}.`) === true);
  for (const line of code.querySelectorAll<HTMLElement>(".code-line"))
    line.dataset.selected = String(includes(line.dataset.path));
  for (const token of code.querySelectorAll<HTMLElement>(".token[data-path]"))
    token.dataset.selected = String(
      includes(token.dataset.path) &&
        token.closest<HTMLElement>(".code-line")?.dataset.selected !== "true",
    );
}

/** Names the arrangement in effect. A Stack is always a column and a Shelf
 * always a row; a Switcher's row or column is only what it is now, so the
 * wording keeps the authored name apart from the current result. */
export function currentArrangement(kind: string, row: boolean): string {
  const direction = row ? "row" : "column";
  return kind === "Switcher" ? `now a ${direction}` : direction;
}

/** A targeted style read for the numeric caption, never a rectangle overlay. */
export function describeSelection(node: HTMLElement | undefined): string {
  if (!node) return "";
  if (node.classList.contains("leaf")) return `${node.dataset.kind} · leaf`;
  const style = getComputedStyle(node);
  const row = style.flexDirection === "row";
  const members = compositionMembers(node);
  const gap = row ? style.columnGap : style.rowGap;
  return `${node.dataset.kind} · ${currentArrangement(node.dataset.kind!, row)} · ${members.length === 1 ? "1 member" : members.length ? `${members.length} members` : "no members"}${members.length > 1 ? ` · ${Math.round(Number.parseFloat(gap) || 0)} px between` : ""}`;
}
