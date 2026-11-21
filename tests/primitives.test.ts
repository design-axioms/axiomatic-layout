import { test } from "node:test";
import assert from "node:assert/strict";
import {
  example,
  Stack,
  Shelf,
  Switcher,
  type Composition,
} from "../documentation/components/source/composition.ts";
import {
  mountComposition,
  renderComposition,
  spacingLevels,
} from "../documentation/components/source/primitives.ts";
import { SwitcherCoordinator } from "../documentation/components/source/switcher-coordinator.ts";

/** The few DOM operations the renderer uses, with a tree tests can walk. */
class FakeElement {
  readonly tagName: string;
  readonly ownerDocument: FakeDocument;
  readonly attributes = new Map<string, string>();
  readonly children: FakeElement[] = [];
  parent: FakeElement | undefined;
  textContent = "";
  constructor(tagName: string, ownerDocument: FakeDocument) {
    this.tagName = tagName;
    this.ownerDocument = ownerDocument;
  }
  setAttribute(name: string, value: string) {
    this.attributes.set(name, value);
  }
  getAttribute(name: string) {
    return this.attributes.get(name) ?? null;
  }
  append(child: FakeElement) {
    child.remove();
    child.parent = this;
    this.children.push(child);
  }
  remove() {
    const siblings = this.parent?.children;
    siblings?.splice(siblings.indexOf(this), 1);
    this.parent = undefined;
  }
  replaceWith(next: FakeElement) {
    const parent = this.parent!;
    next.remove();
    parent.children[parent.children.indexOf(this)] = next;
    next.parent = parent;
    this.parent = undefined;
  }
}
class FakeDocument {
  createElement(tagName: string) {
    return new FakeElement(tagName, this);
  }
}
class IdleObserver {
  static observed = new Set<unknown>();
  observe(target: unknown) {
    IdleObserver.observed.add(target);
  }
  unobserve(target: unknown) {
    IdleObserver.observed.delete(target);
  }
  disconnect() {}
}

const text = (value: string): Composition => ({ kind: "Text", text: value });
const [a, b, c, d, e] = ["a", "b", "c", "d", "e"].map(text) as [
  Composition,
  Composition,
  Composition,
  Composition,
  Composition,
];

function render(value: Composition) {
  const rendered = renderComposition(
    value,
    new FakeDocument() as unknown as Document,
  );
  return {
    root: rendered.element as unknown as FakeElement,
    switchers: rendered.switchers as unknown as {
      switcher: FakeElement;
      slot: FakeElement;
      requirement: FakeElement;
    }[],
  };
}
const mechanical = (element: FakeElement) =>
  element.getAttribute("data-axiomatic-mechanical");
const descendants = (element: FakeElement): FakeElement[] =>
  element.children.flatMap((child) => [child, ...descendants(child)]);
const depth = (element: FakeElement): number =>
  element.parent ? depth(element.parent) + 1 : 0;
const within = (element: FakeElement, ancestor: FakeElement): boolean =>
  !!element.parent &&
  (element.parent === ancestor || within(element.parent, ancestor));
/** The composition a tree of boxes states, ignoring measurement boxes. */
function stated(element: FakeElement): unknown {
  const kind = element.getAttribute("data-axiomatic");
  const members = element.children.filter((child) => !mechanical(child));
  return element.getAttribute("data-axiomatic-level") === null
    ? { kind, text: element.textContent }
    : { kind, children: members.map(stated) };
}

test("structural spacing distinguishes nesting until the ceiling needs a cue", () => {
  const one = Stack(a, b);
  const two = Stack(one, c);
  const three = Stack(two, d);
  const four = Stack(three, e);
  for (const [tree, level, cue] of [
    [a, 0, false],
    [Stack(), 1, false],
    [one, 1, false],
    [two, 2, false],
    [three, 3, false],
    [four, 3, true],
    [example("article"), 3, true],
  ] as const) {
    const actual = spacingLevels(tree);
    assert.equal(actual.level, level);
    assert.equal(actual.cue, cue);
  }
  assert.equal(spacingLevels(four).children[0]!.cue, false);
  assert.deepEqual(spacingLevels(a).children, []);
});

