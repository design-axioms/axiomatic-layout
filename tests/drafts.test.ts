import { test } from "node:test";
import assert from "node:assert/strict";
import {
  Stack,
  Shelf,
  Switcher,
  type Composition,
} from "../documentation/components/source/composition.ts";
import {
  activateDraft,
  createDraft,
  DraftError,
  draftLimits,
  newDraftWidth,
  removeDraft,
  restoreDraftRemoval,
  restoreDraftWorkspace,
  restoreRemovedDraft,
  updateDraft,
  type Draft,
  type DraftProblem,
  type DraftRemoval,
  type DraftWorkspace,
} from "../documentation/components/source/drafts.ts";
import {
  decodeSnapshot,
  encodeSnapshot,
} from "../documentation/components/source/snapshot.ts";
import {
  addText,
  commitEdit,
  editText,
  removeMember,
  undoEdit,
  type WorkingCopy,
} from "../documentation/components/source/working-copy.ts";

const stored = (value: unknown): unknown => JSON.parse(JSON.stringify(value));
const text = (value: string): Composition => ({ kind: "Text", text: value });
const heading = (value: string): Composition => ({
  kind: "Heading",
  text: value,
});
const notice = Stack(
  heading("Repair café"),
  Switcher(text("Saturday"), text("10 am–1 pm")),
  Shelf(),
  Stack(text("only member")),
);
const list = Stack(text("milk"), text("eggs"));

function draft(workspace: DraftWorkspace, id: string): Draft {
  const found = workspace.drafts.find((item) => item.id === id);
  if (!found) throw new Error(`No draft ${id}`);
  return found;
}
function problem(action: () => unknown): DraftProblem | "no error" {
  try {
    action();
  } catch (error) {
    assert.ok(error instanceof DraftError, String(error));
    assert.ok(error.message.length > 20, "it says what happened");
    return error.problem;
  }
  return "no error";
}
/** A working copy after two edits, with a selection and two steps to undo. */
function edited(tree: Composition): WorkingCopy {
  let copy: WorkingCopy = { model: tree, chosen: ["0"], undo: [] };
  const added = addText(copy.model, { parent: "0", index: 0 }, "Added");
  copy = commitEdit(copy, added.tree, added.chosen);
  return commitEdit(copy, editText(copy.model, "0.0", "Reworded"), ["0.0"]);
}
/** A workspace of `count` drafts named and identified by number. */
function workspaceOf(count: number): DraftWorkspace {
  let workspace: DraftWorkspace | undefined;
  for (let index = 0; index < count; index++)
    workspace = createDraft(workspace, list, `Draft ${index}`, `id-${index}`);
  return workspace!;
}

test("the first draft holds the composition, ready to edit, with nothing to undo", () => {
  const workspace = createDraft(undefined, notice, "Café notice", "a");
  assert.deepEqual(workspace, {
    version: 1,
    activeId: "a",
    drafts: [
      {
        id: "a",
        name: "Café notice",
        copy: { model: notice, chosen: ["0"], undo: [] },
        width: newDraftWidth,
      },
    ],
  });
  assert.equal(undoEdit(draft(workspace, "a").copy), undefined);
  // An empty composition and an unnamed draft are both drafts.
  const blank = createDraft(undefined, Stack(), "", "b");
  assert.deepEqual(draft(blank, "b").copy.model, Stack());
  assert.equal(draft(blank, "b").name, "");
});

test("a new draft joins the others and opens, and none of them changes", () => {
  const one = createDraft(undefined, notice, "Café notice", "a");
  const before = stored(one);
  const two = createDraft(one, list, "Shopping", "b");
  assert.deepEqual(
    two.drafts.map((item) => item.id),
    ["a", "b"],
    "in the order they were made",
  );
  assert.equal(two.activeId, "b");
  assert.equal(draft(two, "a"), draft(one, "a"), "the same draft, untouched");
  assert.deepEqual(
    stored(one),
    before,
    "the earlier workspace is not rewritten",
  );
  assert.equal(one.activeId, "a");
});

