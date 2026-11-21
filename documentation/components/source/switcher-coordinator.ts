/**
 * The shared decision for atomic Switchers.
 *
 * CSS lays a Switcher out as one row or one column. It cannot compare the
 * row's intrinsic requirement with the space the Switcher's slot provides, so
 * this module makes that one comparison and publishes the result as an
 * attribute. It reads no geometry itself: the browser reports both numbers
 * through a single ResizeObserver, and the decision is written inside the
 * observer callback, before the frame paints.
 *
 * The module knows nothing about how a Switcher is rendered. A registration
 * names the two boxes that carry its numbers; `primitives.ts` builds them for
 * the controlled Composition tree.
 *
 * Dependencies between Switchers are carried by the browser, not by a tree
 * walk here. Within a frame, ResizeObserver delivers in rounds, and after a
 * round it redelivers only targets deeper than the shallowest target that
 * round delivered, for any observer in the document. That places two
 * obligations on tree depth:
 *
 * - A nested Switcher's slot is deeper than the slot and requirement of every
 *   enclosing Switcher (see {@link SwitcherRegistration.slot}).
 * - Any other observer of a box that a published arrangement can resize
 *   watches from deeper than that Switcher's slot and requirement. Otherwise
 *   its notification waits a frame and the browser reports a loop error.
 */

export type Arrangement = "row" | "column";

/** Where the decision is published. CSS may still derive a row from the host
 * (see `primitives.css`), so read `flex-direction` for the effective mode. */
export const arrangementAttribute = "data-axiomatic-arrangement";

/**
 * A row that exactly fits is a row. Engines keep layout sizes in fixed-point
 * units (1/64px in Blink and WebKit, 1/60px in Gecko), so two boxes laid out
 * from the same content can report sizes one unit apart. The tolerance is
 * four Blink units: above that noise, and far below a device pixel.
 */
export const fitTolerance = 1 / 16;

/** The whole decision: a function of two numbers and no history. */
export function arrangementFor(requirement: number, slot: number): Arrangement {
  return requirement <= slot + fitTolerance ? "row" : "column";
}

export interface SwitcherRegistration {
  /** Receives {@link arrangementAttribute}. */
  readonly switcher: Element;
  /**
   * Its inline size is the space available to the row. The published
   * arrangement must not be able to resize this box in a host that imposes a
   * width, and it must sit deeper in the tree than the slot and requirement
   * boxes of every enclosing registered Switcher, so that an ancestor's
   * decision reaches it in the same frame.
   */
  readonly slot: Element;
  /**
   * Its inline size is the row requirement, laid out independently of every
   * Switcher's current arrangement. Its block size is non-zero whenever it is
   * rendered, so a 0×0 report means "not rendered" rather than "needs no room".
   */
  readonly requirement: Element;
}

/** What one observer delivery concluded for one Switcher. */
export interface SwitcherDecision {
  readonly switcher: Element;
  readonly slot: number;
  /** `undefined` while the requirement box is not rendered. */
  readonly requirement: number | undefined;
  /** `undefined` when the previous arrangement was kept for lack of a requirement. */
  readonly arrangement: Arrangement | undefined;
  readonly written: boolean;
}

interface Measured {
  readonly registration: SwitcherRegistration;
  /** Starts at zero, as an unreported ResizeObserver size does. */
  slot: number;
  requirement: number | undefined;
}

export class SwitcherCoordinator {
  /** Diagnostic hook for fixtures: receives every delivery's conclusions. */
  trace: ((decisions: readonly SwitcherDecision[]) => void) | undefined;

  readonly #observer: ResizeObserver;
  // Registration owners must unregister: native observation retains targets.
  // `size` exposes outstanding registrations for lifecycle qualification.
  readonly #measured = new WeakMap<Element, Measured>();
  #size = 0;

  constructor(Observer: typeof ResizeObserver) {
    this.#observer = new Observer((entries) => this.#receive(entries));
  }

  /** Registrations not yet unregistered. */
  get size(): number {
    return this.#size;
  }

  /** Starts deciding for a Switcher. Call the returned function to stop. */
  register(registration: SwitcherRegistration): () => void {
    const { slot, requirement } = registration;
    if (this.#measured.has(slot) || this.#measured.has(requirement))
      throw new Error("This Switcher is already registered");
    const measured: Measured = {
      registration,
      slot: 0,
      requirement: undefined,
    };
    this.#measured.set(slot, measured);
    this.#measured.set(requirement, measured);
    this.#observer.observe(slot);
    this.#observer.observe(requirement);
    this.#size++;
    let registered = true;
    return () => {
      if (!registered) return;
      registered = false;
      this.#observer.unobserve(slot);
      this.#observer.unobserve(requirement);
      this.#measured.delete(slot);
      this.#measured.delete(requirement);
      this.#size--;
    };
  }

  #receive(entries: readonly ResizeObserverEntry[]) {
    // Record every delivered number before deciding, so the result cannot
    // depend on the order of entries within a delivery.
    const affected = new Set<Measured>();
    for (const entry of entries) {
      const measured = this.#measured.get(entry.target);
      const size = entry.contentBoxSize[0];
      if (!measured || !size) continue;
      if (entry.target === measured.registration.slot) {
        measured.slot = size.inlineSize;
      } else {
        const rendered = size.inlineSize > 0 || size.blockSize > 0;
        measured.requirement = rendered ? size.inlineSize : undefined;
      }
      affected.add(measured);
    }
    const decisions: SwitcherDecision[] = [];
    for (const { registration, slot, requirement } of affected) {
      const { switcher } = registration;
      // Without a rendered requirement there is nothing to compare. Keeping
      // the last arrangement lets a hidden Switcher reappear undisturbed.
      const arrangement =
        requirement === undefined
          ? undefined
          : arrangementFor(requirement, slot);
      const written =
        arrangement !== undefined &&
        switcher.getAttribute(arrangementAttribute) !== arrangement;
      if (written) switcher.setAttribute(arrangementAttribute, arrangement);
      decisions.push({ switcher, slot, requirement, arrangement, written });
    }
    this.trace?.(decisions);
  }
}

const coordinators = new WeakMap<Document, SwitcherCoordinator>();

/** The one coordinator, and so the one ResizeObserver, for a document. It
 * serves Switchers in the document and in any of its shadow roots. */
export function switcherCoordinator(document: Document): SwitcherCoordinator {
  let coordinator = coordinators.get(document);
  if (!coordinator) {
    const view = document.defaultView;
    if (!view) throw new Error("Switchers need a document with a window");
    coordinator = new SwitcherCoordinator(view.ResizeObserver);
    coordinators.set(document, coordinator);
  }
  return coordinator;
}
