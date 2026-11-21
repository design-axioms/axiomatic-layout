import { registerAuthoredComposition } from "../../documentation/components/source/authored-elements.ts";
import { switcherCoordinator } from "../../documentation/components/source/switcher-coordinator.ts";
import { mountComposition } from "../../documentation/components/source/primitives.ts";
import {
  Stack,
  Switcher,
} from "../../documentation/components/source/composition.ts";
import "../../documentation/components/source/primitives.css";
import "../../documentation/components/source/authored-elements.css";
import "./experiment.css";
import "./checks.css";

// Qualification-only instrumentation: the application bundle never installs it.
const NativeObserver = window.ResizeObserver;
const observed: Set<Element>[] = [];
window.ResizeObserver = class extends NativeObserver {
  readonly targets = new Set<Element>();
  constructor(callback: ResizeObserverCallback) {
    super(callback);
    observed.push(this.targets);
  }
  override observe(target: Element, options?: ResizeObserverOptions) {
    this.targets.add(target);
    super.observe(target, options);
  }
  override unobserve(target: Element) {
    this.targets.delete(target);
    super.unobserve(target);
  }
  override disconnect() {
    this.targets.clear();
    super.disconnect();
  }
};
const nativeRect = Element.prototype.getBoundingClientRect;
let rectangleReads = 0;
Element.prototype.getBoundingClientRect = function () {
  rectangleReads++;
  return nativeRect.call(this);
};

type GroupKind = "Stack" | "Switcher" | "Shelf";
const stage = document.querySelector<HTMLElement>("#fixture-stage")!;
const reports: { name: string; passed: boolean; detail: string }[] = [];
const errors: string[] = [];
window.addEventListener("error", (event) => errors.push(event.message));
function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}
const settle = async (count = 5) => {
  for (let i = 0; i < count; i++) await new Promise(requestAnimationFrame);
};
// A task queued from rAF samples after that frame's layout and observer
// delivery. It does not establish what every compositor presentation showed.
function afterLayout(change: () => void): Promise<void> {
  return new Promise((resolve) =>
    requestAnimationFrame(() => {
      change();
      const channel = new MessageChannel();
      channel.port1.onmessage = () => {
        channel.port1.close();
        channel.port2.close();
        resolve();
      };
      channel.port2.postMessage(undefined);
    }),
  );
}
function button(label: string) {
  const el = document.createElement("button");
  el.type = "button";
  el.textContent = label;
  el.setAttribute("data-axiomatic-atom", "");
  return el;
}
function group(kind: GroupKind, ...children: HTMLElement[]) {
  const el = document.createElement("div");
  el.dataset.axiomatic = kind;
  el.append(...children);
  return el;
}
function members(el: Element) {
  return [...el.children].filter(
    (x): x is HTMLElement =>
      x instanceof HTMLElement &&
      (x.hasAttribute("data-axiomatic-atom") ||
        x.hasAttribute("data-axiomatic")) &&
      !x.hidden,
  );
}
function mode(el: HTMLElement) {
  return getComputedStyle(el).flexDirection;
}
function needed(el: HTMLElement): number {
  if (el.hasAttribute("data-axiomatic-atom"))
    return el.getBoundingClientRect().width;
  const children = members(el);
  if (el.dataset.axiomatic === "Stack")
    return Math.max(0, ...children.map(needed));
  const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
  return (
    children.reduce((sum, child) => sum + needed(child), 0) +
    Math.max(0, children.length - 1) * gap
  );
}
function fixture(root: HTMLElement, width = 1100, hidden = false) {
  const host = document.createElement("div");
  host.className = "test-host";
  host.style.inlineSize = `${width}px`;
  host.hidden = hidden;
  host.append(root);
  stage.append(host);
  let mounted = registerAuthoredComposition(root);
  return {
    host,
    root,
    get mounted() {
      return mounted;
    },
    width(value: number) {
      host.style.inlineSize = `${value}px`;
    },
    remount() {
      mounted.dispose();
      mounted = registerAuthoredComposition(root);
    },
    dispose() {
      mounted.dispose();
      host.remove();
    },
  };
}
async function check(name: string, run: () => void | Promise<void>) {
  try {
    await run();
    reports.push({ name, passed: true, detail: "Passed" });
  } catch (error) {
    reports.push({
      name,
      passed: false,
      detail: error instanceof Error ? error.message : String(error),
    });
  }
  const item = document.createElement("li");
  const report = reports.at(-1)!;
  item.textContent = `${report.passed ? "PASS" : "FAIL"} · ${name}: ${report.detail}`;
  document.querySelector("#reports")!.append(item);
}

