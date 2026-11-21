import { test } from "node:test";
import assert from "node:assert/strict";
import {
  SwitcherCoordinator,
  arrangementAttribute,
  arrangementFor,
  fitTolerance,
  switcherCoordinator,
  type SwitcherDecision,
} from "../documentation/components/source/switcher-coordinator.ts";

/** Stands in for a box: records attribute writes so tests can count them. */
class Box {
  readonly writes: string[] = [];
  #arrangement: string | null = null;
  getAttribute(name: string) {
    return name === arrangementAttribute ? this.#arrangement : null;
  }
  setAttribute(name: string, value: string) {
    assert.equal(name, arrangementAttribute);
    this.#arrangement = value;
    this.writes.push(value);
  }
  get arrangement() {
    return this.#arrangement;
  }
}

/** A ResizeObserver whose deliveries the test controls. */
class Deliveries {
  static created: Deliveries[] = [];
  readonly targets = new Set<object>();
  readonly #callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;
    Deliveries.created.push(this);
  }
  observe(target: object) {
    this.targets.add(target);
  }
  unobserve(target: object) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
  /** Each report is `[target, inline size, block size]`. */
  deliver(...reports: (readonly [object, number, number])[]) {
    const entries = reports.map(([target, inlineSize, blockSize]) => ({
      target,
      contentBoxSize: [{ inlineSize, blockSize }],
    }));
    this.#callback(
      entries as unknown as ResizeObserverEntry[],
      this as unknown as ResizeObserver,
    );
  }
}
const Observer = Deliveries as unknown as typeof ResizeObserver;

function setup() {
  const coordinator = new SwitcherCoordinator(Observer);
  const observer = Deliveries.created.at(-1)!;
  const add = () => {
    const switcher = new Box(),
      slot = new Box(),
      requirement = new Box();
    const unregister = coordinator.register({
      switcher,
      slot,
      requirement,
    } as unknown as Parameters<SwitcherCoordinator["register"]>[0]);
    return { switcher, slot, requirement, unregister };
  };
  return { coordinator, observer, add };
}

test("a row that exactly fits is a row, with only sub-pixel slack", () => {
  assert.equal(arrangementFor(414.58334, 414.58334), "row");
  assert.equal(arrangementFor(414.58334, 600), "row");
  // One fixed-point layout unit of disagreement between two boxes is noise.
  assert.equal(arrangementFor(414.59375, 414.578125), "row");
  assert.equal(arrangementFor(415, 414), "column");
  assert.equal(arrangementFor(100 + 2 * fitTolerance, 100), "column");
});

test("a Switcher is decided from its two reported sizes, whichever arrives first", () => {
  for (const order of ["slot first", "requirement first", "together"]) {
    const { observer, add } = setup();
    const { switcher, slot, requirement } = add();
    const wide = [slot, 500, 0] as const,
      needs = [requirement, 400, 21] as const;
    if (order === "together") observer.deliver(needs, wide);
    else if (order === "slot first") {
      observer.deliver(wide);
      assert.equal(switcher.arrangement, null, "no requirement yet");
      observer.deliver(needs);
    } else {
      // An unreported slot is zero wide, as it is to the browser's observer.
      observer.deliver(needs);
      assert.equal(switcher.arrangement, "column");
      observer.deliver(wide);
    }
    assert.equal(switcher.arrangement, "row", order);
  }
});

test("the arrangement is written only when it changes", () => {
  const { observer, add } = setup();
  const { switcher, slot, requirement } = add();
  observer.deliver([slot, 500, 0], [requirement, 400, 21]);
  for (const width of [480, 460, 440, 401, 400])
    observer.deliver([slot, width, 0]);
  assert.deepEqual(switcher.writes, ["row"]);
  observer.deliver([slot, 399, 0]);
  observer.deliver([slot, 380, 0]);
  observer.deliver([slot, 400, 0]);
  assert.deepEqual(switcher.writes, ["row", "column", "row"]);
});

test("a changed requirement reaches the decision at a fixed slot width", () => {
  const { observer, add } = setup();
  const { switcher, slot, requirement } = add();
  observer.deliver([slot, 454.573, 0], [requirement, 414.58334, 21]);
  assert.equal(switcher.arrangement, "row");
  // A longer label, a late font, or a larger gap resizes only the copy.
  observer.deliver([requirement, 791.44794, 21]);
  assert.equal(switcher.arrangement, "column");
  observer.deliver([requirement, 414.58334, 21]);
  assert.equal(switcher.arrangement, "row");
});

