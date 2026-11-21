/**
 * Selecting in the workbench.
 *
 * A lesson teaches that each click builds on the selection, and
 * `chooseMember` is that rule. The workbench is for an author who has not
 * read the lesson: a click selects the one thing clicked, and building on
 * the selection is something the author asks for.
 *
 * The workbench's inspector always describes something, so its selection is
 * never empty. With nothing else selected, the whole composition is.
 */
import type { Composition } from "./composition.ts";
import { chooseMember } from "./composition-editing.ts";
import { atPath } from "./grouping.ts";

/** The whole composition's path. */
const whole = "0";

/** A selection the inspector can describe: `chosen`, or the whole composition. */
export function subjectOf(chosen: readonly string[]): readonly string[] {
  return chosen.length ? chosen : [whole];
}

/**
 * The selection after the author chooses `path`.
 *
 * Without `extend` it is that one node. With `extend` the choice builds on
 * the selection as `chooseMember` does: a neighbor joins it, a selected
 * member leaves it, and anything else starts again. A member that is the
 * only one selected stays selected. A path that names nothing changes
 * nothing.
 */
export function selectionAfter(
  tree: Composition,
  chosen: readonly string[],
  path: string,
  extend: boolean,
): readonly string[] {
  if (!atPath(tree, path)) return chosen;
  if (!extend) return [path];
  const next = chooseMember(tree, chosen, path);
  return next.length ? next : [path];
}