test("real boxes keep native elements, reading order and the source mapping", () => {
  const { root } = render(example("article"));
  const real = [root, ...descendants(root)].filter(
    (element) => element.getAttribute("data-path") !== null,
  );
  assert.deepEqual(stated(root), example("article"));
  assert.deepEqual(
    real
      .slice(0, 6)
      .map((element) => [
        element.tagName,
        element.getAttribute("class"),
        element.getAttribute("data-kind"),
        element.getAttribute("data-path"),
      ]),
    [
      ["div", "node", "Stack", "0"],
      ["div", "node", "Stack", "0.0"],
      ["h3", "leaf", "Heading", "0.0.0"],
      ["p", "leaf", "Text", "0.0.1"],
      ["div", "node", "Shelf", "0.0.2"],
      ["p", "leaf", "Meta", "0.0.2.0"],
    ],
  );
  assert.deepEqual(
    [root, ...descendants(root)].filter(mechanical),
    [],
    "a composition without a Switcher has no measurement boxes",
  );
});

test("a group with one member or none keeps its box, level and Switcher decision", () => {
  const tree = Stack(Switcher(), Shelf(a), Stack(), Switcher(b));
  const { root, switchers } = render(tree);
  assert.deepEqual(stated(root), tree, "no group is dropped or merged");
  assert.deepEqual(
    root.children.map((child) => [
      child.getAttribute("data-path"),
      child.getAttribute("data-axiomatic-level"),
    ]),
    [
      ["0.0", "1"],
      ["0.1", "1"],
      ["0.2", "1"],
      ["0.3", "1"],
    ],
  );
  // A parent spaces its members as groups, whatever those groups hold.
  assert.equal(root.getAttribute("data-axiomatic-level"), "2");
  assert.deepEqual(spacingLevels(Stack(Stack())).level, 2);
  // Each Switcher is still decided: its requirement copy states what it
  // holds, and nothing stands in for missing content.
  assert.deepEqual(
    switchers.map(({ switcher, requirement }) => [
      switcher.getAttribute("data-path"),
      stated(requirement),
    ]),
    [
      ["0.0", Switcher()],
      ["0.3", Switcher(b)],
    ],
  );
  assert.deepEqual(
    switchers[0]!.switcher.children.map(mechanical),
    ["slot", "requirement"],
    "an empty Switcher holds only its measurement boxes",
  );
});

test("a boundary cue names the spacing level of the group it divides", () => {
  const { root } = render(Stack(Stack(Stack(Stack(a, b), c), d), e));
  const cues = (element: FakeElement) =>
    element.children.map((child) => child.getAttribute("data-axiomatic-cue"));
  assert.equal(root.getAttribute("data-axiomatic-level"), "3");
  assert.deepEqual(cues(root), [null, "3"]);
  assert.deepEqual(cues(root.children[0]!), [null, null], "below the ceiling");
});