async function run() {
  reports.length = 0;
  errors.length = 0;
  document.querySelector("#reports")!.replaceChildren();
  const coordinator = switcherCoordinator(document);
  const baseline = coordinator.size;
  await check(
    "Flat: equality, atomic layout, and route independence",
    async () => {
      const root = group(
        "Switcher",
        button("Open investigation session"),
        button("Other runs"),
        button("Alert in Vercel"),
      );
      const f = fixture(root);
      try {
        await settle();
        assert(
          mode(root) === "row",
          "Initial wide fixture must fit before measuring",
        );
        const requirement = needed(root);
        f.width(requirement);
        await settle();
        assert(
          mode(root) === "row",
          `Equality was ${mode(root)}; requirement ${requirement}`,
        );
        f.width(requirement - 2);
        await settle();
        assert(mode(root) === "column", "Below fit did not become column");
        const child = members(root);
        assert(
          child[0]!.getBoundingClientRect().top <
            child[1]!.getBoundingClientRect().top &&
            child[1]!.getBoundingClientRect().top <
              child[2]!.getBoundingClientRect().top,
          "Not all one column",
        );
        f.width(160);
        await settle();
        f.width(1100);
        await settle();
        assert(mode(root) === "row", "Jump narrow → wide stayed column");
        const ys = child.map((x) => x.getBoundingClientRect().top);
        assert(Math.max(...ys) - Math.min(...ys) < 1, "Not all one row");
        f.remount();
        await settle();
        assert(mode(root) === "row", "Mount and jump disagree");
      } finally {
        f.dispose();
      }
    },
  );
  for (const through of [false, true])
    await check(
      `Nested${through ? " through Stack" : ""}: outside-in and 120 width changes`,
      async () => {
        const inner = group(
          "Switcher",
          button("Other runs"),
          button("Alert in Vercel"),
          button("Follow investigation"),
        );
        const root = group(
          "Switcher",
          button("Open investigation session"),
          through ? group("Stack", inner) : inner,
        );
        const f = fixture(root);
        try {
          await settle();
          assert(
            mode(root) === "row" && mode(inner) === "row",
            "Wide fixture must fit before measuring requirements",
          );
          const outerNeed = needed(root),
            innerNeed = needed(inner);
          f.width((outerNeed + innerNeed) / 2);
          await settle();
          assert(
            mode(root) === "column" && mode(inner) === "row",
            `Expected column/row, got ${mode(root)}/${mode(inner)}`,
          );
          f.width(160);
          await settle();
          assert(mode(inner) === "column", "Inner never collapsed");
          f.width(1100);
          await settle();
          assert(
            mode(root) === "row" && mode(inner) === "row",
            "Nested direct jump failed",
          );
          for (let i = 0; i < 120; i++) {
            const width = 160 + (i % 60) * 16;
            const beforeReads = rectangleReads;
            await afterLayout(() => f.width(i < 60 ? width : 1264 - width));
            assert(
              rectangleReads === beforeReads,
              "Runtime read rectangles during adaptation",
            );
            const available = root.getBoundingClientRect().width;
            assert(
              mode(root) ===
                (outerNeed <= available + 1 / 16 ? "row" : "column"),
              `Outer wrong at ${available}`,
            );
            const innerSlot = available; // A column supplies its independent content slot; not the inner group’s own mode-dependent width.
            assert(
              mode(inner) ===
                (mode(root) === "row" || innerNeed <= innerSlot + 1 / 16
                  ? "row"
                  : "column"),
              `Inner wrong at ${available}`,
            );
          }
        } finally {
          f.dispose();
        }
      },
    );
  await check(
    "Focus, live state, handlers, and identity survive mutations",
    async () => {
      const follow = button("Follow investigation");
      follow.setAttribute("aria-pressed", "false");
      let clicks = 0;
      follow.addEventListener("click", () => {
        clicks++;
        follow.setAttribute("aria-pressed", String(clicks % 2 === 1));
      });
      const sibling = button("Other runs"),
        root = group("Switcher", follow, sibling, button("Alert"));
      const f = fixture(root, 600);
      try {
        await settle();
        assert(mode(root) === "row", "Focus test must start in row");
        follow.focus();
        follow.click();
        const originals = [...root.querySelectorAll("button")];
        f.width(160);
        await settle();
        assert(mode(root) === "column", "Focus test must enter column");
        f.width(900);
        await settle();
        assert(mode(root) === "row", "Focus test must recover row");
        f.width(needed(root) + 10);
        await settle();
        sibling.textContent =
          "Other investigation runs with a much longer label";
        await settle();
        assert(mode(root) === "column", "Long label must force a transition");
        f.mounted.refresh();
        await settle();
        assert(
          document.activeElement === follow,
          "Focus lost during resize/refresh",
        );
        assert(
          follow.getAttribute("aria-pressed") === "true",
          "Pressed state lost",
        );
        assert(
          root.querySelectorAll("button").length === originals.length &&
            originals.every(
              (node, i) => root.querySelectorAll("button")[i] === node,
            ),
          "Authored nodes replaced or duplicated",
        );
        const added = button("New related run");
        root.append(added);
        f.mounted.refresh();
        await settle();
        assert(
          document.activeElement === follow,
          "Focus lost on sibling insertion",
        );
        added.remove();
        f.mounted.refresh();
        await settle();
        follow.click();
        assert(
          clicks === 2 && follow.getAttribute("aria-pressed") === "false",
          "Handler lost or duplicated",
        );
        assert(
          document.activeElement === follow,
          "Focus lost on sibling removal",
        );
      } finally {
        f.dispose();
      }
    },
  );
  await check(
    "Fixed slot: labels, visibility, fonts, and spacing invalidate requirements",
    async () => {
      const a = button("Open session"),
        b = button("Other runs"),
        c = button("Alert");
      const root = group("Switcher", a, b, c),
        f = fixture(root);
      try {
        await settle();
        const initial = needed(root);
        f.width(initial + 10);
        await settle();
        assert(mode(root) === "row", "Initial fit failed");
        b.textContent = "Other investigation runs with a much longer label";
        await settle();
        assert(mode(root) === "column", "Label change did not invalidate");
        b.hidden = true;
        await settle();
        assert(mode(root) === "row", "Hidden member still contributes");
        b.hidden = false;
        b.textContent = "Other runs";
        await settle();
        root.style.setProperty("--axiomatic-space", "40px");
        await settle();
        assert(mode(root) === "column", "Gap change did not invalidate");
        root.style.removeProperty("--axiomatic-space");
        root.style.fontSize = "28px";
        await settle();
        assert(mode(root) === "column", "Font-size change did not invalidate");
        root.style.fontSize = "14px";
        await settle();
        assert(mode(root) === "row", "Smaller font did not recover");
      } finally {
        f.dispose();
      }
    },
  );
  await check(
    "A deep label change reaches nested modes in its first frame",
    async () => {
      const changed = button("Other runs");
      const inner = group("Switcher", changed, button("Follow investigation"));
      const root = group(
        "Switcher",
        button("Open session"),
        group("Stack", inner),
      );
      const f = fixture(root);
      try {
        await settle();
        const originalWidth = needed(root) + 1;
        f.width(originalWidth);
        await settle();
        assert(mode(root) === "row", "Initial actions do not fit");
        await afterLayout(() => {
          changed.textContent = "Other runs of the request-log investigation";
        });
        assert(
          mode(root) === "column",
          "Outer did not respond to its deep member",
        );
        const expected =
          needed(inner) <= originalWidth + 1 / 16 ? "row" : "column";
        assert(
          mode(inner) === expected,
          "Inner retained stale mode in the changed frame",
        );
        await afterLayout(() => {
          changed.textContent = "Other runs";
        });
        assert(
          mode(root) === "row" && mode(inner) === "row",
          "Shortening did not recover the nested row",
        );
      } finally {
        f.dispose();
      }
    },
  );
  await check(
    "Empty and singleton nested groups retain their identity",
    async () => {
      const empty = group("Switcher"),
        root = group("Switcher", button("Open session"), empty),
        f = fixture(root, 600);
      try {
        await settle();
        assert(
          empty.isConnected && empty.dataset.axiomatic === "Switcher",
          "Empty group erased",
        );
        const only = button("Other runs");
        empty.append(only);
        f.mounted.refresh();
        await settle();
        assert(
          empty.firstElementChild === only || empty.contains(only),
          "Singleton lost",
        );
        const last = button("Alert");
        empty.append(last);
        f.mounted.refresh();
        await settle();
        assert(
          mode(root) === "row" && mode(empty) === "row",
          "Refilled group does not fit",
        );
        only.remove();
        last.remove();
        f.mounted.refresh();
        await settle();
        assert(empty.isConnected, "Emptied group removed");
      } finally {
        f.dispose();
      }
    },
  );
  await check(
    "Hidden mount and reveal preserve a usable registration",
    async () => {
      const root = group(
          "Switcher",
          button("Open session"),
          button("Other runs"),
        ),
        f = fixture(root, 600, true);
      try {
        await settle();
        assert(
          root.getAttribute("data-axiomatic-arrangement") !== "row",
          "Hidden mount decided from zeros",
        );
        f.host.hidden = false;
        await settle();
        assert(mode(root) === "row", "Reveal did not fit");
        f.width(120);
        await settle();
        assert(mode(root) === "column", "Reveal registration stale");
      } finally {
        f.dispose();
      }
    },
  );
  await check(
    "Moving an intact group preserves its dependency depth and state",
    async () => {
      const follow = button("Following investigation");
      follow.setAttribute("aria-pressed", "true");
      const inner = group("Switcher", button("Other runs"), follow);
      const oldParent = group("Stack", inner);
      // This equally deep sibling keeps the global maximum depth unchanged.
      const peer = group("Stack", group("Stack", button("Alert")));
      const root = group("Switcher", button("Open session"), oldParent, peer);
      const f = fixture(root);
      const depth = (el: Element): number =>
        el.parentElement ? 1 + depth(el.parentElement) : 0;
      const slot = (el: Element): Element => {
        let node = [...el.children].find(
          (x) => x.getAttribute("data-axiomatic-mechanical") === "slot",
        )!;
        while (node.firstElementChild) node = node.firstElementChild;
        return node;
      };
      try {
        await settle();
        root.insertBefore(inner, oldParent);
        f.mounted.refresh();
        assert(
          depth(slot(inner)) > depth(slot(root)),
          "Moved inner slot lost its depth dependency",
        );
        follow.focus();
        await afterLayout(() => f.width(160));
        assert(
          mode(root) === "column" && mode(inner) === "column",
          "Moved group did not collapse",
        );
        await afterLayout(() => f.width(1100));
        assert(
          mode(root) === "row" && mode(inner) === "row",
          "Moved group did not expand",
        );
        assert(
          document.activeElement === follow &&
            follow.getAttribute("aria-pressed") === "true",
          "Adaptation after move lost focus or state",
        );
      } finally {
        f.dispose();
      }
    },
  );
  await check("Hidden nested groups reveal without a refresh", async () => {
    const inner = group(
      "Switcher",
      button("Other runs"),
      button("Follow investigation"),
    );
    inner.hidden = true;
    const root = group("Switcher", button("Open session"), inner);
    const f = fixture(root, 300);
    try {
      await settle();
      assert(
        getComputedStyle(inner).display === "none",
        "Authored hidden group is displayed",
      );
      assert(mode(root) === "row", "Hidden group consumes space");
      await afterLayout(() => {
        inner.hidden = false;
      });
      assert(
        mode(root) === "column",
        "Revealed group was not counted in its first frame",
      );
      await afterLayout(() => {
        inner.hidden = true;
      });
      assert(mode(root) === "row", "Hidden group still consumes space");
    } finally {
      f.dispose();
    }
  });
  await check(
    "Rebuilt nested slots decide inside a zero-width host",
    async () => {
      const inner = group("Switcher", button("Other runs"), button("Follow"));
      const wrapper = group("Stack", inner);
      const peer = group("Stack", group("Stack", button("Alert")));
      const root = group("Switcher", button("Open session"), wrapper, peer);
      const f = fixture(root);
      try {
        await settle();
        assert(mode(inner) === "row", "Initial inner does not fit");
        await afterLayout(() => {
          f.width(0);
          root.insertBefore(inner, wrapper);
          f.mounted.refresh();
        });
        assert(
          mode(root) === "column" && mode(inner) === "column",
          "A rebuilt zero-width slot kept its old row",
        );
        await afterLayout(() => f.width(1100));
        assert(
          mode(root) === "row" && mode(inner) === "row",
          "Zero-width registration did not recover",
        );
      } finally {
        f.dispose();
      }
    },
  );
  await check("Shelf contributes its independent row requirement", async () => {
    const shelf = group(
      "Shelf",
      button("Other runs"),
      button("Alert in Vercel"),
    );
    const root = group("Switcher", button("Open investigation session"), shelf),
      f = fixture(root);
    try {
      await settle();
      assert(
        mode(root) === "row",
        "Wide Shelf fixture must fit before measuring",
      );
      const required = needed(root);
      f.width(required - 3);
      await settle();
      assert(mode(root) === "column", "Outer ignored Shelf row requirement");
      f.width(required + 3);
      await settle();
      assert(mode(root) === "row", "Shelf requirement did not recover");
    } finally {
      f.dispose();
    }
  });
  await check(
    "Controlled renderer coexistence and complete lifecycle cleanup",
    async () => {
      const host = document.createElement("div");
      host.style.width = "600px";
      stage.append(host);
      const controlled = mountComposition(
        host,
        Stack(
          Switcher(
            { kind: "Text", text: "One" },
            { kind: "Text", text: "Two" },
          ),
        ),
      );
      const a = button("Follow"),
        root = group("Switcher", a, button("Open"));
      const f = fixture(root);
      try {
        await settle();
        assert(coordinator.size > baseline, "No shared registrations");
        assert(
          mode(controlled.switchers[0]!.switcher as HTMLElement) === "row",
          "Controlled renderer regressed",
        );
      } finally {
        f.dispose();
        controlled.dispose();
        host.remove();
      }
      assert(root.contains(a), "Disposal removed application content");
      assert(
        !root.querySelector("[data-axiomatic-mechanical]"),
        "Disposal leaked mechanical boxes",
      );
      assert(
        coordinator.size === baseline,
        `Leaked ${coordinator.size - baseline} registrations`,
      );
    },
  );
  await check(
    "Unmarked wrappers are rejected without changing application DOM",
    async () => {
      const wrapper = document.createElement("div");
      const child = button("Open session");
      wrapper.append(child);
      const root = group("Switcher", wrapper);
      stage.append(root);
      try {
        let rejected = false;
        try {
          const unexpected = registerAuthoredComposition(root);
          unexpected.dispose();
        } catch {
          rejected = true;
        }
        assert(
          rejected,
          "An unmarked wrapper was silently promoted to a group",
        );
        assert(
          root.firstElementChild === wrapper &&
            wrapper.firstElementChild === child,
          "Rejected input changed application nodes",
        );
        assert(
          !root.querySelector("[data-axiomatic-mechanical]"),
          "Rejected registration left targets",
        );
      } finally {
        root.remove();
      }
    },
  );
  await check(
    "Cross-registration transfers reject before mutation and recover",
    async () => {
      const moved = button("Follow investigation");
      const a = fixture(group("Switcher", moved, button("Open")));
      const b = fixture(group("Switcher", button("Other runs")));
      try {
        await settle();
        const added = group("Stack");
        b.root.append(added, moved);
        const targetsBefore = observed[0]!.size;
        let rejected = false;
        try {
          b.mounted.refresh();
        } catch {
          rejected = true;
        }
        assert(rejected, "Destination accepted an atom still owned by source");
        assert(
          !added.hasAttribute("data-axiomatic-level") && !added.children.length,
          "Failed destination refresh partly modified a group",
        );
        assert(
          observed[0]!.size === targetsBefore,
          "Failed refresh added observations",
        );
        a.mounted.refresh();
        b.mounted.refresh();
        await settle();
        assert(
          b.root.contains(moved) && mode(b.root) === "row",
          "Transfer did not recover after source release",
        );
      } finally {
        a.dispose();
        b.dispose();
      }
    },
  );
  await check("Unmarked direct text is rejected before registration", () => {
    const root = group("Switcher", button("Open"));
    root.append("This would be an unmeasured flex item");
    stage.append(root);
    try {
      let rejected = false;
      try {
        registerAuthoredComposition(root).dispose();
      } catch {
        rejected = true;
      }
      assert(rejected, "Bare text was silently excluded from the requirement");
      assert(
        !root.hasAttribute("data-axiomatic-level"),
        "Invalid text input was partly registered",
      );
    } finally {
      root.remove();
    }
  });
  await settle();
  await check(
    "One shared observer with no retained measurement targets",
    () => {
      assert(observed.length === 1, `Created ${observed.length} observers`);
      assert(
        observed[0]!.size === 0,
        `Retained ${observed[0]!.size} measurement targets`,
      );
    },
  );
  await check("No observer-loop or browser errors", () =>
    assert(errors.length === 0, errors.join("; ")),
  );
  const passed = reports.filter((r) => r.passed).length;
  document.querySelector("#result")!.textContent =
    `${passed}/${reports.length} passed`;
  document.querySelector("#json")!.textContent = JSON.stringify(
    { userAgent: navigator.userAgent, reports, errors },
    null,
    2,
  );
}
const runButton = document.querySelector<HTMLButtonElement>("#run")!;
runButton.addEventListener("click", () => {
  runButton.disabled = true;
  document.querySelector("#result")!.textContent = "Running…";
  void run()
    .catch((error: unknown) => {
      document.querySelector("#result")!.textContent = String(error);
    })
    .finally(() => {
      runButton.disabled = false;
    });
});
