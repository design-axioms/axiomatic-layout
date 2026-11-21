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
  decodeSnapshot,
  encodeSnapshot,
  SnapshotError,
  snapshotLimit,
  type SnapshotProblem,
} from "../documentation/components/source/snapshot.ts";
import { workingCopyLimits } from "../documentation/components/source/working-copy.ts";

const text = (value: string): Composition => ({ kind: "Text", text: value });
const heading = (value: string): Composition => ({
  kind: "Heading",
  text: value,
});
const meta = (value: string): Composition => ({ kind: "Meta", text: value });
/** Node's own base64url, so the tests do not lean on the module's. */
const written = (value: string | Uint8Array) =>
  Buffer.from(value).toString("base64url");
const payloadOf = (value: unknown) => written(JSON.stringify(value));
const jsonIn = (payload: string) =>
  Buffer.from(payload, "base64url").toString("utf8");
const snapshot = (composition: unknown, version: unknown = 1) =>
  payloadOf({ version, composition });
/** A chain of `levels` Stacks, the innermost empty. */
const nested = (levels: number): Composition =>
  levels === 1 ? Stack() : Stack(nested(levels - 1));
function problem(action: () => unknown): SnapshotProblem | "no error" {
  try {
    action();
  } catch (error) {
    assert.ok(error instanceof SnapshotError, String(error));
    assert.ok(error.message.length > 20, "it says what happened");
    return error.problem;
  }
  return "no error";
}

const notice = Stack(
  heading("Repair café"),
  Switcher(text("Saturday"), text("10 am–1 pm"), meta("Updated today")),
  Shelf(),
  Stack(text("only member")),
);

test("a snapshot reads back as the composition it was written from", () => {
  for (const tree of [
    notice,
    Stack(),
    Switcher(Shelf(Stack())),
    example("article"),
    example("investigation"),
    nested(workingCopyLimits.ancestors + 1),
    Stack(
      ...Array.from({ length: workingCopyLimits.nodes - 1 }, (_, index) =>
        text(`Fact ${index}`),
      ),
    ),
  ]) {
    const payload = encodeSnapshot(tree);
    assert.match(payload, /^[A-Za-z0-9_-]+$/, "safe in a link's fragment");
    assert.ok(payload.length <= snapshotLimit);
    assert.deepEqual(decodeSnapshot(payload), tree);
    assert.equal(encodeSnapshot(tree), payload, "the same text every time");
    assert.equal(encodeSnapshot(decodeSnapshot(payload)), payload);
  }
});

test("the format is versioned JSON of the composition, in unpadded base64url", () => {
  const tree = Stack(heading("Title"), Switcher());
  assert.equal(
    encodeSnapshot(tree),
    written(
      '{"version":1,"composition":{"kind":"Stack","children":[{"kind":"Heading","text":"Title"},{"kind":"Switcher","children":[]}]}}',
    ),
  );
});

test("a snapshot carries the composition and nothing else", () => {
  // What an editor holds around a composition does not travel with it.
  const carrying = {
    kind: "Stack",
    width: 480,
    chosen: ["0.0"],
    undo: [{ model: Stack() }],
    children: [{ kind: "Text", text: "a", selected: true, id: "x1" }],
  } as unknown as Composition;
  const payload = encodeSnapshot(carrying);
  assert.equal(
    jsonIn(payload),
    '{"version":1,"composition":{"kind":"Stack","children":[{"kind":"Text","text":"a"}]}}',
  );
  assert.equal(payload, encodeSnapshot(Stack(text("a"))));
});

test("wording survives exactly, in any script", () => {
  const wordings = [
    "",
    " leading and trailing ",
    "Café — naïve façade",
    "修理カフェは土曜日です",
    "مقهى الإصلاح يوم السبت",
    "🛠️ Repair café 👩🏽‍🔧",
    "e\u0301 and \u00e9 stay different",
    "tab\tnewline\ncarriage\rreturn",
    "nul \u0000 and bell \u0007",
    "a lone surrogate \ud83d stays as typed",
    "\ufeffstarts with a byte order mark",
    "\u2028 and \u2029 line separators",
  ];
  const tree = Stack(...wordings.map(text));
  const payload = encodeSnapshot(tree);
  assert.match(payload, /^[A-Za-z0-9_-]+$/);
  assert.deepEqual(decodeSnapshot(payload), tree);
});

test("wording that looks like markup or code stays literal wording", () => {
  const wordings = [
    '<script>alert("x")</script>',
    '"><img src=x onerror=alert(1)>',
    "</code></pre><h1>not a heading</h1>",
    'Stack(Text("nested source"))',
    "${globalThis.location} `backticks`",
    '{"kind":"Stack","children":[]}',
    "__proto__",
    "javascript:alert(1)",
    "#snapshot=AAAA&edit=BBBB",
    "%3Cscript%3E + spaces & ampersands = signs",
    '\\u0000 \\n \\" backslashes',
  ];
  const tree = Stack(Switcher(...wordings.map(text)), heading(wordings[0]!));
  const read = decodeSnapshot(encodeSnapshot(tree));
  assert.deepEqual(read, tree);
  // Still six kinds of node and nothing more: none of it became structure.
  assert.deepEqual(
    "children" in read && read.children.map((member) => member.kind),
    ["Switcher", "Heading"],
  );
});