test("saving one draft replaces its copy, width and name and nothing else", () => {
  const start = createDraft(
    createDraft(undefined, notice, "Café notice", "a"),
    list,
    "Shopping",
    "b",
  );
  const copy = edited(notice);
  const saved = updateDraft(start, "a", copy, 412.4);
  assert.deepEqual(draft(saved, "a"), {
    id: "a",
    name: "Café notice",
    copy,
    width: 412,
  });
  assert.equal(
    draft(saved, "b"),
    draft(start, "b"),
    "the other draft is untouched",
  );
  assert.equal(saved.activeId, "b", "saving does not open a draft");
  assert.deepEqual(
    draft(start, "a").copy.undo,
    [],
    "the earlier workspace stands",
  );

  const renamed = updateDraft(saved, "a", copy, 412, "Saturday café");
  assert.equal(draft(renamed, "a").name, "Saturday café");
  assert.deepEqual(draft(renamed, "a").copy, copy);
  // A name is kept as typed, including nothing at all and spaces mid-word.
  for (const name of ["", " ", "Café ", "  two  words  ", "修理カフェ 🛠️"])
    assert.equal(
      draft(updateDraft(saved, "a", copy, 412, name), "a").name,
      name,
    );
  // A width outside what the wide view can show is brought within it.
  assert.equal(draft(updateDraft(saved, "a", copy, 5), "a").width, 160);
  assert.equal(draft(updateDraft(saved, "a", copy, 5000), "a").width, 720);
});

test("each draft keeps its own composition, selection and Undo", () => {
  let workspace = createDraft(
    createDraft(undefined, notice, "Café notice", "a"),
    list,
    "Shopping",
    "b",
  );
  workspace = updateDraft(workspace, "a", edited(notice), 600);
  const removed = removeMember(list, "0.1");
  workspace = updateDraft(
    workspace,
    "b",
    commitEdit(draft(workspace, "b").copy, removed.tree, removed.chosen),
    600,
  );
  workspace = activateDraft(workspace, "a");

  const reopened = restoreDraftWorkspace(stored(workspace))!;
  const a = draft(reopened, "a").copy;
  const b = draft(reopened, "b").copy;
  assert.deepEqual(a.chosen, ["0.0"]);
  assert.deepEqual(b.chosen, ["0.0"]);
  assert.equal(a.undo.length, 2);
  assert.equal(b.undo.length, 1);
  // Undoing in one leaves the other where it was.
  assert.deepEqual(undoEdit(b)!.model, list);
  assert.deepEqual(undoEdit(b)!.chosen, ["0"]);
  assert.deepEqual(undoEdit(undoEdit(a)!)!.model, notice);
  assert.deepEqual(b.model, Stack(text("milk")));
  // Empty and one-member groups are still groups after saving.
  assert.deepEqual("children" in a.model && a.model.children.slice(3), [
    Shelf(),
    Stack(text("only member")),
  ]);
});

test("opening a draft changes which is open and nothing else", () => {
  const workspace = workspaceOf(3);
  const opened = activateDraft(workspace, "id-0");
  assert.equal(opened.activeId, "id-0");
  assert.equal(opened.drafts, workspace.drafts, "no draft was touched");
  assert.equal(workspace.activeId, "id-2");
  assert.equal(activateDraft(opened, "id-0"), opened, "already open");
  assert.equal(
    problem(() => activateDraft(workspace, "id-9")),
    "unknown-draft",
  );
  assert.equal(
    problem(() => updateDraft(workspace, "id-9", edited(list), 600)),
    "unknown-draft",
  );
});

