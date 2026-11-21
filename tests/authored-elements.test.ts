import { test } from "node:test";
import assert from "node:assert/strict";
import { registerAuthoredComposition } from "../documentation/components/source/authored-elements.ts";
import { Switcher } from "../documentation/components/source/composition.ts";
import { mountComposition } from "../documentation/components/source/primitives.ts";
import { SwitcherCoordinator } from "../documentation/components/source/switcher-coordinator.ts";

/** The DOM operations the adapter and the renderer use. `detached` counts
 * every time the element left a parent, which is how a test sees a move. */
class FakeElement {
  readonly nodeType = 1;
  readonly nodeValue = null;
  /** Text and comment children. Their place among the elements is not
   * modelled: nothing under test depends on it. */
  readonly others: { nodeType: 3 | 8; nodeValue: string }[] = [];
  readonly tagName: string;
  readonly ownerDocument: FakeDocument;
  readonly attributes = new Map<string, string>();
  readonly children: FakeElement[] = [];
  parentElement: FakeElement | null = null;
  textContent = "";
  detached = 0;
  constructor(tagName: string, ownerDocument: FakeDocument) {
    this.tagName = tagName.toUpperCase();
    this.ownerDocument = ownerDocument;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  hasAttribute(name: string) {
    return this.attributes.has(name);
  }
  removeAttribute(name: string) {
    this.attributes.delete(name);
  }
  append(...added: FakeElement[]) {
    for (const child of added) {
      child.remove();
      child.parentElement = this;
      this.children.push(child);
    }
  }
  remove() {
    const siblings = this.parentElement?.children;
    if (!siblings) return;
    siblings.splice(siblings.indexOf(this), 1);
    this.parentElement = null;
    this.detached++;
  }
  replaceWith(next: FakeElement) {
    const parent = this.parentElement!;
    next.remove();
    parent.children[parent.children.indexOf(this)] = next;
    next.parentElement = parent;
    this.parentElement = null;
  }
  get childNodes() {
    return [...this.children, ...this.others];
  }
  get depth(): number {
    return this.parentElement ? this.parentElement.depth + 1 : 0;
  }
}
class FakeDocument {
  createElement(tagName: string) {
    return new FakeElement(tagName, this);
  }
}

/** A ResizeObserver whose deliveries the test controls. */
type Report = readonly [
  target: FakeElement,
  content: readonly [number, number],
  border: readonly [number, number],
];
class Deliveries {
  static created: Deliveries[] = [];
  readonly targets = new Set<FakeElement>();
  observations = 0;
  readonly #callback: ResizeObserverCallback;
  constructor(callback: ResizeObserverCallback) {
    this.#callback = callback;
    Deliveries.created.push(this);
  }
  observe(target: FakeElement) {
    this.targets.add(target);
    this.observations++;
  }
  unobserve(target: FakeElement) {
    this.targets.delete(target);
  }
  disconnect() {
    this.targets.clear();
  }
  deliver(...reports: Report[]) {
    const entries = reports.map(([target, content, border]) => ({
      target,
      contentBoxSize: [{ inlineSize: content[0], blockSize: content[1] }],
      borderBoxSize: [{ inlineSize: border[0], blockSize: border[1] }],
    }));
    this.#callback(
      entries as unknown as ResizeObserverEntry[],
      this as unknown as ResizeObserver,
    );
  }
}

const mechanical = "data-axiomatic-mechanical";
const arrangement = "data-axiomatic-arrangement";
const level = "data-axiomatic-level";

function setup() {
  const document = new FakeDocument();
  const coordinator = new SwitcherCoordinator(
    Deliveries as unknown as typeof ResizeObserver,
  );
  const observer = Deliveries.created.at(-1)!;
  const group = (kind: string, ...members: FakeElement[]) => {
    const element = document.createElement("div");
    element.setAttribute("data-axiomatic", kind);
    element.append(...members);
    return element;
  };
  const atom = (tagName = "button") => {
    const element = document.createElement(tagName);
    element.setAttribute("data-axiomatic-atom", "");
    return element;
  };
  const register = (root: FakeElement) =>
    registerAuthoredComposition(root as unknown as HTMLElement, coordinator);
  return { document, coordinator, observer, group, atom, register };
}

