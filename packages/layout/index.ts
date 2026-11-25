import { registerAuthoredComposition as register } from "../../documentation/components/source/authored-elements.ts";

/** Observe an application-owned group and its native actions. */
export function registerAuthoredComposition(root: HTMLElement): {
  /** Call after changing group membership or arrangement. */
  refresh(): void;
  /** Release the elements and remove the adapter's measurements. */
  dispose(): void;
} {
  return register(root);
}