test("a saved workspace reads back exactly, and writes the same text again", () => {
  let workspace = workspaceOf(3);
  workspace = updateDraft(workspace, "id-1", edited(notice), 348, "Café");
  workspace = activateDraft(workspace, "id-1");
  const text1 = JSON.stringify(workspace);
  const reopened = restoreDraftWorkspace(JSON.parse(text1) as unknown)!;
  assert.deepEqual(reopened, workspace);
  // A saved draft can be compared with a later reading of it as text.
  assert.equal(JSON.stringify(reopened), text1);
  assert.equal(
    JSON.stringify(restoreDraftWorkspace(reopened)),
    text1,
    "reading what was read changes nothing",
  );
});

test("reading keeps known fields, and settles what a draft's view and selection can be", () => {
  const saved = {
    version: 1,
    activeId: "a",
    theme: "dark",
    drafts: [
      {
        id: "a",
        name: "Café",
        width: 9000,
        pinned: true,
        copy: {
          model: {
            kind: "Stack",
            children: [{ kind: "Text", text: "a", id: 4 }],
          },
          chosen: ["0.7"],
          undo: [
            { model: { kind: "Grid" } },
            { model: Stack(), chosen: ["0"] },
          ],
          redo: [],
        },
      },
    ],
  };
  assert.deepEqual(restoreDraftWorkspace(stored(saved)), {
    version: 1,
    activeId: "a",
    drafts: [
      {
        id: "a",
        name: "Café",
        copy: {
          model: Stack(text("a")),
          chosen: [],
          undo: [{ model: Stack(), chosen: ["0"] }],
        },
        width: 720,
      },
    ],
  });
});

test("a workspace that cannot be read in full is not read at all", () => {
  const good = stored(workspaceOf(2)) as {
    version: unknown;
    activeId: unknown;
    drafts: Record<string, unknown>[];
  };
  const withDraft = (change: Record<string, unknown>) => ({
    ...good,
    drafts: [good.drafts[0], { ...good.drafts[1], ...change }],
  });
  assert.ok(restoreDraftWorkspace(good));
  for (const [saved, why] of [
    [null, "nothing saved"],
    ["{}", "a string"],
    [[good], "an array"],
    [{ ...good, version: undefined }, "no version"],
    [{ ...good, version: 0 }, "an earlier version"],
    [{ ...good, version: 2 }, "a later version"],
    [{ ...good, version: "1" }, "a version that is not a number"],
    [{ ...good, drafts: undefined }, "no drafts"],
    [
      { ...good, drafts: { 0: good.drafts[0], length: 1 } },
      "drafts not a list",
    ],
    [{ ...good, drafts: [] }, "a draft open with no drafts"],
    [{ version: 1, drafts: [] }, "no drafts, and no word on which is open"],
    [{ ...good, activeId: undefined }, "no open draft"],
    [{ ...good, activeId: null }, "drafts with none open"],
    [{ ...good, activeId: "id-9" }, "an open draft that is not there"],
    [{ ...good, activeId: 0 }, "an open draft named by position"],
    [
      { ...good, drafts: [good.drafts[0], good.drafts[0]] },
      "one identity twice",
    ],
    [{ ...good, drafts: [good.drafts[0], null] }, "a missing draft"],
    [{ ...good, drafts: [good.drafts[0], "id-1"] }, "a draft that is not one"],
    [withDraft({ id: "" }), "an empty identity"],
    [withDraft({ id: 7 }), "an identity that is not text"],
    [withDraft({ id: "x".repeat(65) }), "an overlong identity"],
    [withDraft({ name: undefined }), "no name"],
    [withDraft({ name: 7 }), "a name that is not text"],
    [withDraft({ name: "n".repeat(draftLimits.name + 1) }), "an overlong name"],
    [withDraft({ width: undefined }), "no width"],
    [withDraft({ width: "600" }), "a width that is not a number"],
    [withDraft({ width: null }), "a width JSON could not write"],
    [withDraft({ copy: undefined }), "no working copy"],
    [
      withDraft({ copy: { model: text("a") } }),
      "content as a whole composition",
    ],
    [
      withDraft({ copy: { model: { kind: "Grid", children: [] } } }),
      "an unknown kind",
    ],
    [
      withDraft({ copy: Stack() }),
      "a composition where a working copy belongs",
    ],
    [
      {
        ...good,
        drafts: Array.from({ length: draftLimits.drafts + 1 }, (_, index) => ({
          ...good.drafts[0],
          id: `many-${index}`,
        })),
        activeId: "many-0",
      },
      "more drafts than are kept",
    ],
    [
      withDraft({
        copy: { model: Stack(text("a".repeat(draftLimits.characters))) },
      }),
      "more than can be saved",
    ],
    // The lesson's own saved working copy is not a workspace.
    [{ model: Stack(), chosen: [], undo: [], width: 600 }, "a working copy"],
  ] as const)
    assert.equal(restoreDraftWorkspace(saved), undefined, why);
});