const added = (group: FakeElement, role: string) =>
  group.children.find((child) => child.getAttribute(mechanical) === role);
const authored = (group: FakeElement) =>
  group.children.filter((child) => !child.hasAttribute(mechanical));
function deepest(element: FakeElement): FakeElement {
  return element.children[0] ? deepest(element.children[0]) : element;
}

/** An atom's border box. Its content box is narrower, as a padded button's
 * is, so a test that passes is reading the border box. */
const wide = (target: FakeElement, inline: number): Report => [
  target,
  [inline - 24, 20],
  [inline, 32],
];
const gone = (target: FakeElement): Report => [target, [0, 0], [0, 0]];
/** A rendered group's ruler: its row gap, 1px tall. */
const gap = (group: FakeElement, inline: number): Report => {
  const row = added(group, "ruler")!.children[0]!;
  return [row, [inline, 1], [inline, 1]];
};
const slotOf = (group: FakeElement) => deepest(added(group, "slot")!);
/** A Switcher's slot: its content-box inline size at zero height. */
const slot = (group: FakeElement, inline: number): Report => [
  slotOf(group),
  [inline, 0],
  [inline, 0],
];
const mode = (group: FakeElement) => group.getAttribute(arrangement);

test("flat actions are one row while their border boxes and gaps fit the slot", () => {
  const { observer, group, atom, register } = setup();
  const [open, runs, alert] = [atom("a"), atom(), atom()];
  const actions = group("Switcher", open, runs, alert);
  register(actions);

  // 180 + 90 + 110 and two 14px gaps: a row needs 408px.
  const sizes = [
    wide(open, 180),
    wide(runs, 90),
    wide(alert, 110),
    gap(actions, 14),
  ];
  observer.deliver(...sizes, slot(actions, 408));
  assert.equal(mode(actions), "row", "a row that exactly fits is a row");
  observer.deliver(slot(actions, 407));
  assert.equal(mode(actions), "column");
  observer.deliver(slot(actions, 600));
  assert.equal(mode(actions), "row");

  assert.deepEqual(authored(actions), [open, runs, alert]);
  assert.deepEqual(
    [open, runs, alert, actions].map((element) => element.detached),
    [0, 0, 0, 0],
    "no authored element was moved",
  );
  for (const role of ["slot", "ruler"]) {
    const box = added(actions, role)!;
    assert.equal(box.getAttribute("aria-hidden"), "true");
    assert.ok(box.hasAttribute("inert"));
  }
});

test("at a fixed width, text, spacing and visibility each reach the decision", () => {
  const { observer, group, atom, register } = setup();
  const [open, runs, alert] = [atom(), atom(), atom()];
  const actions = group("Switcher", open, runs, alert);
  register(actions);
  observer.deliver(
    wide(open, 180),
    wide(runs, 90),
    wide(alert, 110),
    gap(actions, 14),
    slot(actions, 420),
  );
  assert.equal(mode(actions), "row");

  // Longer text, or a larger font.
  observer.deliver(wide(runs, 110));
  assert.equal(mode(actions), "column", "400 + 28 no longer fits 420");
  observer.deliver(wide(runs, 90));
  assert.equal(mode(actions), "row");

  // Density: two gaps of 24px.
  observer.deliver(gap(actions, 24));
  assert.equal(mode(actions), "column", "380 + 48 no longer fits 420");

  // A hidden action takes no room and no gap: 180 + 110 + 24.
  observer.deliver(gone(runs));
  assert.equal(mode(actions), "row");
  observer.deliver(wide(runs, 90));
  assert.equal(mode(actions), "column");
});

test("an inserted member counts after refresh; a removed one is released", () => {
  const { observer, group, atom, register } = setup();
  const [open, runs] = [atom(), atom()];
  const actions = group("Switcher", open, runs);
  const composition = register(actions);
  observer.deliver(
    wide(open, 180),
    wide(runs, 90),
    gap(actions, 14),
    slot(actions, 300),
  );
  assert.equal(mode(actions), "row");

  const alert = atom();
  actions.append(alert);
  assert.ok(!observer.targets.has(alert), "not measured before refresh");
  composition.refresh();
  assert.ok(observer.targets.has(alert));
  assert.equal(mode(actions), "row", "nothing to add until it is reported");
  observer.deliver(wide(alert, 110));
  assert.equal(mode(actions), "column");

  // The browser sends no report for a member that refresh released, so
  // refresh decides from the sizes already held.
  alert.remove();
  composition.refresh();
  assert.equal(mode(actions), "row");
  assert.ok(!observer.targets.has(alert));
});

