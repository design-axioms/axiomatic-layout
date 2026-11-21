# Plan: CSS-owned geometry and a shared Switcher coordinator

19 November 2026. Start with the [discussion plan](CSS-FIRST-DISCUSSION.md). Yehuda aligned on foundation first, then extending the lessons; outside-in nested behavior is now agreed after the Prettier comparison. The [axioms](CSS-FIRST-AXIOMS.md) preserve established direction. Runtime implementation is authorized and integrated. Fable implemented the shared coordinator; Codex owns integration, inspection, and browser qualification. The [runtime account](CSS-FIRST-RUNTIME.md) records the resulting contracts and evidence.

This sequence incorporates [Fable's completed review](../documentation/review/FABLE-CSS-FIRST-REVIEW.md). Codex adopts its reordered delivery and ownership. The sequence below retains its original predictions and exit criteria. The native targets, controlled requirement specimens and scoped nested CSS rules now pass the recorded Chromium/Safari fixtures; arbitrary-child generalizations remain open.

## Historical boundary and implementation ownership

[Gemini layout turn 23](../history/sources/gemini-layout.md#turn-23-user) rejects 2+1 wrapping; [turn 25](../history/sources/gemini-layout.md#turn-25-user) rejects externally supplied minimum widths; [turn 26](../history/sources/gemini-layout.md#turn-26-user) proposes a tiny shared observer with containment-ordered decisions. [Turn 39](../history/sources/gemini-layout.md#turn-39-user) calls for reuse across projects. Preserve those constraints; model sketches do not establish zero-cost measurements or convergence from sorting writes.

| Responsibility | Owner |
| --- | --- |
| Placement, sizing, flow, overflow and gap lengths | Primitive CSS |
| Tree edits and structural spacing metadata | Composition model/renderer, on tree changes |
| Atomic intrinsic Switcher decision | Shared coordinator with an explicit teaching requirement adapter |
| Edge drag, linking and saved width | Example interaction controller |
| Inspection fills, outlines and gaps | Real boxes and CSS; scoped anchors where needed |
| Code formatting and selection | Declaration renderer, responding to its own inputs |
| Width labels, Shelf accessibility, numeric captions | Small targeted consumers |

Primitive CSS and the coordinator must work on a bare page without teaching controls. This is a reuse check, not a published package or final API. Script may emit a structural level; CSS maps it to lengths, preserving today's spacing behavior.

## Preparation: predictions and fixtures

Codex prepares and runs fixtures; Fable supplies predictions. Cover flat/grouped Stack, scrolling Shelf, three unequal Switcher members, nested Switcher, Stack containing Switcher, and Switcher inside Shelf. Preserve authored state and record the guide with inspection on/off. Establish a reversible checkpoint of the current uncommitted source before production edits.

Test Fable's source-based predictions:
- Forcing only the outer probe clone into a row can cache a requirement affected by nested modes.
- Jumping directly from narrow to wide can leave an inner Switcher in a column because its measured width is content-sized in the new parent row. Compare slow drag, typed width, and mounting at that width.
- Deferring mode writes from ResizeObserver to a new frame can paint a stale arrangement.

**Exit:** runnable fixtures, observed/refuted predictions, comparable traces and current interaction evidence. The first two predictions were reproduced in the original runtime; see the fixture observations. Timing and paint behavior still need qualification.

## 1. Separable primitives and the shared coordinator

Fable implements the module; Codex runs fixtures, checks dependencies and integrates into the guide. Use the agreed outside-in collapse behavior. Define the teaching requirement and supported host before choosing the nested mechanism: the candidate is a browser-measured max-content row with nested Switchers in rows, independent of current rendered modes. Equality remains a row; qualify rounding behavior.

Investigate these native mechanisms together:

- One shared ResizeObserver watches registered availability and requirement targets. Cache delivered numbers; write only changed decisions.
- An independent inline-size target may avoid irrelevant notifications from mode-dependent block size.
- A persistent hidden requirement specimen may carry font, typography, density and nested changes as native observations. Restrict duplication to controlled teaching content; verify accessibility, style equivalence, lifecycle and scroll extent.
- A scoped CSS rule may place nested Switchers in rows where the approved requirement and unconstrained host contract imply that result. A broad descendant selector is not justified across arbitrary bounded hosts, slots or component boundaries.
- Browser depth-based redelivery may provide sufficient dependency progression. Do not assume callback entry order is a complete tree walk, that every descendant is redelivered, or that a fresh content-sized width is independent availability. Compare callback writes with a measured alternative; avoid speculative extra frames.

If those mechanisms establish correct ordering, omit a redundant ancestry graph. If they fail, investigate the smallest explicit dependency handling preserving the same contract. The shared-controller direction is fixed; a handwritten traversal is not a goal in itself.

Invalidation belongs here. At fixed width, test text replacement, insertion/removal, font readiness and later changes, typography, density/gap, nested requirements, mount/unmount and reparenting. Native observations carry invalidation only if relevant inputs reach the observed specimen. Hidden-to-visible transitions must not turn unavailable measurements into false fit decisions.

**Exit:** atomic unequal/nested behavior; consistent final arrangement across drag/type/mount under the initial policy; no stale settling, oscillation or observer-loop errors in fixtures; correct invalidation and cleanup; bare-page reuse works. Retire the guide's Switcher loop, transient probe and obsolete cache/font-reset paths. Move gap lengths into CSS as part of the primitive extraction.

## 2. Inspection on the real boxes

Codex implements; Fable reviews construction and browser evidence. Settle primitive markup first so inspection ignores measurement specimens.

Start with backgrounds, inset outlines and gap pseudo-elements. Use scoped anchors for decorations that need them. Preserve nested boundaries, gap cues, contiguous-run preview, hover versus persistent selection, source-to-box/box-to-source behavior, focus, dark/forced colors and Shelf clipping. Positioned decorations may enlarge scrollable overflow even without changing box size; test both.

Numeric captions may use targeted measurements when inputs change. They describe the effective arrangement, including approved CSS-derived modes, rather than blindly echoing a mode attribute.

**Exit:** decorations follow resizing/scrolling without per-node rectangle copying where CSS suffices. Toggling changes neither fit nor scroll extent. Retire SVG construction and replaced broad scroll/resize handlers. Name any remaining measured exception with its inputs, consumer, invalidation and reproduction.

## 3. Delete the general measurement loop

Codex removes obsolete paths; Fable reviews remaining dependencies. This replaces the original proposal to separate trigger paths for consumers about to be deleted.

Keep formatting on composition/code-width changes, selection on selection changes, readouts on relevant observations and Shelf accessibility on its actual overflow inputs. Preserve grip tracking, linked/independent widths and persistence.

**Exit:** the broad schedule/layout path is gone. Plain Stack resize performs no Switcher scan or overlay reconstruction; unchanged source is not rerendered during example dragging. Group/Ungroup, Undo, focus and reopened state remain correct. Every remaining geometry read has a named contract.

## Bounded probes alongside inspection

Fable predicts; Codex runs; both interpret. Test a sentence as a Switcher member and a child-owned native measure bound. Compare a copy-free measurement candidate on the unequal-child fixture. Describe limits without silently changing what “fits” means.

Arbitrary components, late-loading images, min-content policies and cross-shadow nested coordination remain named library-adapter work. Existing guide shadow-root hosting must still work. Controlled text duplication does not establish a generic component strategy. Bring results changing author obligations or visible behavior back to Yehuda.

## 4. Qualify, distill and return to teaching

Codex runs the reader; Fable reviews architecture and explanation. Verify narrow/wide slots, long/localized labels, keyboard editing/navigation, zoom, RTL/logical axes, linking, resize during selection, scrolling and reopening. Test scrollbar feedback near the switch point and native mitigation. Hysteresis intentionally changes path independence and requires an explicit behavior decision.

Run relevant model/controller tests, `pnpm check`, `pnpm format:check`, and `pnpm docs:build` with pinned Node 24/pnpm. Test claimed CSS behavior in Chromium, Firefox and Safari; identify unavailable-browser gaps. Compare equivalent traces: forced layouts, measurements, stale frames and visible settling.

**Exit:** demonstrate the preserved guide and one nested specimen, plus font/density changes in fixtures. No reader-facing density control is required. Retired consumers have no parallel production path. Record supported contracts, limitations, browser evidence and revised assumptions. Recommend the next arrangement experiment toward the editable playground.

## When a stage needs reconsideration

A replacement that cannot retire its predecessor is incomplete. Investigate and fix that locally within agreed behavior; report the concrete conflict if resolution changes scope, author obligations or reader experience. Routine implementation problems do not require another approval.