test("a twenty-first draft is refused, and the twenty stay as they were", () => {
  const full = workspaceOf(draftLimits.drafts);
  assert.equal(full.drafts.length, 20);
  const before = JSON.stringify(full);
  assert.equal(
    problem(() => createDraft(full, notice, "One more", "extra")),
    "too-many-drafts",
  );
  assert.equal(JSON.stringify(full), before);
  assert.deepEqual(restoreDraftWorkspace(stored(full)), full);
  // Existing drafts can still be saved and opened.
  assert.equal(
    draft(updateDraft(full, "id-3", edited(notice), 600), "id-3").copy.undo
      .length,
    2,
  );
  assert.equal(activateDraft(full, "id-0").activeId, "id-0");
});

test("a workspace is saved within its size or not changed", () => {
  const start = workspaceOf(2);
  const holding = (wording: number): WorkingCopy => ({
    model: Stack(text("a".repeat(wording))),
    chosen: [],
    undo: [],
  });
  const fixed = JSON.stringify(
    updateDraft(start, "id-0", holding(0), 600),
  ).length;
  const room = draftLimits.characters - fixed;

  const exact = updateDraft(start, "id-0", holding(room), 600);
  assert.equal(JSON.stringify(exact).length, draftLimits.characters);
  assert.deepEqual(restoreDraftWorkspace(stored(exact)), exact);

  assert.equal(
    problem(() => updateDraft(start, "id-0", holding(room + 1), 600)),
    "too-large",
  );
  // The full workspace takes no further draft, and still opens and saves smaller.
  assert.equal(
    problem(() => createDraft(exact, list, "", "c")),
    "too-large",
  );
  assert.equal(activateDraft(exact, "id-0").activeId, "id-0");
  assert.ok(updateDraft(exact, "id-0", holding(room - 10), 600));
  // History counts toward the size: it is saved too.
  const once = commitEdit(
    holding(room >> 1),
    Stack(text("b".repeat(room >> 1))),
    [],
  );
  assert.equal(
    problem(() => updateDraft(start, "id-0", once, 600)),
    "too-large",
  );
  assert.deepEqual(restoreDraftWorkspace(stored(start)), start, "as it was");
});

test("a draft needs a bounded name, its own identity and a real composition", () => {
  const start = createDraft(undefined, list, "Shopping", "a");
  const longest = "n".repeat(draftLimits.name);
  assert.equal(
    draft(createDraft(start, list, longest, "b"), "b").name,
    longest,
  );
  for (const [action, expected] of [
    [() => createDraft(start, list, `${longest}n`, "b"), "name"],
    [() => updateDraft(start, "a", edited(list), 600, `${longest}n`), "name"],
    [() => createDraft(start, list, "Again", "a"), "identity"],
    [() => createDraft(start, list, "Nameless", ""), "identity"],
    [() => createDraft(undefined, list, "Long", "x".repeat(65)), "identity"],
    [() => createDraft(start, text("a"), "Content", "b"), "composition"],
    [
      () =>
        createDraft(
          start,
          { kind: "Grid", children: [] } as unknown as Composition,
          "Grid",
          "b",
        ),
      "composition",
    ],
    [
      () =>
        updateDraft(
          start,
          "a",
          { model: text("a"), chosen: [], undo: [] },
          600,
        ),
      "composition",
    ],
    [() => updateDraft(start, "a", edited(list), Number.NaN), "width"],
    [
      () => updateDraft(start, "a", edited(list), Number.POSITIVE_INFINITY),
      "width",
    ],
  ] as const)
    assert.equal(problem(action), expected);
  assert.deepEqual(restoreDraftWorkspace(stored(start)), start, "as it was");
});