test("a refresh that finds nothing changed observes and writes nothing", () => {
  const { observer, group, atom, register } = setup();
  const inner = group("Switcher", atom(), atom());
  const outer = group("Switcher", atom(), inner);
  const composition = register(outer);
  const boxes = [...outer.children, ...inner.children];
  const observations = observer.observations;
  const targets = [...observer.targets];
  composition.refresh();
  composition.refresh();
  assert.equal(observer.observations, observations);
  assert.deepEqual([...observer.targets], targets);
  assert.deepEqual([...outer.children, ...inner.children], boxes);
});

test("a nested Switcher contributes its own row, whatever it is doing now", () => {
  const { observer, group, atom, register } = setup();
  const [primary, first, second] = [atom(), atom(), atom()];
  const inner = group("Switcher", first, second);
  const outer = group("Switcher", primary, inner);
  register(outer);

  // Inner row: 100 + 120 + 14 = 234. Outer row: 200 + 14 + 234 = 448.
  const sizes = [
    wide(primary, 200),
    wide(first, 100),
    wide(second, 120),
    gap(outer, 14),
    gap(inner, 14),
  ];
  // Under a row, the inner Switcher is as wide as its own row.
  observer.deliver(...sizes, slot(outer, 448), slot(inner, 234));
  assert.deepEqual([mode(outer), mode(inner)], ["row", "row"]);

  // Outside in: the outer column gives the inner group the whole width.
  observer.deliver(slot(outer, 447));
  assert.equal(mode(outer), "column");
  observer.deliver(slot(inner, 447));
  assert.equal(mode(inner), "row", "the inner group stays intact");

  observer.deliver(slot(outer, 233), slot(inner, 233));
  assert.deepEqual([mode(outer), mode(inner)], ["column", "column"]);

  // Widening with the inner group still a column: the outer requirement is
  // the inner row, not the 120px the inner column now occupies.
  observer.deliver(slot(outer, 340), slot(inner, 340));
  assert.deepEqual([mode(outer), mode(inner)], ["column", "row"]);
  observer.deliver(slot(outer, 448));
  assert.equal(mode(outer), "row");
});

test("a Stack contributes its widest member and a Shelf its whole row", () => {
  const { observer, group, atom, register } = setup();
  const [label, first, second, third, last] = [
    atom("span"),
    atom(),
    atom(),
    atom(),
    atom(),
  ];
  const inner = group("Switcher", first, second);
  const stack = group("Stack", label, inner);
  const shelf = group("Shelf", third, last);
  const outer = group("Switcher", stack, shelf);
  register(outer);

  // Stack: max(150, 60 + 10 + 70) = 150. Shelf: 80 + 20 + 90 = 190.
  observer.deliver(
    wide(label, 150),
    wide(first, 60),
    wide(second, 70),
    wide(third, 80),
    wide(last, 90),
    gap(outer, 30),
    gap(stack, 8),
    gap(inner, 10),
    gap(shelf, 20),
    slot(outer, 370),
    slot(inner, 150),
  );
  assert.equal(mode(outer), "row", "150 + 30 + 190 fits 370");
  assert.equal(mode(inner), "row", "through the Stack, in the Stack's width");

  // The nested row now exceeds the label, so it sets the Stack's width.
  observer.deliver(wide(second, 90));
  assert.equal(mode(outer), "column", "160 + 30 + 190 does not fit 370");
});

test("groups above every Switcher are laid out by CSS alone", () => {
  const { coordinator, observer, group, atom, register } = setup();
  const root = group(
    "Stack",
    atom("h2"),
    group("Shelf", atom(), atom()),
    group("Stack"),
  );
  register(root);
  assert.equal(coordinator.size, 0);
  assert.equal(observer.targets.size, 0);
  const [, shelf, empty] = root.children as [
    FakeElement,
    FakeElement,
    FakeElement,
  ];
  for (const element of [root, shelf, empty])
    assert.deepEqual(element.children, authored(element), "nothing was added");
  assert.deepEqual(
    [root, shelf, empty].map((element) => element.getAttribute(level)),
    ["2", "1", "1"],
  );
});

