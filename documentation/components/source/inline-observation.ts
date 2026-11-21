/** An auxiliary consumer needs an element's content inline size, without
 * subscribing to the block-size changes that layout can make in the same
 * ResizeObserver delivery. The host must establish a containing block.
 * CSS supplies the width; this helper never reads geometry.
 *
 * Observation contract: the unused axis stays zero. A target can depend on
 * its host or an ancestor changing arrangement, but never on a descendant's
 * changing height. Its two-level placement puts a direct member's target
 * below the enclosing Switcher's slot/requirement, so ResizeObserver can
 * redeliver it in that frame. Gap targets follow the same rule with one more
 * level beneath their selected primitive (see inspection.css). */
export function inlineObservation(host: HTMLElement): {
  target: HTMLElement;
  dispose(): void;
} {
  const wrapper = host.ownerDocument.createElement("span");
  wrapper.dataset.observation = "inline-size";
  wrapper.setAttribute("aria-hidden", "true");
  const target = host.ownerDocument.createElement("span");
  target.dataset.observation = "inline-target";
  wrapper.append(target);
  host.append(wrapper);
  return { target, dispose: () => wrapper.remove() };
}