test("the same sizes give the same arrangement by any route", () => {
  const reach = (...widths: number[]) => {
    const { observer, add } = setup();
    const outer = add(),
      inner = add();
    observer.deliver(
      [outer.requirement, 544, 21],
      [inner.requirement, 414, 21],
    );
    for (const width of widths)
      observer.deliver([inner.slot, width, 0], [outer.slot, width, 0]);
    return [outer.switcher.arrangement, inner.switcher.arrangement];
  };
  const mounted = reach(900);
  assert.deepEqual(mounted, ["row", "row"]);
  assert.deepEqual(reach(160, 900), mounted);
  assert.deepEqual(reach(160, 300, 440, 580, 720, 900), mounted);
  assert.deepEqual(reach(900, 160, 480), ["column", "row"]);
  assert.deepEqual(reach(480), ["column", "row"]);
});

test("a hidden Switcher keeps its arrangement and is decided afresh when shown", () => {
  const { observer, add } = setup();
  const { switcher, slot, requirement } = add();
  observer.deliver([slot, 500, 0], [requirement, 400, 21]);
  // display: none reports both boxes as 0×0.
  observer.deliver([slot, 0, 0], [requirement, 0, 0]);
  assert.deepEqual(switcher.writes, ["row"], "hiding is not a failure to fit");
  // Shown again in a narrower slot with longer content.
  observer.deliver([requirement, 450, 21], [slot, 420, 0]);
  assert.deepEqual(switcher.writes, ["row", "column"]);
  // A Switcher that mounts hidden publishes nothing until it is rendered.
  const late = add();
  observer.deliver([late.slot, 0, 0], [late.requirement, 0, 0]);
  assert.equal(late.switcher.arrangement, null);
});

test("a rendered copy with nothing in it is a requirement of zero", () => {
  const { observer, add } = setup();
  const { switcher, slot, requirement } = add();
  observer.deliver([slot, 0, 0], [requirement, 0, 1]);
  assert.equal(switcher.arrangement, "row");
});

test("unregistering stops observation and ignores entries already queued", () => {
  const { coordinator, observer, add } = setup();
  const first = add(),
    second = add();
  assert.equal(coordinator.size, 2);
  assert.equal(observer.targets.size, 4);
  first.unregister();
  first.unregister();
  assert.equal(coordinator.size, 1);
  assert.deepEqual(
    [...observer.targets],
    [second.slot, second.requirement],
    "only the remaining Switcher is observed",
  );
  observer.deliver([first.slot, 500, 0], [first.requirement, 400, 21]);
  assert.equal(first.switcher.arrangement, null);
  second.unregister();
  assert.equal(coordinator.size, 0);
  assert.equal(observer.targets.size, 0);
});

test("one Switcher cannot be registered twice, and can be registered again after cleanup", () => {
  const { coordinator, add } = setup();
  const { switcher, slot, requirement, unregister } = add();
  const again = () =>
    coordinator.register({
      switcher,
      slot,
      requirement,
    } as unknown as Parameters<SwitcherCoordinator["register"]>[0]);
  assert.throws(again, /already registered/);
  unregister();
  again()();
  assert.equal(coordinator.size, 0);
});

test("the trace reports each delivery, including decisions that wrote nothing", () => {
  const { coordinator, observer, add } = setup();
  const { switcher, slot, requirement } = add();
  const seen: SwitcherDecision[][] = [];
  coordinator.trace = (decisions) => seen.push([...decisions]);
  observer.deliver([slot, 500, 0], [requirement, 400, 21]);
  observer.deliver([slot, 450, 0]);
  observer.deliver([slot, 0, 0], [requirement, 0, 0]);
  assert.deepEqual(
    seen.map(([decision]) => decision),
    [
      {
        switcher,
        slot: 500,
        requirement: 400,
        arrangement: "row",
        written: true,
      },
      {
        switcher,
        slot: 450,
        requirement: 400,
        arrangement: "row",
        written: false,
      },
      {
        switcher,
        slot: 0,
        requirement: undefined,
        arrangement: undefined,
        written: false,
      },
    ],
  );
});