test("empty and single-member groups are arranged and counted as authored", () => {
  const { observer, group, atom, register } = setup();
  const only = atom();
  const single = group("Switcher", only);
  const empty = group("Switcher");
  const hidden = group("Stack");
  const lead = atom();
  const outer = group("Switcher", lead, single, empty, hidden);
  register(outer);

  // A rendered empty group is a member of zero width that still has a gap
  // on each side; a group that is not rendered has neither.
  observer.deliver(
    wide(lead, 100),
    wide(only, 80),
    gap(outer, 10),
    gap(single, 10),
    gap(empty, 10),
    slot(outer, 200),
    slot(single, 80),
    slot(empty, 0),
  );
  assert.equal(mode(single), "row", "one member needs no gap");
  assert.equal(mode(empty), "row", "nothing needs no room");
  assert.equal(mode(outer), "row", "100 + 80 + 0 and two gaps fit 200");
  observer.deliver(slot(outer, 199));
  assert.equal(mode(outer), "column");

  // The Stack appears, empty: one more gap.
  observer.deliver(slot(outer, 200), gap(hidden, 10));
  assert.equal(mode(outer), "column", "three gaps do not fit 200");
  observer.deliver(gone(added(hidden, "ruler")!.children[0]!));
  assert.equal(mode(outer), "row");
});

test("a composition registered while hidden is decided when it is shown", () => {
  const { observer, group, atom, register } = setup();
  const [open, runs] = [atom(), atom()];
  const actions = group("Switcher", open, runs);
  register(actions);
  assert.equal(mode(actions), null, "nothing is published before a report");

  observer.deliver(
    wide(open, 180),
    wide(runs, 90),
    gap(actions, 14),
    slot(actions, 300),
  );
  assert.equal(mode(actions), "row");

  // display: none reports every box as 0x0.
  observer.deliver(
    gone(open),
    gone(runs),
    gone(added(actions, "ruler")!.children[0]!),
    gone(slotOf(actions)),
  );
  assert.equal(mode(actions), "row", "hiding is not a failure to fit");

  // Shown again, narrower.
  observer.deliver(
    wide(open, 180),
    wide(runs, 90),
    gap(actions, 14),
    slot(actions, 200),
  );
  assert.equal(mode(actions), "column");
});

test("each group states its structural level, and refresh keeps it current", () => {
  const { group, atom, register } = setup();
  const inner = group("Switcher", atom(), atom());
  const middle = group("Switcher", atom(), inner);
  const section = group("Stack", atom("h2"), middle);
  const page = group("Stack", section, group("Stack"));
  const root = group("Stack", page);
  const composition = register(root);
  const levels = () =>
    [inner, middle, section, page, root].map((element) =>
      element.getAttribute(level),
    );
  assert.deepEqual(levels(), ["1", "2", "3", "3", "3"]);
  assert.equal(root.children[0]!.children[1]!.getAttribute(level), "1");

  inner.remove();
  composition.refresh();
  assert.deepEqual(levels(), [null, "1", "2", "3", "3"]);
  assert.equal(added(inner, "slot"), undefined, "a group that left is cleaned");
  assert.equal(added(inner, "ruler"), undefined);
});

test("a nested slot is deeper than every box that can change a decision above it", () => {
  const { observer, group, atom, register } = setup();
  const [first, second] = [atom(), atom()];
  const inner = group("Switcher", first, second);
  const outer = group("Switcher", atom(), group("Stack", inner));
  const composition = register(outer);

  const check = () => {
    const slots = new Set([slotOf(outer), slotOf(inner)]);
    const measured = [...observer.targets].filter((box) => !slots.has(box));
    const deepestMeasured = Math.max(...measured.map((box) => box.depth));
    assert.ok(slotOf(outer).depth > deepestMeasured);
    assert.ok(slotOf(inner).depth > slotOf(outer).depth);
  };
  check();

  observer.deliver(
    ...[...authored(outer), first, second]
      .filter((element) => element.hasAttribute("data-axiomatic-atom"))
      .map((element) => wide(element, 100)),
    gap(outer, 10),
    gap(inner, 10),
    gap(authored(outer)[1]!, 10),
    slot(outer, 400),
    slot(inner, 210),
  );
  assert.deepEqual([mode(outer), mode(inner)], ["row", "row"]);

  // Deeper content arrives. The slots move below it, and each Switcher
  // keeps its arrangement until its new slot reports.
  const deep = group("Shelf", group("Stack", group("Stack", atom())));
  inner.append(deep);
  composition.refresh();
  check();
  assert.deepEqual([mode(outer), mode(inner)], ["row", "row"]);
  assert.deepEqual(authored(inner), [first, second, deep]);
});

