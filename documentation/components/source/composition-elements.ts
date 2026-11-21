/** Real composition members exclude measurement and inspection decoration. */
export const compositionSelector = ".node,.leaf";

export function compositionMembers(element: HTMLElement): HTMLElement[] {
  return [...element.children].filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child.matches(compositionSelector),
  );
}

/** Names are local to the rendered composition's anchor-scope. */
export function compositionAnchorName(path: string): string {
  return `--axiomatic-node-${path.replaceAll(".", "-")}`;
}