test("editing a snapshot makes a new draft, and neither the snapshot nor any draft changes", () => {
  const link = encodeSnapshot(notice);
  let workspace = createDraft(undefined, list, "Shopping", "mine");
  workspace = updateDraft(workspace, "mine", edited(list), 480);
  const mine = draft(workspace, "mine");

  workspace = createDraft(
    workspace,
    decodeSnapshot(link),
    "Snapshot copy",
    "copy",
  );
  assert.equal(workspace.activeId, "copy");
  assert.equal(draft(workspace, "mine"), mine, "work in progress is untouched");
  assert.deepEqual(draft(workspace, "copy").copy, {
    model: notice,
    chosen: ["0"],
    undo: [],
  });

  // Edit the copy; the link still opens what it always held.
  const removed = removeMember(draft(workspace, "copy").copy.model, "0.1");
  workspace = updateDraft(
    workspace,
    "copy",
    commitEdit(draft(workspace, "copy").copy, removed.tree, removed.chosen),
    600,
  );
  assert.notDeepEqual(draft(workspace, "copy").copy.model, notice);
  assert.deepEqual(decodeSnapshot(link), notice);
  assert.equal(encodeSnapshot(notice), link);
  // The same link opened again is a second draft, not a replacement.
  workspace = createDraft(
    workspace,
    decodeSnapshot(link),
    "Snapshot copy",
    "copy-2",
  );
  assert.deepEqual(
    workspace.drafts.map((item) => item.id),
    ["mine", "copy", "copy-2"],
  );
  assert.equal(draft(workspace, "mine"), mine);
  // A link written from a draft leaves its width, selection and history behind.
  assert.equal(
    encodeSnapshot(draft(workspace, "mine").copy.model),
    encodeSnapshot(Stack(text("Reworded"), text("milk"), text("eggs"))),
  );
});

/** Frozen all the way down, so any attempt to change it throws. */
function frozen<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    Object.freeze(value);
    for (const member of Object.values(value)) frozen(member);
  }
  return value;
}
const ids = (workspace: DraftWorkspace) =>
  workspace.drafts.map((item) => item.id);
/** A removal after its trip through the tab's storage. */
function kept(removed: DraftRemoval): DraftRemoval {
  const read = restoreDraftRemoval(stored(removed));
  if (!read) throw new Error("Expected a removal");
  return read;
}

test("removing a draft takes out exactly that draft and says where it stood", () => {
  const start = frozen(activateDraft(workspaceOf(4), "id-0"));
  const { workspace, removed } = removeDraft(start, "id-2");
  assert.deepEqual(ids(workspace), ["id-0", "id-1", "id-3"]);
  assert.equal(workspace.activeId, "id-0", "the open draft stays open");
  for (const id of ids(workspace))
    assert.equal(draft(workspace, id), draft(start, id), "untouched");
  assert.equal(removed.draft, draft(start, "id-2"), "the draft itself");
  assert.equal(removed.index, 2);
  assert.deepEqual(ids(start), ["id-0", "id-1", "id-2", "id-3"], "as it was");
  assert.deepEqual(restoreDraftWorkspace(stored(workspace)), workspace);
  assert.equal(
    problem(() => removeDraft(start, "id-9")),
    "unknown-draft",
  );
  assert.equal(
    problem(() => removeDraft(workspace, "id-2")),
    "unknown-draft",
    "it cannot be removed twice",
  );
});