test("disposal removes what was added, and the composition can be registered again", () => {
  const { coordinator, observer, group, atom, register } = setup();
  const [open, runs] = [atom(), atom()];
  const inner = group("Switcher", runs);
  const root = group("Stack", group("Switcher", open, inner));
  const outer = root.children[0]!;
  const composition = register(root);
  assert.equal(coordinator.size, 2);
  assert.throws(() => register(outer), /already belongs/);

  observer.deliver(
    wide(open, 100),
    wide(runs, 100),
    gap(outer, 10),
    gap(inner, 10),
    slot(outer, 300),
    slot(inner, 100),
  );
  composition.dispose();
  composition.dispose();
  composition.refresh();
  assert.equal(coordinator.size, 0);
  assert.equal(observer.targets.size, 0);
  for (const element of [root, outer, inner]) {
    assert.deepEqual(element.children, authored(element));
    assert.deepEqual([...element.attributes.keys()], ["data-axiomatic"]);
  }
  assert.deepEqual(
    [root, outer, inner, open, runs].map((element) => element.detached),
    [0, 0, 0, 0, 0],
  );

  const again = register(root);
  assert.equal(coordinator.size, 2);
  observer.deliver(
    wide(open, 100),
    wide(runs, 100),
    gap(outer, 10),
    gap(inner, 10),
    slot(outer, 209),
  );
  assert.equal(mode(outer), "column", "decided afresh: 210 does not fit");
  again.dispose();
});

test("a member that is neither a group nor an atom is refused before any change", () => {
  const { document, coordinator, observer, group, atom, register } = setup();
  const stray = document.createElement("p");
  const actions = group("Switcher", atom(), stray);
  assert.throws(() => register(actions), /group or an atom.*<p>/);
  assert.throws(() => register(stray), /starts at a group/);
  assert.deepEqual([...actions.attributes.keys()], ["data-axiomatic"]);
  assert.equal(actions.children.length, 2);
  assert.equal(coordinator.size, 0);
  assert.equal(observer.targets.size, 0);

  // A refresh that fails leaves the registration as it was.
  stray.setAttribute("data-axiomatic-atom", "");
  const composition = register(actions);
  const targets = [...observer.targets];
  actions.append(document.createElement("p"));
  assert.throws(() => composition.refresh(), /group or an atom/);
  assert.deepEqual([...observer.targets], targets);
});

test("a group that stops being a Switcher is no longer decided", () => {
  const { coordinator, observer, group, atom, register } = setup();
  const [open, runs] = [atom(), atom()];
  const actions = group("Switcher", open, runs);
  const composition = register(actions);
  observer.deliver(
    wide(open, 100),
    wide(runs, 100),
    gap(actions, 10),
    slot(actions, 300),
  );
  assert.equal(mode(actions), "row");
  actions.setAttribute("data-axiomatic", "Stack");
  composition.refresh();
  assert.equal(mode(actions), null);
  assert.equal(coordinator.size, 0);
  assert.equal(observer.targets.size, 0);
  assert.deepEqual(actions.children, [open, runs]);
});

test("authored and rendered compositions share one coordinator", () => {
  const { document, coordinator, observer, group, atom, register } = setup();
  const [open, runs] = [atom(), atom()];
  const actions = group("Switcher", open, runs);
  const composition = register(actions);
  const host = document.createElement("div");
  const mounted = mountComposition(
    host as unknown as Element,
    Switcher({ kind: "Text", text: "a" }, { kind: "Text", text: "b" }),
    coordinator,
  );
  assert.equal(Deliveries.created.at(-1), observer, "one observer");
  assert.equal(coordinator.size, 2);

  const rendered = mounted.switchers[0]!;
  const box = (element: Element, inline: number, block: number): Report => [
    element as unknown as FakeElement,
    [inline, block],
    [inline, block],
  ];
  observer.deliver(
    wide(open, 100),
    wide(runs, 100),
    gap(actions, 10),
    slot(actions, 300),
    box(rendered.slot, 100, 0),
    box(rendered.requirement, 200, 21),
  );
  assert.equal(mode(actions), "row");
  assert.equal(rendered.switcher.getAttribute(arrangement), "column");

  mounted.dispose();
  assert.equal(coordinator.size, 1);
  observer.deliver(slot(actions, 200));
  assert.equal(mode(actions), "column");
  composition.dispose();
  assert.equal(coordinator.size, 0);
});