test("reading builds a new composition from known fields only", () => {
  const hostile = JSON.parse(
    `{
      "version": 1,
      "composition": {
        "kind": "Stack",
        "__proto__": { "polluted": true },
        "constructor": { "prototype": { "polluted": true } },
        "children": [
          { "kind": "Text", "text": "a", "children": [], "onclick": "x()" },
          { "kind": "Shelf", "children": [], "text": "ignored", "width": 900 }
        ],
        "chosen": ["0.0"],
        "width": 480
      },
      "undo": [{ "model": { "kind": "Stack", "children": [] } }],
      "width": 480,
      "then": "not a promise"
    }`,
  ) as unknown;
  const read = decodeSnapshot(payloadOf(hostile));
  assert.deepEqual(read, Stack(text("a"), Shelf()));
  assert.equal(
    JSON.stringify(read),
    '{"kind":"Stack","children":[{"kind":"Text","text":"a"},{"kind":"Shelf","children":[]}]}',
  );
  assert.equal(Object.getPrototypeOf(read), Object.prototype);
  assert.equal(({} as { polluted?: boolean }).polluted, undefined);

  const payload = encodeSnapshot(notice);
  assert.notEqual(decodeSnapshot(payload), decodeSnapshot(payload));
  assert.deepEqual(decodeSnapshot(payload), decodeSnapshot(payload));
});

test("a text that is not a snapshot is refused with its reason", () => {
  const good = encodeSnapshot(Stack(text("a")));
  const stack = { kind: "Stack", children: [] };
  for (const [payload, expected] of [
    ["", "malformed"],
    [`${good}=`, "malformed"],
    [`${good} `, "malformed"],
    [` ${good}`, "malformed"],
    [good.replace("e", "+"), "malformed"],
    [good.replace("e", "/"), "malformed"],
    [encodeURIComponent(`${good}==`), "malformed"],
    [`${good}&width=480`, "malformed"],
    [good.slice(0, -1), "malformed"],
    [good.slice(0, good.length >> 1), "malformed"],
    ["A", "malformed"],
    ["AB", "malformed"],
    [written("not json"), "malformed"],
    [written('{"version":1,"composition":'), "malformed"],
    [written(Uint8Array.of(0x7b, 0xff, 0xfe, 0x7d)), "malformed"],
    [
      written(`\ufeff${JSON.stringify({ version: 1, composition: stack })}`),
      "malformed",
    ],
    [payloadOf(null), "malformed"],
    [payloadOf("a string"), "malformed"],
    [payloadOf(7), "malformed"],
    [payloadOf([{ version: 1, composition: stack }]), "malformed"],
    [snapshot(stack, 2), "unsupported-version"],
    [snapshot(stack, 0), "unsupported-version"],
    [snapshot(stack, "1"), "unsupported-version"],
    [payloadOf({ composition: stack }), "unsupported-version"],
    [payloadOf(stack), "unsupported-version"],
    [payloadOf({ version: 1 }), "not-a-composition"],
    [snapshot(null), "not-a-composition"],
    [snapshot(text("a")), "not-a-composition"],
    [snapshot({ kind: "Grid", children: [] }), "not-a-composition"],
    [snapshot({ kind: "Stack" }), "not-a-composition"],
    [
      snapshot({ kind: "Stack", children: [{ kind: "Image", text: "a" }] }),
      "not-a-composition",
    ],
    [
      snapshot({ kind: "Stack", children: [{ kind: "Text", text: 7 }] }),
      "not-a-composition",
    ],
    [snapshot(nested(workingCopyLimits.ancestors + 2)), "not-a-composition"],
    [
      snapshot(
        Stack(
          ...Array.from({ length: workingCopyLimits.nodes }, () => text("a")),
        ),
      ),
      "not-a-composition",
    ],
    ["A".repeat(snapshotLimit + 1), "too-large"],
    [`${good}${"A".repeat(snapshotLimit)}`, "too-large"],
  ] as const)
    assert.equal(
      problem(() => decodeSnapshot(payload)),
      expected,
      payload.slice(0, 40),
    );
  assert.equal(
    problem(() => decodeSnapshot(undefined as unknown as string)),
    "malformed",
  );
  // A text with leftover bits in its last character is not how any value is written.
  assert.equal(jsonIn("e30"), "{}");
  assert.equal(jsonIn("e31"), "{}");
  assert.equal(
    problem(() => decodeSnapshot("e31")),
    "malformed",
  );
  assert.equal(
    problem(() => decodeSnapshot("e30")),
    "unsupported-version",
  );
});

test("a composition is written whole or not at all", () => {
  const bytes = Math.floor((snapshotLimit * 3) / 4);
  const fixed = jsonIn(encodeSnapshot(Stack(text("")))).length;

  const fits = Stack(text("a".repeat(bytes - fixed)));
  const payload = encodeSnapshot(fits);
  assert.equal(payload.length, snapshotLimit, "exactly at the limit");
  assert.deepEqual(decodeSnapshot(payload), fits);
  assert.equal(
    problem(() => encodeSnapshot(Stack(text("a".repeat(bytes - fixed + 1))))),
    "too-large",
  );

  // The limit is on the link, so wording outside ASCII uses it up faster.
  const accented = Math.floor((bytes - fixed) / 2);
  assert.deepEqual(
    decodeSnapshot(encodeSnapshot(Stack(text("é".repeat(accented))))),
    Stack(text("é".repeat(accented))),
  );
  assert.equal(
    problem(() => encodeSnapshot(Stack(text("é".repeat(accented + 1))))),
    "too-large",
  );
  assert.equal(
    problem(() => encodeSnapshot(Stack(text("a".repeat(1_000_000))))),
    "too-large",
  );

  for (const tree of [
    text("a"),
    nested(workingCopyLimits.ancestors + 2),
    Stack(...Array.from({ length: workingCopyLimits.nodes }, () => text("a"))),
    { kind: "Grid", children: [] } as unknown as Composition,
    undefined as unknown as Composition,
  ])
    assert.equal(
      problem(() => encodeSnapshot(tree)),
      "not-a-composition",
    );
});
