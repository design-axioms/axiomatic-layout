# Discussion: a dependable foundation for composing layouts

19 November 2026. Prepared with [Fable's completed review](../documentation/review/FABLE-CSS-FIRST-REVIEW.md), reconciled by Codex. Yehuda aligned on the first milestone: “Yes—foundation, then extend the lessons.” Yehuda subsequently agreed with outside-in nesting after comparing Prettier’s ordinary group behavior. Preparation can proceed within the existing text contract; broader prose semantics remain an explicit probe. The [axioms](CSS-FIRST-AXIOMS.md) preserve established direction; the [engineering sequence](CSS-FIRST-PLAN.md) supplies implementation detail.

The outcome we want is simple: a reader groups meaningful content, changes the space around it, and can understand why the result changes without adjusting individual gaps or choosing breakpoints. The implementation should make that promise easier to keep as examples become richer.

## 1. Agree on the first milestone

**Recommendation:** bring the current learning experience onto the CSS-first architecture, including nested Switchers and correct requirement invalidation. Preserve the editing, inspection, source selection, width controls, and saved compositions people can already use. Correct regressions and misleading behavior as we encounter them; preserve the learning affordances rather than every accidental detail of the current rendering. Finish by demonstrating the same authored composition through changes in width, content, and density.

This is a usable foundation for the library. The immediate deliverable remains the teaching runtime, with explicit supported child contracts. Generalizing its public API is a subsequent decision informed by the examples.

**Aligned:** this is the stopping point before returning to guided lessons toward a free composition playground. Richer child experiments inform the work; the general sizing API stays open. Primitive CSS and the coordinator should also run on a bare page without teaching controls, making reuse concrete without requiring a published package. Font and density changes can be tested on fixtures; this milestone adds no density control to the lesson.

## 2. Walk through the behavior we are protecting

Use the current real-text grouping exercise as the starting point. Begin with its four execution/remediation facts and group the related facts. Then use a prepared fixture with three unequal groups in a Switcher and another Switcher nested inside one group. This extension is a proposed verification specimen; the current editor does not yet offer arbitrary arrangement editing. It makes the dependency question concrete without promising a new editor feature in this milestone.

| Change we make | Intuition the reader should retain | Evidence we will gather |
| --- | --- | --- |
| Group two neighboring facts | A group becomes one member of its parent; its internal relationships remain visible | Tree, rendered boxes, code selection, undo and reopening agree |
| Narrow the available slot | Arrangement adapts to the content without an authored collision threshold | All three Switcher children share one row or one column; no 2+1 intermediate contract |
| Narrow a parent around a nested Switcher | Each group responds to the space it actually receives | Valid imposed-slot measurements and mode-independent requirements; content-sized children do not mistake their own current size for availability |
| Reach the same width by dragging, typing, or mounting there | Under the initial policy, the arrangement depends on content and space | The same final arrangement through each route; a nested mode cannot become stuck because it was measured in a different state |
| Change a label, font or density at fixed width | Content requirements matter independently of the container width | A changed requirement updates the fit decision without a window resize |
| Turn on structure and select a nested Text | Inspection reveals the same composition | Decorations follow real boxes and clipping without changing fit, scroll extent, or focus |

**Aligned: outside-in nesting.** For `Switcher(Switcher(a, b, c), d)`, begin with all four facts on one row. Fable recommends moving `d` below the first group when the outer row runs out of room, preserving the inner row `a b c` until that group also runs out of room. The alternative keeps the two outer members side by side by collapsing the inner group first.

Yehuda confirmed **outside-in** for the initial teaching policy: “I think that matches my intuition then.” It keeps each intact inner row until its own slot is insufficient. This is an agreed behavior choice; the shared-observer architecture alone does not imply it. A fresh width alone cannot settle it: in a content-sized parent row, a nested Switcher's width can depend on its own current mode.

**Discuss after that: the limit of “fits.”** A whole-sentence member can ask for a very wide max-content row. Recommend keeping that limitation explicit and using a bounded prose probe before the next arrangement lesson. Child-owned native measure bounds deserve investigation; authors should not have to supply guessed collision breakpoints.

The exact observer targets, delivery strategy, CSS construction and file boundaries remain implementation decisions. These two behavior questions supply the contract those decisions must fulfill.

## 3. Agree on how discoveries affect the work

We will use CSS for geometry and the shared registered Switcher coordinator for the exceptional atomic decision. This restates the agreed boundary. We will investigate the supported platform through Baseline Newly Available in 2026 at the feature subset actually used.

**Recommendation:** proceed autonomously through implementation alternatives that preserve the axioms and reader behavior. Bring a concrete example back when evidence would change what authors must declare or what readers experience—for example, requiring an authored minimum width, choosing a new paragraph-fit meaning, losing a useful inspection cue, or changing the supported browser target. Routine implementation choices and fixable failures remain ours to resolve.

The first adapter can retain the current explicit unwrapped text requirement. Compare paragraphs, late-loading images, and independently authored children to discover the limits of that contract. Record those limits; avoid silently presenting the teaching adapter as a universal sizing law.

## Autonomous execution after alignment

Codex retains integration ownership, operates the actual Fable session, and independently checks consequential claims. Fable receives complete implementation or review assignments with enough scope to produce an inspectable result. We will avoid concurrent edits to the same runtime files. The precise task split may change with what we learn.

| Stage | Proposed working arrangement | Evidence required before continuing |
| --- | --- | --- |
| Prepare fixtures and predictions | Fable specifies expected results; Codex runs and records them | Current behavior and nested sizing predictions are observed or refuted |
| Extract primitives and introduce the shared coordinator | Fable implements; Codex exercises fixtures and integrates | Bare-page reuse, atomic/nested switching, all invalidation cases and lifecycle cleanup work |
| Move inspection geometry to CSS | Codex implements; Fable reviews construction and captures | Nested selections, gaps and Shelf clipping stay correct without changing geometry or scroll extent; replaced SVG paths are deleted |
| Probe richer children alongside inspection | Fable predicts; Codex runs; both interpret | Prose and a copy-free measurement candidate expose concrete limits without silently changing the contract |
| Remove the general measurement loop | Codex implements; Fable reviews remaining dependencies | Plain Stack resize has no Switcher scan or overlay reconstruction; source, editing, focus and saved state remain correct |
| Qualify and distill | Codex exercises the reader; Fable reviews architecture and explanation | Comparable traces, meaningful tests, type checks and build pass; browser coverage is explicit |

Requirement invalidation and nested sizing are part of the coordinator stage, since the sizing policy affects the nested mechanism. Fable proposed this responsibility split in its review. Integration into shared runtime files remains serial. Implementation is complete within that authorization. The [runtime account](CSS-FIRST-RUNTIME.md) records the resulting contract and the private qualification record (`documentation/review/CSS-FIRST-QUALIFICATION.md`) distinguishes observed cases from remaining coverage.

We changed the order after Fable's review: creating separate trigger paths for the old Switcher and SVG consumers would create code we then remove. Prepare fixtures first, replace the consumers, then delete the general loop. Plain-box CSS comes before anchors when it meets the inspection contract.

At each stage, keep a compact record of the expected behavior, observed result, any revised assumption, and retired code. Compare the same drag with inspection on and off. Record forced layouts, measurement counts, settling and visible behavior; an observer count alone is insufficient.

The end-to-end check includes grouping and ungrouping, Undo, reopening, source-to-box and box-to-source selection, resize during selection, linked and independent widths, Shelf scrolling, three unequal Switcher children, nested mode changes, long/localized labels, keyboard use, zoom, RTL/logical axes, dark/forced colors, and the claimed browser support. Where a browser cannot be tested, report the unverified claim rather than treating a build as browser qualification.

After the milestone, demonstrate the preserved lesson and the nested case, summarize remaining limits, and recommend the next learning experiment. Our next product direction remains guided experiments that lead to a freely editable composition playground.

## Alignment and readiness record

- User-established baseline: CSS-owned geometry, intrinsic local adaptation, atomic Switcher, shared registered observer, modern TypeScript/ESM and the 2026 browser target.
- Milestone scope: aligned by Yehuda on 19 November 2026, foundation first and then lessons.
- Nested behavior: aligned on outside-in after the Prettier comparison. Ordinary nested groups break the outer group first, leaving inner groups flat while they fit.
- Broader prose sizing remains a bounded investigation, not a new universal contract.
- Fable review and reconciliation: completed. Fable agreed with Codex's qualification of the mechanisms and retained the content-sized-width caveat plus path independence outside a declared dead band. Codex adopted sequence, responsibilities and additional fixtures. See [collaboration status](../documentation/review/CSS-FIRST-REVIEW-STATUS.md).
- Preparation proceeds under the agreed milestone and outside-in behavior. Preserve the current text contract; bring a concrete changed author obligation or visible behavior back for discussion.
- Runtime implementation: explicitly authorized by Yehuda. Continue through coordinator validation and the CSS-first plan; return for discussion only when behavior or the authoring model would change.
- Preparation: current source inspected and a reversible snapshot saved under `.local/css-first/`. Fable supplied predictions; the [first browser fixtures](../documentation/review/css-first-fixtures/OBSERVATIONS.md) reproduced both nested history dependence and mode-dependent recalibration. Timing and replacement mechanisms remain to verify. PR creation follows agreement that a change is ready; merging remains a separate user decision.

- Milestone completed on 20 November: shared coordinator, independent requirements, CSS-owned geometry and inspection, invalidation and lifecycle checks, and the nested lesson are integrated. Fable's final review found no material acceptance flaw; Codex completed the two strict integrated checks. No behavior or composition-authoring change was needed. Classic scrollbar hosts must preserve an independent slot with a stable gutter; the pinned reader already does so. Firefox and arbitrary-child sizing remain unqualified. The next learning experiment is changing a group's arrangement while preserving its membership, leading toward the free composition playground.

## Arrangement experiment — 20 November 2026

After accepting the foundation milestone, Yehuda authorized the guided arrangement experiment with Fable: readers change a group's arrangement while preserving its membership, toward an editable playground. Fable implemented an explicit arrangement-only exercise after chapter 1's fixed examples; Codex independently exercised source, focus, nesting, history, persistence and responsive behavior. The experiment permits changing Stack/Shelf/Switcher at any group, including the root, while preserving all descendants and paths. Earlier grouping-only exercises retain their own validation and selection rules. Primitive geometry and the coordinator remain unchanged.

The next proposed experiment combines grouping and arrangement over the investigation's facts in chapter 3. It needs a coherent selection rule and saved-state validation for the combined operations; text editing and prominence remain separate. The private acceptance record is `documentation/review/ARRANGEMENT-ACCEPTANCE.md`.


## Combined investigation experiment — 20 November 2026

Yehuda authorized combining grouping and arrangement over the investigation facts, with Fable, as the next step toward the editable playground. This explicitly enables both operations in a new chapter 3 exercise; earlier focused exercises retain their own boundaries. Fable owns combined saved-state validation and interaction review; Codex owns integration, lesson and independent browser acceptance. Primitive layout and its sizing contract remain unchanged. Work and qualification are recorded in `documentation/review/INVESTIGATION-ACCEPTANCE.md`.


The combined investigation increment is complete. Fable's shared selection model and validator are integrated; Codex independently verified grouping/arrangement/nesting, history, reload, focus and selection stability in Chromium. The lesson makes the whole composition's persistent column explicit and asks readers to compare the inner groups' responses. All 47 tests, type checking, formatting and the docs build pass. The editor now offers structural exploration over fixed facts. Content editing, richer leaf contracts and prominence remain future experiments; they were not needed to complete this increment.

## Make it yours — authorized 20 November 2026

Yehuda authorized a working copy of the investigation composition with editable content and membership, preserving groups with zero or one member and rendering the same composition in a wide card and a narrow rail. The two views share authored state; each has its own independent slot and native layout. This explicitly supersedes the earlier suggestion to dissolve singleton groups. It does not change the qualified controlled-text sizing contract or settle the general spacing algebra.

Fable owns the working-copy model, UI and focused tests; Codex owns lesson integration, independent browser qualification and acceptance. Existing focused exercises keep their fixed-content validation. Copying the live investigation is explicit and independent; subsequent edits to it do not overwrite the working copy. Empty groups stay selectable through source, without placeholder leaves in primitive layout. The reversible checkpoint and Fable assignment are in `.local/`. Results are recorded in `documentation/review/MAKE-IT-YOURS-ACCEPTANCE.md`.

This increment is complete: live copying, text/membership edits, preserved empty/singleton groups, two independent slots, history and saved selection are integrated. Fable implemented the component and reviewed the visual refinement; Codex qualified the browser flows, preserved Shelf scroll state during wording edits, and completed the bounded sticky-inspector accessibility checks. Primitive sizing is unchanged. Moving intact groups across parents and portable saved compositions remain subsequent playground work.

## Moving intact members — authorized 20 November 2026

Yehuda authorized moving whole members and groups between parents in Make it yours, preserving their arrangements and making the change legible in both hosted views and the composition. This extends the working copy to explicit changes of parent and reading order; resizing continues to preserve authored relationships. Empty/singleton groups stay authored groups. He also requested Neon’s perspective and coordination with Fable.

Codex owns the shared direction, interaction implementation, lesson integration and independent browser acceptance. Fable owns relocation semantics/tests and reviews their UI integration. Neon independently reviews interaction/teaching and the finished implementation. They use separate model sessions and disjoint write ownership. Expectations and results are tracked in `documentation/review/MOVEMENT-ACCEPTANCE.md`.

The movement increment is complete. Fable's pure relocation model and 15 focused tests are integrated; Neon reviewed the interaction on the recovered Vercel route, and Fable reviewed model/UI integration. Codex reconciled the reviews and exercised real moves, parent distinctions, empty groups, keyboard focus, cancellation, Undo, reload, two-slot adaptation and forced-colors cues. The final focused-Shelf ring issue was reproduced and repaired in CSS. All 77 unit tests, type checking, formatting and the documentation build pass. The primitive runtime and coordinator are unchanged. See `documentation/review/MOVEMENT-ACCEPTANCE.md` for evidence, review disposition and limits. Portable saved compositions and the public authoring/sizing API remain separate subsequent work.


## Compose your own — authorized 20 November 2026

Yehuda authorized an undoable blank start, editable content kinds and direct creation of empty groups, with Fable and Neon. Heading, Text and Meta describe content roles; this increment does not introduce a prominence or urgency scale. Fable owns the pure editing model and focused tests, Neon reviews the interaction and teaching, and Codex owns UI integration and independent browser acceptance. Existing movement, empty/singleton preservation, two independent slots, saved state and Undo remain in scope. Primitive CSS and the coordinator remain unchanged. Acceptance is recorded in `documentation/review/COMPOSE-YOUR-OWN-ACCEPTANCE.md`.

This increment is complete. Fable implemented the pure operations and twelve tests; Neon reviewed the proposal and integration; Codex reconciled both reviews and qualified real blank-start, role, creation, movement, Undo, reload, keyboard and intrinsic-fit behavior. All 89 tests, type checking, formatting and the docs build pass. Readers can now begin with an empty group and build a new composition while comparing two real slots. Roles remain content purposes with stylesheet treatments, distinct from a prominence or urgency model. The local acceptance record carries detailed evidence and limits.


## Take it with you — authorized 20 November 2026

Yehuda authorized a standalone playground, durable drafts and shareable snapshots, developed with Fable and Neon. Hosting is explicitly a subsequent user decision once the local artifact is reviewable. Fable owns versioned serialization and draft model/tests; Neon reviews interaction; Codex owns integration and independent acceptance. Snapshot data contains authored composition only; opening a snapshot preserves existing work and editing creates a separate draft. The current undoable Start blank, content-role distinction and CSS-first runtime remain intact. See `documentation/review/TAKE-WITH-YOU-ACCEPTANCE.md`.

The local implementation is available for review. Fable delivered the pure snapshot/draft modules and 20 tests; Neon reviewed design and integration. Codex integrated persistence, conflict recovery, clipboard fallback, static routing and the standalone editor, and independently exercised the central browser flows. All 113 unit tests, type checking, formatting and the static build pass. Browser navigation stalled during the full lesson handoff check; fragment import itself passed, and that remaining end-to-end check is explicitly open. Hosting, cross-device links and additional-engine qualification remain open. Draft removal is a follow-up before broad use, because the current bounded store preserves at most 20 drafts and never evicts authored work.


## Dedicated Axiomatic site — authorized and locally qualified 20 November 2026

Yehuda chose a dedicated site with the guide and playground together, and authorized Fable/Neon collaboration to finish handoff validation and undoable draft removal before publication. This preserves the CSS-first runtime and authoring model. Fable implemented removal/restoration and the explicit empty workspace; Neon reviewed recovery and integration; Codex integrated and qualified the browser boundaries.

The complete guide-to-playground handoff now passes against the fixed-source static build, including Unicode, content roles, empty groups, existing drafts, reload without duplicate import and the prior removal receipt. Removal captures the whole draft before deleting it, offers persistent Undo removal through reload in that tab, and restores into the latest workspace. The last-draft state stays empty. Capacity and corrupt-receipt replacement require an explicit choice before losing an older recovery entry. Navigation races, two-tab recovery, failure refusal and narrow-screen controls are qualified in Chromium. All 133 tests pass; the acceptance record is `documentation/review/TAKE-WITH-YOU-ACCEPTANCE.md`.

The dedicated site's account/project/domain and publication remain open. The reviewable static artifact contains both surfaces; no host or billing scope has been selected implicitly. Cross-device hosted sharing and additional-engine qualification follow the hosting decision.


## Hosting — authorized 21 November 2026

Yehuda explicitly selected Vercel, project `axiomatic-layout` under Yehuda Katz’s projects, with `axiomatic-layout.vercel.app` if available, and authorized deployment plus hosted handoff/snapshot validation. That hostname was available and is now the production origin. The guide and playground share the deployed static artifact. The root opens the guide, while existing playground and version 1 snapshot paths remain stable. The hosting acceptance record is `documentation/review/HOSTED-ACCEPTANCE.md`.

## A clearer standalone editor — authorized 21 November 2026

Yehuda found the workbench interaction study substantially clearer and authorized integrating it into the real playground with Fable and Neon, preserving drafts, snapshots, undo and intact group movement. The accepted direction makes single selection ordinary, multi-selection explicit, hierarchy reachable through Outline or Code, and editing contextual to a named selection. Content roles remain distinct from prominence. The rounded selected box with its curved leading indicator is rejected; integration uses a flatter selection treatment with a separate keyboard-focus cue.

Fable owns the editor integration, Neon independently reviews interaction and preservation boundaries, and Codex owns outer document chrome, independent browser acceptance and reconciliation. The current model, storage format, snapshot reader and primitive layout contracts remain in force. The study is a source of interaction ideas, not a substitute for the production persistence/move controller. The checkpoint is `.local/workbench-integration-before`; acceptance is tracked in `documentation/review/WORKBENCH-INTEGRATION-ACCEPTANCE.md`.


The workbench integration is complete locally. Fable implemented the two editor presentations over the existing editing session, and Neon reviewed its preservation and interaction boundaries. Codex reconciled insertion/focus edge cases, verified old drafts and snapshots, removal/restoration, group moves, Undo, resizing, keyboard states, narrow/tall compositions and the full handoff on the fixed-source static site. All 137 tests, type checking, formatting and the static build pass. The selected row is flat, without the curved active accent. Existing storage/serialization/model and CSS-first primitive modules are unchanged. No new deployment has been made; detailed evidence and limits are in the linked acceptance record.


## Bring your own content: authorized 21 November 2026

Yehuda approved the next library experiment: the investigation's real actions first, then nested authored groups. Preserve application-owned DOM, native semantics, focus, state and CSS-first adaptation. Fable implements the adapter; Neon reviews its contract and interaction; Codex owns the consumer, independent qualification and PR integration. The existing guide renderer, playground, drafts and snapshots remain supported consumers.

The first child contract is non-wrapping, natural-width actions and labels. Test flat actions before nested Switcher/Stack arrangements, with independent requirements and outside-in decisions. No live interactive subtree may be duplicated for measurement or replaced on adaptation. A mechanical sizing representation is not automatically forbidden; any new measurement explains inputs, invalidation and consumer.

Application chrome may retain wrapping and authored thresholds; it is not the experiment's consumer. Use a separate investigation specimen, deriving hierarchy spacing structurally rather than requiring per-group gap choices. New names are provisional and packaging remains later work.

**Decision boundary:** bring Yehuda back in before selecting the prose sizing contract. Prose, images and independently bounded components are not part of this implementation authorization. PR publication/review follows the repository workflow; merge and production deployment remain separate actions.

The natural-action increment is implemented and qualified locally. Fable delivered the authored-element adapter and lifecycle repairs; Neon reviewed the consumer and contract; Codex independently exercised the application and both adapters. All 18 authored-content browser reports pass in Chromium and Safari, the existing controlled-content suite passes 130 reports in Chromium, and all 160 unit tests pass. The guide links to the standalone consumer. Prose sizing remains a user decision; merge and deployment remain separate from this qualification. The contract and limitations are recorded in [the runtime account](CSS-FIRST-RUNTIME.md#application-owned-actions).

## Wrapping prose — comparison authorized 22 November 2026

Yehuda authorized a guide experiment to decide how the investigation summary contributes to row fit beside its session link. Readers change one shared width and one wording across two examples. One policy asks for the full unbroken sentence in a row. The other gives the summary a preferred measure capped at 30ch. The cap is a candidate chosen for this comparison. A shorter sentence contributes only its own width.

Both examples have exactly two members, so ordinary flex line wrapping can show the alternatives. A general Switcher with three or more members still needs an atomic decision. Choosing a public prose contract, including whether the author supplies a measure, is a separate decision for Yehuda after trying the comparison.