test("a moved Switcher's slot is rebuilt to keep its depth below the one around it", () => {
  const { observer, group, atom, register } = setup();
  const [open, runs, follow] = [atom("a"), atom(), atom()];
  follow.setAttribute("aria-pressed", "true");
  const inner = group("Switcher", runs, follow);
  const oldParent = group("Stack", inner);
  // This equally deep sibling keeps the deepest measured box where it was,
  // so the depth wanted for the inner slot does not change.
  const peer = group("Stack", group("Stack", atom()));
  const outer = group("Switcher", open, oldParent, peer);
  const composition = register(outer);

  const check = () => {
    const slots = new Set([slotOf(outer), slotOf(inner)]);
    const measured = [...observer.targets].filter((box) => !slots.has(box));
    assert.ok(
      slotOf(outer).depth > Math.max(...measured.map((box) => box.depth)),
    );
    assert.ok(slotOf(inner).depth > slotOf(outer).depth);
  };
  check();
  observer.deliver(
    wide(open, 100),
    wide(runs, 100),
    wide(follow, 100),
    wide(deepest(peer), 100),
    gap(outer, 10),
    gap(oldParent, 10),
    gap(inner, 10),
    gap(peer, 10),
    gap(peer.children[0]!, 10),
    slot(outer, 430),
    slot(inner, 210),
  );
  assert.deepEqual([mode(outer), mode(inner)], ["row", "row"]);
  const wanted = slotOf(inner).depth;

  // The application moves the intact group one level up.
  oldParent.children.splice(oldParent.children.indexOf(inner), 1);
  outer.children.splice(outer.children.indexOf(oldParent), 0, inner);
  inner.parentElement = outer;
  composition.refresh();

  assert.equal(slotOf(inner).depth, wanted, "the same depth as before");
  check();
  assert.deepEqual(authored(inner), [runs, follow], "the same members");
  assert.equal(follow.getAttribute("aria-pressed"), "true");
  assert.deepEqual([runs.detached, follow.detached], [0, 0]);
  assert.equal(mode(inner), "row", "kept until the new slot reports");

  // 100 + (210) + 100 + 0 for the emptied Stack, and three gaps.
  observer.deliver(slot(outer, 439), slot(inner, 439));
  assert.deepEqual([mode(outer), mode(inner)], ["column", "row"]);
  observer.deliver(slot(outer, 440), slot(inner, 210));
  assert.equal(mode(outer), "row");
});

test("a member is taken up only after the composition it left has released it", () => {
  const { coordinator, observer, group, atom, register } = setup();
  const [open, runs, alert, moving] = [atom(), atom(), atom(), atom()];
  const source = group("Switcher", open, moving);
  const lead = group("Stack", atom("span"));
  const destination = group("Switcher", lead, runs, alert);
  const from = register(source);
  const to = register(destination);
  observer.deliver(
    wide(open, 100),
    wide(moving, 100),
    gap(source, 10),
    slot(source, 300),
    wide(authored(lead)[0]!, 50),
    wide(runs, 100),
    wide(alert, 100),
    gap(lead, 10),
    gap(destination, 10),
    slot(destination, 300),
  );
  assert.deepEqual([mode(source), mode(destination)], ["row", "row"]);

  const state = () => ({
    targets: [...observer.targets],
    size: coordinator.size,
    children: [...destination.children, ...lead.children],
    attributes: [destination, lead, runs, alert].map((element) => [
      ...element.attributes,
    ]),
  });
  // The moved atom comes after a group, which a partial pass would
  // already have changed.
  destination.append(moving);
  const before = state();
  assert.throws(() => to.refresh(), /atom already belongs to another/);
  assert.deepEqual(state(), before, "the refusal changed nothing");
  observer.deliver(slot(destination, 269));
  assert.equal(mode(destination), "column", "and it still decides");
  observer.deliver(slot(destination, 300));

  from.refresh();
  to.refresh();
  assert.ok(observer.targets.has(moving));
  observer.deliver(wide(moving, 100));
  assert.equal(mode(destination), "column", "270 and 100 + 10 exceed 300");
  assert.equal(mode(source), "row");

  // A group is released the same way, and disposal releases everything.
  source.append(lead);
  assert.throws(() => from.refresh(), /group already belongs to another/);
  to.dispose();
  from.refresh();
  assert.deepEqual(authored(source), [open, lead]);
  from.dispose();
  register(destination).dispose();
});

