import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DraftConflict,
  DraftStorage,
  type DraftStorageEnvironment,
} from "../documentation/components/source/draft-storage.ts";
import {
  Stack,
  type Composition,
} from "../documentation/components/source/composition.ts";
import { startWorkingCopy } from "../documentation/components/source/working-copy.ts";

const text = (wording: string): Composition => ({
  kind: "Text",
  text: wording,
});
function disk() {
  let value: string | null = null;
  let fail = false;
  let tail: Promise<unknown> = Promise.resolve();
  const environment: DraftStorageEnvironment = {
    read: () => value,
    write: (next) => {
      if (fail) throw new Error("Quota exceeded");
      value = next;
    },
    exclusive: <T>(action: () => T) => {
      const result = tail.then(action);
      tail = result.catch(() => {});
      return result;
    },
  };
  return {
    environment,
    fail: () => {
      fail = true;
    },
    replace: (next: string) => {
      value = next;
    },
  };
}

test("two stale editors cannot both overwrite the same draft", async () => {
  const { environment } = disk();
  const first = new DraftStorage(environment),
    second = new DraftStorage(environment);
  const workspace = await first.create(Stack(text("original")), "Notice");
  const base = workspace.drafts[0]!;
  const a = { ...base, copy: startWorkingCopy(Stack(text("first edit"))) };
  const b = { ...base, copy: startWorkingCopy(Stack(text("second edit"))) };
  const results = await Promise.allSettled([
    first.save(a, base),
    second.save(b, base),
  ]);
  assert.equal(results[0]!.status, "fulfilled");
  assert.equal(results[1]!.status, "rejected");
  if (results[1]!.status === "rejected")
    assert.ok(results[1]!.reason instanceof DraftConflict);
  assert.deepEqual(first.read()!.drafts[0]!.copy.model, a.copy.model);
});

test("different drafts merge against the latest workspace", async () => {
  const { environment } = disk();
  const store = new DraftStorage(environment);
  await store.create(Stack(text("a")), "A");
  const workspace = await store.create(Stack(text("b")), "B");
  const [a, b] = workspace.drafts;
  await Promise.all([
    store.save({ ...a!, name: "A revised" }, a),
    store.save({ ...b!, name: "B revised" }, b),
  ]);
  assert.deepEqual(
    store.read()!.drafts.map((d) => d.name),
    ["A revised", "B revised"],
  );
});

test("write failure retains the prior workspace and a recovered copy preserves history", async () => {
  const storage = disk();
  const store = new DraftStorage(storage.environment);
  const workspace = await store.create(Stack(text("one")), "Notice");
  const base = workspace.drafts[0]!;
  const copy = {
    model: Stack(text("two")),
    chosen: ["0.0"],
    undo: [{ model: base.copy.model, chosen: ["0"] }],
  };
  const recovered = await store.create(copy.model, "Notice", {
    copy,
    width: 540,
  });
  assert.equal(recovered.drafts[1]!.name, "Notice (2)");
  assert.deepEqual(recovered.drafts[1]!.copy, copy);
  assert.equal(recovered.drafts[1]!.width, 540);
  storage.fail();
  await assert.rejects(
    () => store.save({ ...base, name: "Lost write" }, base),
    /Quota/,
  );
  assert.deepEqual(store.read(), recovered);
});

test("unreadable existing data is never replaced by creating a draft", async () => {
  const storage = disk();
  const store = new DraftStorage(storage.environment);
  for (const bad of ['{"version":99}', "{broken"]) {
    storage.replace(bad);
    await assert.rejects(() => store.create(Stack(), "New"));
    assert.equal(storage.environment.read(), bad);
  }
});

function receipt() {
  let value: string | null = null;
  let fail = false;
  return {
    read: () => value,
    write: (next: string | null) => {
      if (fail) throw new Error("Recovery storage unavailable");
      value = next;
    },
    fail: () => {
      fail = true;
    },
  };
}

test("last removal survives a new storage instance; restoration merges later work", async () => {
  const diskState = disk(),
    recovery = receipt();
  const store = new DraftStorage(diskState.environment, recovery);
  const first = (await store.create(Stack(text("one")), "A")).drafts[0]!;
  const copy = {
    model: Stack(text("two")),
    chosen: ["0.0"],
    undo: [{ model: first.copy.model, chosen: ["0"] }],
  };
  const saved = (await store.save({ ...first, copy, width: 420 }, first))
    .drafts[0]!;
  const empty = await store.remove(saved);
  assert.deepEqual(empty, { version: 1, activeId: null, drafts: [] });
  const reopened = new DraftStorage(diskState.environment, recovery);
  assert.deepEqual(reopened.lastRemoval()!.draft, saved);
  const other = (await reopened.create(Stack(text("other")), "B")).drafts[0]!;
  await reopened.save({ ...other, name: "B revised" }, other);
  const restored = await reopened.undoRemoval();
  assert.deepEqual(restored.drafts[0], saved);
  assert.equal(restored.drafts[1]!.name, "B revised");
  assert.equal(restored.activeId, saved.id);
  assert.equal(reopened.lastRemoval(), undefined);
});

test("removal checks the latest draft before changing the previous receipt", async () => {
  const diskState = disk(),
    recovery = receipt();
  const store = new DraftStorage(diskState.environment, recovery);
  const a = (await store.create(Stack(), "A")).drafts[0]!;
  await store.remove(a);
  const b = (await store.create(Stack(), "B")).drafts[0]!;
  const originalReceipt = recovery.read();
  await store.save({ ...b, name: "B revised" }, b);
  await assert.rejects(() => store.remove(b), DraftConflict);
  assert.equal(recovery.read(), originalReceipt);
  assert.equal(store.read()!.drafts[0]!.name, "B revised");
});