test("a document has one coordinator and one observer, however many roots use it", () => {
  const before = Deliveries.created.length;
  const page = {
    defaultView: { ResizeObserver: Observer },
  } as unknown as Document;
  const other = {
    defaultView: { ResizeObserver: Observer },
  } as unknown as Document;
  assert.equal(switcherCoordinator(page), switcherCoordinator(page));
  assert.notEqual(switcherCoordinator(page), switcherCoordinator(other));
  assert.equal(Deliveries.created.length, before + 2);
  assert.throws(
    () => switcherCoordinator({ defaultView: null } as unknown as Document),
    /window/,
  );
});

/** A Switcher whose requirement is the sum of two measured boxes. */
function derived() {
  const { coordinator, observer } = setup();
  const switcher = new Box(),
    slot = new Box(),
    first = new Box(),
    second = new Box();
  const parts = new Map<Box, number>();
  let asked = 0;
  const registration = coordinator.registerDerived({
    switcher: switcher as unknown as Element,
    slot: slot as unknown as Element,
    requirement() {
      asked++;
      if (parts.size === 0) return undefined;
      return [...parts.values()].reduce((sum, size) => sum + size, 0);
    },
  });
  const stops = [first, second].map((part) =>
    coordinator.measure(part as unknown as Element, (entry) => {
      parts.set(part, entry.contentBoxSize[0]!.inlineSize);
      registration.invalidate();
    }),
  );
  return {
    coordinator,
    observer,
    switcher,
    slot,
    first,
    second,
    parts,
    registration,
    stops,
    asked: () => asked,
  };
}

test("a derived requirement is asked for once the whole delivery is in", () => {
  for (const order of ["parts first", "slot first", "slot between"]) {
    const { observer, switcher, slot, first, second, asked } = derived();
    const reports = {
      "parts first": [first, second, slot],
      "slot first": [slot, first, second],
      "slot between": [first, slot, second],
    }[order]!.map((box) => [box, box === slot ? 300 : 150, 20] as const);
    observer.deliver(...reports);
    assert.equal(asked(), 1, order);
    assert.deepEqual(switcher.writes, ["row"], order);
  }
  const { observer, switcher, slot, first, second } = derived();
  observer.deliver([slot, 300, 0], [first, 150, 20], [second, 151, 20]);
  assert.deepEqual(switcher.writes, ["column"]);
  observer.deliver([second, 150, 20]);
  assert.deepEqual(switcher.writes, ["column", "row"]);
});

test("invalidating between deliveries decides at once from the sizes held", () => {
  const { coordinator, observer, switcher, slot, first, second, ...held } =
    derived();
  const seen: SwitcherDecision[][] = [];
  coordinator.trace = (decisions) => seen.push([...decisions]);
  observer.deliver([slot, 300, 0], [first, 150, 20], [second, 200, 20]);
  assert.deepEqual(switcher.writes, ["column"]);

  // The registrant stops counting a part: no box reports that.
  held.parts.delete(second);
  held.registration.invalidate();
  assert.deepEqual(switcher.writes, ["column", "row"]);
  assert.deepEqual(seen.at(-1), [
    {
      switcher,
      slot: 300,
      requirement: 150,
      arrangement: "row",
      written: true,
    },
  ]);

  // Nothing to compare: the arrangement is kept.
  held.parts.clear();
  held.registration.invalidate();
  assert.deepEqual(switcher.writes, ["column", "row"]);
});

test("a derived Switcher and its measured boxes are released separately", () => {
  const { coordinator, observer, switcher, slot, first, second, ...held } =
    derived();
  assert.equal(coordinator.size, 1);
  assert.deepEqual([...observer.targets], [slot, first, second]);
  assert.throws(
    () => coordinator.measure(first as unknown as Element, () => {}),
    /already observed/,
  );
  assert.throws(
    () =>
      coordinator.registerDerived({
        switcher: switcher as unknown as Element,
        slot: slot as unknown as Element,
        requirement: () => 0,
      }),
    /already registered/,
  );

  held.registration.unregister();
  held.registration.unregister();
  assert.equal(coordinator.size, 0);
  assert.deepEqual([...observer.targets], [first, second]);
  observer.deliver([slot, 300, 0], [first, 100, 20]);
  held.registration.invalidate();
  assert.equal(switcher.arrangement, null, "no longer decided");

  for (const stop of held.stops) stop();
  for (const stop of held.stops) stop();
  assert.equal(observer.targets.size, 0);
  observer.deliver([first, 120, 20]);
  assert.equal(held.parts.get(first), 100, "no longer received");
});