test("text placed directly in a group is refused; white space and comments are not", () => {
  const { coordinator, observer, group, atom, register } = setup();
  const actions = group("Switcher", atom(), atom());
  actions.others.push(
    { nodeType: 3, nodeValue: "\n    " },
    { nodeType: 8, nodeValue: " the secondary actions " },
  );
  const composition = register(actions);
  assert.equal(coordinator.size, 1);

  const targets = [...observer.targets];
  const stray = { nodeType: 3 as const, nodeValue: "\n  or  \n" };
  actions.others.push(stray);
  assert.throws(() => composition.refresh(), /not text of its own: "or"/);
  assert.deepEqual([...observer.targets], targets);

  // A no-break space is not white space the browser leaves out.
  stray.nodeValue = "\u00a0";
  assert.throws(() => composition.refresh(), /not text of its own/);
  stray.nodeValue = " ";
  composition.refresh();
  composition.dispose();

  const nested = group("Stack", group("Shelf", atom()));
  nested.children[0]!.others.push({ nodeType: 3, nodeValue: "Related" });
  assert.throws(() => register(nested), /authored Shelf .* not text/);
  assert.deepEqual([...nested.attributes.keys()], ["data-axiomatic"]);
});

test("a member inserted while hidden does not hold back a removal", () => {
  const { observer, group, atom, register } = setup();
  const [open, runs, alert] = [atom(), atom(), atom()];
  const actions = group("Switcher", open, runs, alert);
  const composition = register(actions);
  observer.deliver(
    wide(open, 180),
    wide(runs, 90),
    wide(alert, 110),
    gap(actions, 14),
    slot(actions, 300),
  );
  assert.equal(mode(actions), "column");

  // The browser never reports a box that is `display: none` from the
  // start, so nothing can wait for this one.
  const hidden = atom();
  alert.remove();
  actions.append(hidden);
  composition.refresh();
  assert.equal(mode(actions), "row", "180 + 90 + 14 fits 300");

  // Shown later, it reports and is counted.
  observer.deliver(wide(hidden, 60));
  assert.equal(mode(actions), "column");
});

test("an element that changes between atom and group stays in its composition", () => {
  const { observer, group, atom, register } = setup();
  const [open, more] = [atom(), atom()];
  const actions = group("Switcher", open, more);
  const composition = register(actions);
  observer.deliver(
    wide(open, 100),
    wide(more, 100),
    gap(actions, 10),
    slot(actions, 300),
  );

  // The atom becomes a group of two.
  more.removeAttribute("data-axiomatic-atom");
  more.setAttribute("data-axiomatic", "Shelf");
  const [first, second] = [atom(), atom()];
  more.append(first, second);
  composition.refresh();
  assert.throws(() => register(more), /already belongs/);
  assert.ok(!observer.targets.has(more));
  // Deeper content rebuilt the slot. A new target reports with the rest.
  observer.deliver(
    wide(first, 100),
    wide(second, 100),
    gap(more, 10),
    slot(actions, 319),
  );
  assert.equal(mode(actions), "column", "100 + 210 + 10 exceeds 319");

  // And back.
  first.remove();
  second.remove();
  more.setAttribute("data-axiomatic", "");
  more.setAttribute("data-axiomatic-atom", "");
  composition.refresh();
  assert.deepEqual(more.children, [], "its mechanical boxes are gone");
  assert.equal(more.getAttribute(level), null);
  observer.deliver(wide(more, 100), slot(actions, 210));
  assert.equal(mode(actions), "row");
  composition.dispose();
  register(group("Stack", more)).dispose();
});