test("removing the open draft opens the next one, or the one before the end", () => {
  const start = workspaceOf(3);
  const open = (id: string) =>
    removeDraft(activateDraft(start, id), id).workspace.activeId;
  assert.equal(open("id-0"), "id-1", "the draft that followed it");
  assert.equal(open("id-1"), "id-2");
  assert.equal(open("id-2"), "id-1", "at the end, the draft before it");
});

test("removing the last draft leaves a workspace with no drafts and none open", () => {
  const only = createDraft(undefined, notice, "Café notice", "a");
  const { workspace: empty, removed } = removeDraft(frozen(only), "a");
  assert.deepEqual(empty, { version: 1, activeId: null, drafts: [] });
  // It is saved and read as what it is; no blank draft stands in for it.
  assert.equal(
    JSON.stringify(empty),
    '{"version":1,"activeId":null,"drafts":[]}',
  );
  assert.deepEqual(restoreDraftWorkspace(stored(empty)), empty);

  for (const action of [
    () => removeDraft(empty, "a"),
    () => activateDraft(empty, "a"),
    () => updateDraft(empty, "a", edited(list), 600),
  ])
    assert.equal(problem(action), "unknown-draft");

  // A new draft and the removed one each start it again.
  const fresh = createDraft(empty, list, "Shopping", "b");
  assert.deepEqual(ids(fresh), ["b"]);
  assert.equal(fresh.activeId, "b");
  assert.deepEqual(restoreRemovedDraft(empty, kept(removed)), only);
  assert.deepEqual(
    restoreRemovedDraft(undefined, removed),
    only,
    "even when nothing is stored any more",
  );
});

test("work saved before drafts could be removed still reads as it was", () => {
  const before =
    '{"version":1,"activeId":"b","drafts":[' +
    '{"id":"a","name":"Café","copy":{"model":{"kind":"Stack","children":[{"kind":"Heading","text":"Repair café"},{"kind":"Switcher","children":[]}]},"chosen":["0.1"],"undo":[{"model":{"kind":"Stack","children":[]},"chosen":["0"]}]},"width":412},' +
    '{"id":"b","name":"","copy":{"model":{"kind":"Stack","children":[]},"chosen":["0"],"undo":[]},"width":600}]}';
  const read = restoreDraftWorkspace(JSON.parse(before) as unknown);
  assert.equal(JSON.stringify(read), before);
});

test("undoing a removal returns the whole draft, exactly, and opens it", () => {
  let start = workspaceOf(3);
  const copy = edited(notice);
  start = updateDraft(start, "id-1", copy, 412, " Saturday café ");
  start = activateDraft(start, "id-2");
  const original = draft(start, "id-1");

  const { workspace: reduced, removed } = removeDraft(start, "id-1");
  // Both sides are saved, as they are between a removal and its Undo.
  const reopened = restoreDraftWorkspace(stored(reduced))!;
  const restored = restoreRemovedDraft(frozen(reopened), frozen(kept(removed)));

  assert.deepEqual(draft(restored, "id-1"), original);
  assert.deepEqual(draft(restored, "id-1"), {
    id: "id-1",
    name: " Saturday café ",
    copy,
    width: 412,
  });
  assert.deepEqual(draft(restored, "id-1").copy.chosen, ["0.0"]);
  assert.equal(draft(restored, "id-1").copy.undo.length, 2);
  assert.deepEqual(ids(restored), ["id-0", "id-1", "id-2"], "in its old place");
  assert.equal(restored.activeId, "id-1", "the restored draft is opened");
  assert.deepEqual({ ...restored, activeId: "id-2" }, start);
  for (const id of ["id-0", "id-2"])
    assert.equal(draft(restored, id), draft(reopened, id), "untouched");
  assert.deepEqual(restoreDraftWorkspace(stored(restored)), restored);
});

