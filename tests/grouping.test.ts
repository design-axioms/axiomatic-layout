import { test } from "node:test";
import assert from "node:assert/strict";
import {
  example,
  Stack,
} from "../documentation/components/source/composition.ts";
import {
  atPath,
  groupingReason,
  neighboringMembers,
  groupMembers,
  ungroupMembers,
  restoreGrouping,
} from "../documentation/components/source/grouping.ts";

test("grouping preserves content and order, and ungrouping restores the original tree", () => {
  const initial = example("flat");
  const grouped = groupMembers(initial, ["0.1", "0.0"]);
  assert.equal(atPath(grouped, "0.0")?.kind, "Stack");
  assert.deepEqual(atPath(grouped, "0.0.0"), atPath(initial, "0.0"));
  assert.deepEqual(atPath(grouped, "0.1"), atPath(initial, "0.2"));
  assert.deepEqual(ungroupMembers(grouped, "0.0"), initial);
  assert.equal(atPath(initial, "0.0")?.kind, "Text");
});
test("an authored group composes with a neighboring leaf, then unwraps at either depth", () => {
  const initial = example("event");
  const pair = groupMembers(initial, ["0.0", "0.1"]);
  const larger = groupMembers(pair, ["0.0", "0.1"]);
  assert.equal(atPath(larger, "0.0.0")?.kind, "Stack");
  assert.deepEqual(ungroupMembers(larger, "0.0"), pair);
  const flattened = ungroupMembers(larger, "0.0.0");
  assert.deepEqual(atPath(flattened, "0.0.2"), atPath(initial, "0.2"));
});
test("nonadjacent, repeated, stale, different-level and redundant selections cannot edit", () => {
  const tree = example("nested");
  for (const paths of [
    ["0.0.0"],
    ["0.0", "0.0"],
    ["0.0.0", "0.1.0"],
    ["0.0", "0.0.0"],
    ["0.5", "0.6"],
    ["0.0", "0.1"],
  ]) {
    assert.ok(groupingReason(tree, paths));
    assert.throws(() => groupMembers(tree, paths));
  }
  assert.ok(groupingReason(example("flat"), ["0.0", "0.2"]));
  assert.throws(() => ungroupMembers(tree, "0"));
  assert.throws(() => ungroupMembers(tree, "0.0.0"));
});
test("valid saved regroupings restore while changed, reordered or pathological data is ignored", () => {
  const initial = example("flat");
  const grouped = groupMembers(initial, ["0.1", "0.2"]);
  assert.deepEqual(
    restoreGrouping(JSON.parse(JSON.stringify(grouped)), initial),
    grouped,
  );
  assert.equal(restoreGrouping(example("event"), initial), undefined);
  if (!("children" in initial)) throw new Error("Expected group");
  assert.equal(
    restoreGrouping(Stack(...[...initial.children].reverse()), initial),
    undefined,
  );
  assert.equal(
    restoreGrouping({ kind: "Stack", children: [initial] }, initial),
    undefined,
  );
  assert.equal(restoreGrouping(null, initial), undefined);
  assert.equal(atPath(initial, "0.-1"), undefined);
});

test("a continuous selection can span all siblings without permitting a redundant group", () => {
  const tree = example("flat");
  assert.equal(neighboringMembers(tree, ["0.3", "0.2", "0.1", "0.0"]), true);
  assert.ok(groupingReason(tree, ["0.0", "0.1", "0.2", "0.3"]));
  assert.equal(neighboringMembers(tree, ["0.0", "0.2"]), false);
  assert.equal(neighboringMembers(tree, ["0.0", "0.0"]), false);
  assert.equal(neighboringMembers(tree, ["0"]), false);
});