test("each Switcher's requirement is its own row inside one hidden copy", () => {
  const tree = Stack(Switcher(Stack(Switcher(a, b), c), d), Switcher(e, a));
  const { root, switchers } = render(tree);
  assert.deepEqual(
    switchers.map(({ switcher }) => switcher.getAttribute("data-path")),
    ["0.0", "0.0.0.0", "0.1"],
    "outermost first",
  );
  const [outer, inner, sibling] = switchers as [
    (typeof switchers)[0],
    (typeof switchers)[0],
    (typeof switchers)[0],
  ];
  const holders = [root, ...descendants(root)].filter(
    (element) => mechanical(element) === "requirement",
  );
  assert.deepEqual(
    holders.map((holder) => holder.parent),
    [outer.switcher, sibling.switcher],
    "only outermost Switchers hold a copy",
  );
  // The copy states the same composition as the real subtree it stands for.
  assert.deepEqual(
    stated(outer.requirement),
    Switcher(Stack(Switcher(a, b), c), d),
  );
  assert.deepEqual(stated(inner.requirement), Switcher(a, b));
  assert.ok(within(inner.requirement, outer.requirement));
  assert.ok(!within(inner.requirement, inner.switcher));
  // Each Switcher has its own slot, a direct mechanical child of the real box.
  for (const { switcher, slot } of switchers) {
    assert.equal(mechanical(slot.parent!), "slot");
    assert.equal(slot.parent!.parent, switcher);
  }
});

test("measurement boxes are hidden from assistive technology and carry no authored identity", () => {
  const { root } = render(Stack(Switcher(Shelf(a, b), Switcher(c, d)), e));
  const boxes = [root, ...descendants(root)];
  const roots = boxes.filter(mechanical);
  assert.equal(roots.length, 3);
  for (const element of roots) {
    assert.equal(element.getAttribute("aria-hidden"), "true");
    assert.equal(element.getAttribute("inert"), "");
  }
  for (const element of roots.flatMap((element) => [
    element,
    ...descendants(element),
  ])) {
    for (const hook of [
      "class",
      "data-kind",
      "data-path",
      "data-axiomatic-cue",
    ])
      assert.equal(element.getAttribute(hook), null, hook);
  }
  // Real members are exactly the children that are not mechanical.
  const outer = root.children[0]!;
  assert.deepEqual(
    outer.children.map(
      (child) => child.getAttribute("data-path") ?? mechanical(child),
    ),
    ["0.0.0", "0.0.1", "slot", "requirement"],
  );
});

test("a nested slot is deeper than every box an enclosing Switcher is decided from", () => {
  // After an ancestor's decision the browser redelivers only deeper targets
  // in the same frame, so this ordering is what carries the dependency.
  const { switchers } = render(
    Switcher(Stack(Switcher(a, Switcher(b, c))), Shelf(Switcher(d, e)), a),
  );
  assert.equal(switchers.length, 4);
  let pairs = 0;
  for (const outer of switchers) {
    for (const inner of switchers) {
      if (!within(inner.switcher, outer.switcher)) continue;
      pairs++;
      assert.ok(depth(inner.slot) > depth(outer.slot));
      assert.ok(depth(inner.slot) > depth(outer.requirement));
    }
  }
  assert.equal(pairs, 4);
});

test("mounting registers Switchers, updating swaps them, disposing leaves nothing", () => {
  const document = new FakeDocument();
  const host = document.createElement("div");
  const neighbor = document.createElement("div");
  const coordinator = new SwitcherCoordinator(
    IdleObserver as unknown as typeof ResizeObserver,
  );
  const mounted = mountComposition(
    host as unknown as Element,
    Stack(Switcher(a, b), c),
    coordinator,
  );
  host.append(neighbor);
  const first = mounted.element as unknown as FakeElement;
  assert.equal(coordinator.size, 1);
  assert.equal(IdleObserver.observed.size, 2);

  mounted.update(Stack(Switcher(Switcher(a, b), c), Switcher(d, e)));
  const second = mounted.element as unknown as FakeElement;
  assert.notEqual(second, first);
  assert.deepEqual(host.children, [second, neighbor], "replaced in place");
  assert.equal(first.parent, undefined);
  assert.equal(coordinator.size, 3);
  assert.ok(
    [...IdleObserver.observed].every((target) =>
      within(target as FakeElement, second),
    ),
    "the previous tree is no longer observed",
  );

  mounted.dispose();
  assert.equal(coordinator.size, 0);
  assert.equal(IdleObserver.observed.size, 0);
  assert.deepEqual(host.children, [neighbor]);
});