test("undoing a removal leaves every later change to the other drafts in place", () => {
  const start = workspaceOf(4);
  const { workspace: reduced, removed } = removeDraft(start, "id-1");

  // Since the removal: one draft edited and renamed, one made, one opened.
  let later = updateDraft(reduced, "id-0", edited(notice), 348, "Reworked");
  later = createDraft(later, list, "Made since", "new");
  later = activateDraft(later, "id-3");
  const restored = restoreRemovedDraft(later, removed);
  assert.deepEqual(ids(restored), ["id-0", "id-1", "id-2", "id-3", "new"]);
  for (const id of ids(later))
    assert.equal(draft(restored, id), draft(later, id), "kept as it is now");
  assert.equal(draft(restored, "id-0").name, "Reworked");
  assert.deepEqual(draft(restored, "id-1"), removed.draft);

  // Its old neighbors may be gone. It takes its old position among the
  // drafts there now, or the end when there are fewer than that.
  const fewer = removeDraft(removeDraft(reduced, "id-0").workspace, "id-2");
  assert.deepEqual(ids(fewer.workspace), ["id-3"]);
  assert.deepEqual(ids(restoreRemovedDraft(fewer.workspace, removed)), [
    "id-3",
    "id-1",
  ]);
  const last = removeDraft(start, "id-3");
  const shorter = removeDraft(last.workspace, "id-0").workspace;
  assert.deepEqual(ids(restoreRemovedDraft(shorter, last.removed)), [
    "id-1",
    "id-2",
    "id-3",
  ]);
});

test("a removal is restored once, and never over a draft with its identity", () => {
  const start = workspaceOf(3);
  const { workspace: reduced, removed } = removeDraft(start, "id-1");
  const restored = restoreRemovedDraft(reduced, removed);
  const before = JSON.stringify(restored);
  assert.equal(
    problem(() => restoreRemovedDraft(frozen(restored), frozen(removed))),
    "already-restored",
  );
  assert.equal(JSON.stringify(restored), before);

  // A draft that has since taken the identity is kept; the removal is refused.
  const taken = updateDraft(
    createDraft(reduced, list, "Mine now", "id-1"),
    "id-1",
    edited(list),
    500,
  );
  assert.equal(
    problem(() => restoreRemovedDraft(taken, removed)),
    "already-restored",
  );
  assert.equal(draft(taken, "id-1").name, "Mine now");
  assert.equal(draft(taken, "id-1").copy.undo.length, 2);
  // The removal itself is unchanged, and still restores where it can.
  assert.deepEqual(ids(restoreRemovedDraft(reduced, removed)), ids(start));
});

test("removing makes room, and a removal with no room is refused whole", () => {
  // Twenty drafts: a new one needs a removal first.
  const full = workspaceOf(draftLimits.drafts);
  assert.equal(
    problem(() => createDraft(full, list, "One more", "extra")),
    "too-many-drafts",
  );
  const { workspace: nineteen, removed } = removeDraft(full, "id-7");
  const refilled = createDraft(nineteen, list, "One more", "extra");
  assert.equal(refilled.drafts.length, draftLimits.drafts);
  const before = JSON.stringify(refilled);
  try {
    restoreRemovedDraft(refilled, removed);
    assert.fail("restored past the limit");
  } catch (error) {
    assert.ok(error instanceof DraftError);
    assert.equal(error.problem, "too-many-drafts");
    assert.match(error.message, /not restored/);
  }
  assert.equal(JSON.stringify(refilled), before, "no draft was pushed out");
  assert.deepEqual(ids(restoreRemovedDraft(nineteen, removed)), ids(full));

  // A workspace at its size limit: the same, counted in characters.
  const holding = (wording: number): WorkingCopy => ({
    model: Stack(text("a".repeat(wording))),
    chosen: [],
    undo: [],
  });
  const two = workspaceOf(2);
  const room =
    draftLimits.characters -
    JSON.stringify(updateDraft(two, "id-0", holding(0), 600)).length;
  const exact = updateDraft(two, "id-0", holding(room), 600);
  assert.equal(
    problem(() => createDraft(exact, list, "", "c")),
    "too-large",
  );
  const large = removeDraft(exact, "id-0");
  assert.ok(createDraft(large.workspace, list, "", "c"), "there is room now");

  const grown = updateDraft(large.workspace, "id-1", edited(list), 600);
  const grownBefore = JSON.stringify(grown);
  try {
    restoreRemovedDraft(grown, large.removed);
    assert.fail("restored past the limit");
  } catch (error) {
    assert.ok(error instanceof DraftError);
    assert.equal(error.problem, "too-large");
    assert.match(error.message, /not restored/);
  }
  assert.equal(JSON.stringify(grown), grownBefore);
  const back = restoreRemovedDraft(large.workspace, kept(large.removed));
  assert.equal(JSON.stringify(back).length, draftLimits.characters);
  assert.deepEqual(draft(back, "id-0"), draft(exact, "id-0"));
});

