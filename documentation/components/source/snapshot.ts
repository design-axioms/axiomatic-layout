/**
 * A snapshot: a composition written as text that can travel in a link.
 *
 * A snapshot holds what was authored and nothing else: groups with their
 * arrangements, and content with its roles and wording, in order. It has no
 * width, no selection and no history, so wherever it is opened the
 * composition responds to the space it finds there. A snapshot never
 * changes. Editing starts from a copy of what it holds.
 *
 * The text is versioned JSON, as UTF-8, in the URL-safe base64 alphabet with
 * no padding. Reading one is parsing and checking. Nothing in it is
 * evaluated, and the composition is built afresh from the six known kinds,
 * so no other field a link carried survives.
 *
 * This is not `Snapshot` in `working-copy.ts`, which is one state in a
 * working copy's Undo history.
 */
import type { Composition } from "./composition.ts";
import { restoreWorkingTree } from "./working-copy.ts";

/** The format written by `encodeSnapshot`, and the only one read. */
export const snapshotVersion = 1;

/**
 * The most characters a snapshot may have. A composition that needs more is
 * refused, never cut short, and a longer text is not read at all.
 */
export const snapshotLimit = 16_384;
/** Four characters carry three bytes. */
const byteLimit = Math.floor((snapshotLimit * 3) / 4);

/** Why a composition has no snapshot, or a text is not one. */
export type SnapshotProblem =
  /** It needs more than `snapshotLimit` characters. */
  | "too-large"
  /** The text is not this encoding of JSON: damaged, cut short or not one. */
  | "malformed"
  /** It states a version other than `snapshotVersion`. */
  | "unsupported-version"
  /** What it holds is not a composition a working copy accepts. */
  | "not-a-composition";

/** Thrown by `encodeSnapshot` and `decodeSnapshot`. Its message is for an author. */
export class SnapshotError extends Error {
  readonly problem: SnapshotProblem;
  constructor(problem: SnapshotProblem, message: string) {
    super(message);
    this.name = "SnapshotError";
    this.problem = problem;
  }
}

const urlSafe = /^[A-Za-z0-9_-]+$/;

function textOf(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

/** The bytes `text` stands for, when `text` is exactly how they are written. */
function bytesOf(text: string): Uint8Array | undefined {
  if (!urlSafe.test(text) || text.length % 4 === 1) return undefined;
  const binary = atob(text.replaceAll("-", "+").replaceAll("_", "/"));
  const bytes = Uint8Array.from(binary, (unit) => unit.charCodeAt(0));
  // Leftover bits in the last character would make two texts for one value.
  return textOf(bytes) === text ? bytes : undefined;
}

/**
 * Writes `tree` as a snapshot. Only the composition is written: anything
 * else the value carries is left out.
 *
 * Throws a `SnapshotError` when `tree` is not a composition a working copy
 * accepts, or when it needs more than `snapshotLimit` characters.
 */
export function encodeSnapshot(tree: Composition): string {
  const composition = restoreWorkingTree(tree);
  if (!composition)
    throw new SnapshotError(
      "not-a-composition",
      "Only a composition can be shared as a link.",
    );
  const tooLarge = () =>
    new SnapshotError(
      "too-large",
      "This composition is too large to share as a link. Shorten its wording or remove some of its content, then try again.",
    );
  const json = JSON.stringify({ version: snapshotVersion, composition });
  // Every character needs at least one byte.
  if (json.length > byteLimit) throw tooLarge();
  const bytes = new TextEncoder().encode(json);
  if (bytes.length > byteLimit) throw tooLarge();
  return textOf(bytes);
}

/**
 * Reads a snapshot. The result is a new composition each time, holding only
 * kinds, members and wording.
 *
 * Throws a `SnapshotError` for a text over `snapshotLimit`, a text that is
 * not this encoding, another version, or contents that are not a
 * composition a working copy accepts.
 */
export function decodeSnapshot(payload: string): Composition {
  const malformed = () =>
    new SnapshotError(
      "malformed",
      "This link is damaged or incomplete, so its composition cannot be opened. Ask for the link again.",
    );
  if (typeof payload !== "string") throw malformed();
  if (payload.length > snapshotLimit)
    throw new SnapshotError(
      "too-large",
      "This link is longer than a snapshot can be, so it was not opened.",
    );
  const bytes = bytesOf(payload);
  if (!bytes) throw malformed();
  let saved: unknown;
  try {
    saved = JSON.parse(
      new TextDecoder("utf-8", { fatal: true, ignoreBOM: true }).decode(bytes),
    );
  } catch {
    throw malformed();
  }
  if (!saved || typeof saved !== "object" || Array.isArray(saved))
    throw malformed();
  const record = saved as Record<string, unknown>;
  if (record.version !== snapshotVersion)
    throw new SnapshotError(
      "unsupported-version",
      "This link uses a snapshot format this playground cannot read. It may have been made by a newer version.",
    );
  const composition = restoreWorkingTree(record.composition);
  if (!composition)
    throw new SnapshotError(
      "not-a-composition",
      "This link does not hold a composition this playground can open.",
    );
  return composition;
}