test("failure to save a recovery copy prevents removal", async () => {
  const diskState = disk(),
    recovery = receipt();
  const store = new DraftStorage(diskState.environment, recovery);
  const workspace = await store.create(Stack(), "A");
  recovery.fail();
  await assert.rejects(
    () => store.remove(workspace.drafts[0]!),
    /Recovery storage/,
  );
  assert.deepEqual(store.read(), workspace);
});

test("durable write failure restores the prior removal receipt", async () => {
  const diskState = disk(),
    recovery = receipt();
  const store = new DraftStorage(diskState.environment, recovery);
  const a = (await store.create(Stack(), "A")).drafts[0]!;
  await store.remove(a);
  const workspace = await store.create(Stack(), "B");
  const previous = recovery.read();
  diskState.fail();
  await assert.rejects(() => store.remove(workspace.drafts[0]!), /Quota/);
  assert.deepEqual(store.read(), workspace);
  assert.equal(recovery.read(), previous);
});

test("restoration write failure leaves the removed draft available for retry", async () => {
  const diskState = disk(),
    recovery = receipt();
  const store = new DraftStorage(diskState.environment, recovery);
  const draft = (await store.create(Stack(), "A")).drafts[0]!;
  await store.remove(draft);
  diskState.fail();
  await assert.rejects(() => store.undoRemoval(), /Quota/);
  assert.deepEqual(store.lastRemoval()!.draft, draft);
  assert.equal(store.read()!.drafts.length, 0);
});

test("a failed receipt cleanup cannot undo a successful durable restoration", async () => {
  const diskState = disk(),
    recovery = receipt();
  const store = new DraftStorage(diskState.environment, recovery);
  const draft = (await store.create(Stack(), "A")).drafts[0]!;
  await store.remove(draft);
  recovery.fail();
  assert.deepEqual((await store.undoRemoval()).drafts[0], draft);
  assert.equal(store.lastRemoval(), undefined);
  await assert.rejects(() => store.undoRemoval(), /no removed draft/);
});

test("a readable removal remains recoverable while durable storage is unreadable", async () => {
  const diskState = disk(),
    recovery = receipt();
  const store = new DraftStorage(diskState.environment, recovery);
  const draft = (await store.create(Stack(), "A")).drafts[0]!;
  await store.remove(draft);
  diskState.replace("{broken");
  assert.deepEqual(store.lastRemoval()!.draft, draft);
  await assert.rejects(() => store.undoRemoval());
  assert.equal(diskState.environment.read(), "{broken");
  assert.deepEqual(store.lastRemoval()!.draft, draft);
});

test("a removal from another tab cannot replace this tab's recovery copy", async () => {
  const diskState = disk(),
    recovery = receipt();
  const first = new DraftStorage(diskState.environment, recovery);
  const second = new DraftStorage(diskState.environment, receipt());
  const a = (await first.create(Stack(), "A")).drafts[0]!;
  await first.remove(a);
  const b = (await first.create(Stack(), "B")).drafts[0]!;
  await second.remove(b);
  await assert.rejects(() => first.remove(b), /already removed/);
  assert.deepEqual(first.lastRemoval()!.draft, a);
});

test("capacity refusal retains recovery until room is freed in another tab", async () => {
  const diskState = disk(),
    recovery = receipt();
  const first = new DraftStorage(diskState.environment, recovery);
  const second = new DraftStorage(diskState.environment, receipt());
  const original = (await first.create(Stack(), "Original")).drafts[0]!;
  await first.remove(original);
  for (let i = 0; i < 20; i++) await second.create(Stack(), `Draft ${i}`);
  const before = first.read();
  await assert.rejects(() => first.undoRemoval(), /not restored/);
  assert.deepEqual(first.read(), before);
  assert.deepEqual(first.lastRemoval()!.draft, original);
  await second.remove(before!.drafts[0]!);
  const restored = await first.undoRemoval();
  assert.equal(restored.drafts.length, 20);
  assert.deepEqual(restored.drafts[0], original);
});

test("making room cannot silently replace a removal that no longer fits", async () => {
  const diskState = disk(),
    recovery = receipt();
  const store = new DraftStorage(diskState.environment, recovery);
  const original = (await store.create(Stack(), "Original")).drafts[0]!;
  await store.remove(original);
  for (let i = 0; i < 20; i++) await store.create(Stack(), `Draft ${i}`);
  const before = store.read()!;
  const oldReceipt = recovery.read();
  await assert.rejects(
    () => store.remove(before.drafts[0]!),
    /Original.*cannot currently be restored/,
  );
  assert.deepEqual(store.read(), before);
  assert.equal(recovery.read(), oldReceipt);
  const changed = await store.remove(before.drafts[0]!, true);
  assert.equal(changed.drafts.length, 19);
  assert.deepEqual(store.lastRemoval()!.draft, before.drafts[0]);
});

test("an unreadable old receipt needs an explicit replacement choice", async () => {
  const diskState = disk(),
    recovery = receipt();
  const store = new DraftStorage(diskState.environment, recovery);
  const workspace = await store.create(Stack(), "Current");
  recovery.write("{broken");
  await assert.rejects(
    () => store.remove(workspace.drafts[0]!),
    /entry cannot be read/,
  );
  assert.deepEqual(store.read(), workspace);
  assert.equal(recovery.read(), "{broken");
  await store.remove(workspace.drafts[0]!, true);
  assert.deepEqual(store.lastRemoval()!.draft, workspace.drafts[0]);
});