test("a saved removal reads back exactly, and anything else is not one", () => {
  const start = updateDraft(
    workspaceOf(3),
    "id-1",
    edited(notice),
    412,
    "Café",
  );
  const { removed } = removeDraft(start, "id-1");
  const text1 = JSON.stringify(removed);
  assert.deepEqual(restoreDraftRemoval(JSON.parse(text1) as unknown), removed);
  assert.equal(JSON.stringify(restoreDraftRemoval(JSON.parse(text1))), text1);
  // Only the draft and its position are kept, read as a workspace reads them.
  assert.deepEqual(
    restoreDraftRemoval({
      version: 1,
      removedAt: "2026-11-20",
      index: 0,
      draft: {
        id: "a",
        name: "",
        width: 9000,
        pinned: true,
        copy: { model: Stack(text("a")), chosen: ["0.7"], redo: [] },
      },
    }),
    {
      draft: {
        id: "a",
        name: "",
        copy: { model: Stack(text("a")), chosen: [], undo: [] },
        width: 720,
      },
      index: 0,
    },
  );

  const good = stored(removed) as {
    draft: Record<string, unknown>;
    index: number;
  };
  const withDraft = (change: Record<string, unknown>) => ({
    ...good,
    draft: { ...good.draft, ...change },
  });
  for (const [saved, why] of [
    [null, "nothing saved"],
    ["{}", "a string"],
    [[good], "an array"],
    [good.draft, "a draft with no position"],
    [{ index: 1 }, "a position with no draft"],
    [{ ...good, draft: null }, "a missing draft"],
    [{ ...good, draft: "id-1" }, "an identity where a draft belongs"],
    [{ ...good, index: -1 }, "a position before the start"],
    [{ ...good, index: 1.5 }, "a position between drafts"],
    [
      { ...good, index: draftLimits.drafts },
      "a position no draft can have had",
    ],
    [{ ...good, index: "1" }, "a position that is not a number"],
    [{ ...good, index: null }, "a position JSON could not write"],
    [withDraft({ id: "" }), "an empty identity"],
    [withDraft({ name: "n".repeat(draftLimits.name + 1) }), "an overlong name"],
    [withDraft({ width: "412" }), "a width that is not a number"],
    [withDraft({ copy: undefined }), "no working copy"],
    [
      withDraft({ copy: { model: text("a") } }),
      "content as a whole composition",
    ],
    [
      withDraft({ copy: { model: { kind: "Grid", children: [] } } }),
      "an unknown kind",
    ],
    [
      withDraft({
        copy: { model: Stack(text("a".repeat(draftLimits.characters))) },
      }),
      "a draft no workspace could take back",
    ],
    // A workspace is not a removal, nor is a working copy.
    [stored(start), "a workspace"],
    [stored(removed.draft.copy), "a working copy"],
  ] as const)
    assert.equal(restoreDraftRemoval(saved), undefined, why);
});
